"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  shaftStages,
  shaftSystemWaves,
  type ShaftStageId,
  type ShaftSystemId,
} from "@/app/lib/shaft-data";
import { systemWaves as weaveSoundWaves } from "@/app/lib/weave-data";
import { AnimatedDisplayText } from "./AnimatedDisplayText";
import { DevdarianiDisplayWordmark } from "./DevdarianiDisplayWordmark";
import { ProjectsThreshold } from "./ProjectsThreshold";
import { ShaftJourneyCanvas, type ShaftTheme } from "./ShaftJourneyCanvas";
import {
  useWeaveSoundscape,
  type WeaveSoundFrame,
} from "./spatial-sound";

const systemCallouts: readonly {
  descriptor: string;
  id: ShaftSystemId;
  label: string;
  zone: string;
}[] = [
  {
    descriptor: "Ductwork + ventilation",
    id: "hvac",
    label: "HVAC",
    zone: "Air movement",
  },
  {
    descriptor: "Cable containment",
    id: "electrical",
    label: "Electrical",
    zone: "Power distribution",
  },
  {
    descriptor: "Supply + return",
    id: "plumbing",
    label: "Plumbing",
    zone: "Water services",
  },
  {
    descriptor: "Flanged life-safety riser",
    id: "fire",
    label: "Fire protection",
    zone: "Life safety",
  },
  {
    descriptor: "Cabinet + control network",
    id: "bms",
    label: "BMS",
    zone: "Control + integration",
  },
] as const;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(min: number, max: number, value: number) {
  const normalized = clamp01((value - min) / Math.max(0.0001, max - min));
  return normalized * normalized * (3 - 2 * normalized);
}

function getActiveStage(progress: number) {
  for (let index = shaftStages.length - 1; index >= 0; index -= 1) {
    if (progress >= shaftStages[index].at) return index;
  }
  return 0;
}

function isSystemStage(stage: ShaftStageId): stage is ShaftSystemId {
  return stage !== "identity";
}

function getStageScrollTarget(stage: (typeof shaftStages)[number]) {
  return stage.id === "identity" ? 0 : Math.min(0.94, stage.at + 0.035);
}

function readShaftTheme(): ShaftTheme {
  return new URLSearchParams(window.location.search).get("theme") === "light"
    ? "light"
    : "dark";
}

function readServerShaftTheme(): ShaftTheme {
  return "dark";
}

function subscribeShaftTheme(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function mapJourneyProgressToSound(progress: number) {
  const system = systemCallouts.find(({ id }) => {
    const [start, end] = shaftSystemWaves[id];
    return progress >= start && progress <= end;
  });

  if (!system) {
    if (progress < shaftSystemWaves.hvac[0]) return 0;
    return weaveSoundWaves.bms[1] + (progress - shaftSystemWaves.bms[1]) * 0.08;
  }

  const [fromStart, fromEnd] = shaftSystemWaves[system.id];
  const [toStart, toEnd] = weaveSoundWaves[system.id];
  const local = clamp01((progress - fromStart) / (fromEnd - fromStart));
  return toStart + (toEnd - toStart) * local;
}

function applyScrubbedUnits(
  panel: HTMLElement,
  group: "title" | "statement",
  progress: number,
  range: readonly [number, number],
) {
  const units = panel.querySelectorAll<HTMLElement>(
    `[data-motion-group="${group}"] [data-motion-index]`,
  );
  const count = units.length;
  if (count === 0) return;

  const [start, end] = range;
  const span = end - start;
  const staggerWindow = span * (group === "title" ? 0.4 : 0.28);
  const unitDuration = Math.max(0.08, span - staggerWindow);

  units.forEach((unit, index) => {
    const stagger = count <= 1 ? 0 : (index / (count - 1)) * staggerWindow;
    const reveal = smoothstep(start + stagger, start + stagger + unitDuration, progress);
    const inverse = 1 - reveal;
    unit.style.opacity = reveal.toFixed(3);
    unit.style.clipPath = `inset(0 ${(inverse * 100).toFixed(2)}% 0 0)`;
    unit.style.transform = `translate3d(${(inverse * 0.3).toFixed(3)}em, ${(inverse * 0.2).toFixed(3)}em, 0) skewX(${(
      inverse * -5
    ).toFixed(2)}deg)`;
  });
}

export function ShaftJourneyExperience() {
  const storyRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const narrativeSlotRef = useRef<HTMLDivElement>(null);
  const narrativeFrameRef = useRef<((progress: number) => void) | null>(null);
  const lastNarrativeProgressRef = useRef(-1);
  const activeIndexRef = useRef(0);
  const firstStageButtonRef = useRef<HTMLButtonElement>(null);
  const projectsHandoffRef = useRef(0);
  const scrollCueRef = useRef<HTMLButtonElement>(null);
  const soundToggleRef = useRef<HTMLButtonElement>(null);
  const stageRailRef = useRef<HTMLElement>(null);
  const waveLabelRef = useRef<HTMLDivElement>(null);
  const interfaceHiddenRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [interfaceHidden, setInterfaceHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const theme = useSyncExternalStore(
    subscribeShaftTheme,
    readShaftTheme,
    readServerShaftTheme,
  );
  const soundscape = useWeaveSoundscape(reducedMotion);
  const shaftSoundFrameRef = useRef<((frame: WeaveSoundFrame) => void) | null>(null);

  useEffect(() => {
    const sourceSoundFrameRef = soundscape.soundFrameRef;
    shaftSoundFrameRef.current = (frame) => {
      sourceSoundFrameRef.current?.({
        deltaSeconds: frame.deltaSeconds,
        progress: mapJourneyProgressToSound(frame.progress),
      });
    };
    return () => {
      shaftSoundFrameRef.current = null;
    };
  }, [soundscape.soundFrameRef]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(media.matches);
      if (media.matches) {
        progressRef.current = 1;
        activeIndexRef.current = 0;
        setActiveIndex(0);
      }
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    let ticking = false;
    const updateProgress = () => {
      const story = storyRef.current;
      if (!story) return;
      const storyTop = story.getBoundingClientRect().top + window.scrollY;
      const viewportHeight =
        story.querySelector<HTMLElement>(".shaft-viewport")?.offsetHeight ?? window.innerHeight;
      const scrollable = Math.max(1, story.offsetHeight - viewportHeight);
      const progress = clamp01((window.scrollY - storyTop) / scrollable);
      progressRef.current = progress;

      const canvas = story.querySelector<HTMLCanvasElement>(".shaft-canvas");
      if (canvas?.dataset.failed === "true") narrativeFrameRef.current?.(progress);

      if (progressTextRef.current) {
        progressTextRef.current.textContent = `${String(Math.round(progress * 100)).padStart(2, "0")}%`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const updateNarrative = (progress: number) => {
      if (Math.abs(progress - lastNarrativeProgressRef.current) < 0.00004) return;
      lastNarrativeProgressRef.current = progress;

      const nextIndex = reducedMotion ? 0 : getActiveStage(progress);
      if (nextIndex !== activeIndexRef.current) {
        const cueHadFocus = scrollCueRef.current === document.activeElement;
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
        if (nextIndex === 1 && cueHadFocus) {
          window.requestAnimationFrame(() => firstStageButtonRef.current?.focus({ preventScroll: true }));
        }
      }

      const stage = shaftStages[nextIndex];
      const story = storyRef.current;
      /*
       * BMS completes at 82%. From that same beat, the camera leaves the shaft while the Projects
       * plane rises from the viewport edge. Keeping both motions concurrent makes the handoff one
       * continuous exit instead of introducing a separate finale.
       */
      const exitProgress = reducedMotion ? 1 : smoothstep(0.82, 0.95, progress);
      const interfaceExit = reducedMotion ? 0 : smoothstep(0.84, 0.905, progress);
      const canvasOpacity = reducedMotion ? 0 : 1 - smoothstep(0.9, 0.965, progress);

      projectsHandoffRef.current = exitProgress;
      story?.style.setProperty("--shaft-interface-opacity", (1 - interfaceExit).toFixed(3));
      story?.style.setProperty("--shaft-canvas-opacity", canvasOpacity.toFixed(3));
      story?.style.setProperty(
        "--shaft-vignette-opacity",
        (1 - smoothstep(0.82, 0.94, progress)).toFixed(3),
      );
      const shouldHideInterface = interfaceExit > 0.96;
      if (shouldHideInterface !== interfaceHiddenRef.current) {
        const interfaceHadFocus =
          stageRailRef.current?.contains(document.activeElement) ||
          soundToggleRef.current === document.activeElement;
        if (shouldHideInterface && interfaceHadFocus) {
          window.requestAnimationFrame(() =>
            document.getElementById("projects-title")?.focus({ preventScroll: true }),
          );
        }
        interfaceHiddenRef.current = shouldHideInterface;
        setInterfaceHidden(shouldHideInterface);
      }

      const slot = narrativeSlotRef.current;
      if (!slot || !isSystemStage(stage.id)) return;
      const [start, end] = shaftSystemWaves[stage.id];
      const local = clamp01((progress - start) / (end - start));
      const panel = slot.querySelector<HTMLElement>(`[data-shaft-panel="${stage.id}"]`);
      if (!panel) return;

      const metaReveal = smoothstep(0, 0.14, local);
      const traceReveal = smoothstep(0.03, 0.84, local);
      const cursorReveal =
        smoothstep(0.03, 0.14, local) * (1 - smoothstep(0.88, 0.99, local));
      panel.style.setProperty("--shaft-meta-opacity", metaReveal.toFixed(3));
      panel.style.setProperty(
        "--shaft-meta-shift",
        `${((1 - metaReveal) * 0.5).toFixed(3)}rem`,
      );
      panel.style.setProperty("--shaft-trace-progress", traceReveal.toFixed(3));
      panel.style.setProperty("--shaft-trace-position", `${(traceReveal * 100).toFixed(2)}%`);
      panel.style.setProperty("--shaft-cursor-opacity", cursorReveal.toFixed(3));
      applyScrubbedUnits(panel, "title", local, [0.025, 0.32]);
      applyScrubbedUnits(panel, "statement", local, [0.1, 0.42]);
    };

    narrativeFrameRef.current = updateNarrative;
    updateNarrative(reducedMotion ? 1 : progressRef.current);
    return () => {
      narrativeFrameRef.current = null;
    };
  }, [reducedMotion]);

  const scrollToStage = (at: number) => {
    const story = storyRef.current;
    if (!story) return;
    const storyTop = story.getBoundingClientRect().top + window.scrollY;
    const viewportHeight =
      story.querySelector<HTMLElement>(".shaft-viewport")?.offsetHeight ?? window.innerHeight;
    const scrollable = Math.max(1, story.offsetHeight - viewportHeight);
    window.scrollTo({
      behavior: reducedMotion ? "auto" : "smooth",
      top: storyTop + scrollable * at,
    });
  };

  const activeStage = shaftStages[activeIndex];
  const activeSystem = systemCallouts.find(({ id }) => id === activeStage.id);
  const navigationHidden = activeStage.id === "identity";

  return (
    <main
      className="shaft-journey"
      data-stage={activeStage.id as ShaftStageId}
      data-theme={theme}
    >
      <section
        aria-label="Inside the Whole — a scroll journey through an engineered building core"
        className="shaft-story"
        ref={storyRef}
      >
        <div className="shaft-viewport">
          <ShaftJourneyCanvas
            narrativeFrameRef={narrativeFrameRef}
            progressRef={progressRef}
            reducedMotion={reducedMotion}
            soundFrameRef={shaftSoundFrameRef}
            theme={theme}
            waveLabelRef={waveLabelRef}
          />
          <div aria-hidden="true" className="shaft-vignette" />

          <header className="shaft-chapter-mark" aria-hidden="true">
            <span>The Art of Orchestrics™</span>
            <span>Inside the Whole / 01</span>
          </header>

          <button
            aria-label={
              soundscape.available
                ? soundscape.enabled
                  ? "Turn off the Orchestrics soundscape"
                  : "Turn on the Orchestrics soundscape"
                : "Sound is unavailable in this browser"
            }
            aria-pressed={soundscape.enabled}
            aria-hidden={interfaceHidden}
            className={`shaft-sound-toggle ${soundscape.enabled ? "is-enabled" : ""} ${
              interfaceHidden ? "is-interface-hidden" : ""
            }`}
            disabled={!soundscape.available}
            onClick={() => void soundscape.toggleSound()}
            ref={soundToggleRef}
            tabIndex={interfaceHidden ? -1 : 0}
            type="button"
          >
            <span aria-hidden="true" className="shaft-sound-bars">
              <i />
              <i />
              <i />
            </span>
            <span>Sound</span>
            <small>{soundscape.available ? (soundscape.enabled ? "On" : "Off") : "Unavailable"}</small>
          </button>
          <span aria-live="polite" className="sr-only">
            {soundscape.available
              ? `Orchestrics soundscape ${soundscape.enabled ? "enabled" : "disabled"}.`
              : "Orchestrics soundscape is unavailable."}
          </span>

          <div
            aria-hidden={interfaceHidden}
            aria-live="polite"
            className="shaft-narrative-slot"
            ref={narrativeSlotRef}
          >
            {shaftStages.map((stage, index) => (
              <div
                aria-hidden={index !== activeIndex}
                className={`shaft-narrative-panel ${index === activeIndex ? "is-active" : ""}`}
                data-shaft-panel={stage.id}
                key={stage.id}
              >
                {stage.id === "identity" ? (
                  <div className="shaft-identity-state">
                    <h1>
                      <DevdarianiDisplayWordmark className="shaft-display-wordmark" />
                    </h1>
                    <p>Engineering the Whole.</p>
                    <span>Integrated MEP design + installation</span>
                  </div>
                ) : (
                  <div className="shaft-system-story">
                    <span className="shaft-system-meta">
                      <b>{stage.number}</b>
                      <span>Core system / Orchestrics</span>
                    </span>
                    <h2 className="shaft-system-title" data-system={stage.id}>
                      <span aria-hidden="true" className="shaft-system-title-ghost">
                        {stage.label.toUpperCase()}
                      </span>
                      <AnimatedDisplayText motionGroup="title" text={stage.label.toUpperCase()} />
                    </h2>
                    <p className="shaft-system-statement">
                      <AnimatedDisplayText
                        mode="words"
                        motionGroup="statement"
                        text={stage.statement.toUpperCase()}
                      />
                    </p>
                    <i aria-hidden="true" className="shaft-system-trace">
                      <b />
                    </i>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div aria-hidden="true" className="shaft-follow-label" ref={waveLabelRef}>
            <div className="shaft-follow-label-copy" key={activeSystem?.id ?? "none"}>
              <AnimatedDisplayText
                className="shaft-follower-zone"
                staggerMs={14}
                text={activeSystem?.zone ?? ""}
              />
              <small>
                <AnimatedDisplayText
                  className="shaft-follower-descriptor"
                  mode="words"
                  staggerMs={30}
                  text={activeSystem?.descriptor ?? ""}
                />
              </small>
            </div>
          </div>

          <nav
            aria-hidden={navigationHidden || interfaceHidden}
            aria-label="Building core sequence"
            className={`shaft-stage-rail ${interfaceHidden ? "is-interface-hidden" : ""}`}
            ref={stageRailRef}
          >
            {shaftStages.slice(1).map((stage) => (
              <button
                aria-current={stage.id === activeStage.id ? "step" : undefined}
                aria-label={`Go to ${stage.label}: ${stage.statement}`}
                className={stage.id === activeStage.id ? "is-active" : ""}
                key={stage.id}
                onClick={() => scrollToStage(getStageScrollTarget(stage))}
                ref={
                  stage.id === "hvac"
                    ? firstStageButtonRef
                    : undefined
                }
                tabIndex={navigationHidden || interfaceHidden ? -1 : 0}
                type="button"
              >
                <span>{stage.number}</span>
                <span>{stage.label}</span>
              </button>
            ))}
          </nav>

          <div aria-hidden="true" className="shaft-progress">
            <span>
              {activeStage.number} / {activeStage.label}
            </span>
            <span className="shaft-progress-value" ref={progressTextRef}>
              {reducedMotion ? "100%" : "00%"}
            </span>
            <i />
          </div>

          <button
            aria-label="Enter the engineering core"
            className="shaft-scroll-cue"
            onClick={() => scrollToStage(getStageScrollTarget(shaftStages[1]))}
            ref={scrollCueRef}
            tabIndex={activeStage.id === "identity" ? 0 : -1}
            type="button"
          >
            <span>Scroll to enter the core</span>
            <i aria-hidden="true" />
          </button>

          <ol className="sr-only">
            {shaftStages.map((stage) => (
              <li key={stage.id}>
                {stage.label}: {stage.statement}
              </li>
            ))}
          </ol>
          <p className="sr-only">
            The camera travels upward through a coordinated engineering shaft containing HVAC,
            electrical, plumbing, fire protection, and BMS systems. After BMS completes and the
            roof opens, the camera exits the shaft while the Projects index rises directly into
            view.
          </p>
        </div>
      </section>
      <ProjectsThreshold handoffProgressRef={projectsHandoffRef} variant="shaft-exit" />
    </main>
  );
}
