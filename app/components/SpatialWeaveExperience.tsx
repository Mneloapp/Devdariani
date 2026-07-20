"use client";

import { useEffect, useRef, useState } from "react";
import { stages, systemWaves, type StageId, type SystemId } from "@/app/lib/weave-data";
import { AnimatedDisplayText } from "./AnimatedDisplayText";
import { DevdarianiDisplayWordmark } from "./DevdarianiDisplayWordmark";
import { ProjectsThreshold } from "./ProjectsThreshold";
import { WeaveCanvas } from "./WeaveCanvas";
import { useWeaveSoundscape } from "./spatial-sound";

const systemCallouts = [
  { descriptor: "Air distribution", id: "hvac", label: "HVAC", revealAt: 1 },
  { descriptor: "Cable containment + power", id: "electrical", label: "Electrical", revealAt: 2 },
  { descriptor: "Orthogonal water pipework", id: "plumbing", label: "Plumbing", revealAt: 3 },
  { descriptor: "Flanged steel life-safety", id: "fire", label: "Fire protection", revealAt: 4 },
  { descriptor: "Control cabinet + network", id: "bms", label: "BMS", revealAt: 5 },
] as const;

function getActiveStage(progress: number) {
  for (let index = stages.length - 1; index >= 0; index -= 1) {
    if (progress >= stages[index].at) return index;
  }
  return 0;
}

function getStageScrollTarget(stage: (typeof stages)[number]) {
  return stage.id === "identity" ? stage.at : Math.min(0.985, stage.at + 0.027);
}

function smoothstep(min: number, max: number, value: number) {
  const normalized = Math.min(1, Math.max(0, (value - min) / Math.max(0.0001, max - min)));
  return normalized * normalized * (3 - 2 * normalized);
}

function isSystemStage(stage: StageId): stage is SystemId {
  return stage !== "identity";
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
  const staggerWindow = span * (group === "title" ? 0.42 : 0.3);
  const unitDuration = Math.max(0.08, span - staggerWindow);

  units.forEach((unit, index) => {
    const stagger = count <= 1 ? 0 : (index / (count - 1)) * staggerWindow;
    const reveal = smoothstep(start + stagger, start + stagger + unitDuration, progress);
    const inverse = 1 - reveal;
    const x = inverse * (group === "title" ? 0.34 : 0.16);
    const y = inverse * (group === "title" ? 0.22 : 0.42);
    const skew = inverse * (group === "title" ? -6 : -3);

    unit.style.opacity = reveal.toFixed(3);
    unit.style.clipPath = `inset(0 ${(inverse * 100).toFixed(2)}% 0 0)`;
    unit.style.transform = `translate3d(${x.toFixed(3)}em, ${y.toFixed(3)}em, 0) skewX(${skew.toFixed(2)}deg)`;
  });
}

export function SpatialWeaveExperience() {
  const storyRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const narrativeSlotRef = useRef<HTMLDivElement>(null);
  const narrativeFrameRef = useRef<((progress: number) => void) | null>(null);
  const lastNarrativeProgressRef = useRef(-1);
  const activeIndexRef = useRef(0);
  const gatewayRef = useRef<HTMLAnchorElement>(null);
  const projectsHandoffRef = useRef(0);
  const waveLabelRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const soundscape = useWeaveSoundscape(reducedMotion);

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
      const scrollable = Math.max(1, story.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, (window.scrollY - storyTop) / scrollable));
      progressRef.current = progress;

      const canvas = story.querySelector<HTMLCanvasElement>(".weave-canvas");
      if (canvas?.dataset.failed === "true") narrativeFrameRef.current?.(progress);

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progress})`;
      }
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
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
      }

      const stage = stages[nextIndex];
      const slot = narrativeSlotRef.current;
      const handoffGate = reducedMotion ? 1 : smoothstep(0.832, 0.8485, progress);
      projectsHandoffRef.current = handoffGate;
      const handoff = reducedMotion ? 0 : smoothstep(0.834, 0.847, progress);
      storyRef.current?.style.setProperty("--handoff-opacity", handoff.toFixed(3));
      storyRef.current?.style.setProperty(
        "--handoff-shift",
        `${((1 - handoff) * 1.2).toFixed(3)}rem`,
      );
      storyRef.current?.style.setProperty("--handoff-line", handoff.toFixed(3));
      const handoffVisible = handoff > 0.08;
      if (storyRef.current) storyRef.current.dataset.handoff = String(handoffVisible);
      if (gatewayRef.current) {
        gatewayRef.current.tabIndex = handoffVisible ? 0 : -1;
        gatewayRef.current.setAttribute("aria-hidden", String(!handoffVisible));
      }
      if (!slot || !isSystemStage(stage.id)) return;

      const [start, end] = systemWaves[stage.id];
      const waveProgress = Math.min(1, Math.max(0, (progress - start) / (end - start)));
      const panel = slot.querySelector<HTMLElement>(`[data-stage-panel="${stage.id}"]`);
      if (!panel) return;

      const metaReveal = smoothstep(0, 0.16, waveProgress);
      const traceReveal = smoothstep(0.025, 0.88, waveProgress);
      const cursorReveal = smoothstep(0.04, 0.14, waveProgress) *
        (1 - smoothstep(0.86, 0.98, waveProgress));

      panel.style.setProperty("--meta-opacity", metaReveal.toFixed(3));
      panel.style.setProperty("--meta-shift", `${((1 - metaReveal) * 0.55).toFixed(3)}rem`);
      panel.style.setProperty("--trace-progress", traceReveal.toFixed(3));
      panel.style.setProperty("--trace-position", `${(traceReveal * 100).toFixed(2)}%`);
      panel.style.setProperty("--cursor-opacity", cursorReveal.toFixed(3));
      applyScrubbedUnits(panel, "title", waveProgress, [0.035, 0.43]);
      applyScrubbedUnits(panel, "statement", waveProgress, [0.22, 0.7]);
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
    if (reducedMotion) {
      story.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    const storyTop = story.getBoundingClientRect().top + window.scrollY;
    const scrollable = story.offsetHeight - window.innerHeight;
    window.scrollTo({
      behavior: "smooth",
      top: storyTop + scrollable * at,
    });
  };

  const activeStage = stages[activeIndex];
  const navigationHidden = activeStage.id === "identity";
  const activeSystem = systemCallouts.find((system) => system.id === activeStage.id);

  return (
    <main className="spatial-weave" data-stage={activeStage.id as StageId}>
      <section
        aria-label="Spatial Systems Weave — an Orchestrics experience"
        className="weave-story"
        ref={storyRef}
      >
        <div className="weave-viewport">
          <WeaveCanvas
            narrativeFrameRef={narrativeFrameRef}
            progressRef={progressRef}
            reducedMotion={reducedMotion}
            soundFrameRef={soundscape.soundFrameRef}
            waveLabelRef={waveLabelRef}
          />
          <div className="weave-vignette" aria-hidden="true" />

          <button
            aria-label={
              soundscape.available
                ? soundscape.enabled
                  ? "Turn off the Orchestrics soundscape"
                  : "Turn on the Orchestrics soundscape"
                : "Sound is unavailable in this browser"
            }
            aria-pressed={soundscape.enabled}
            className={`weave-sound-toggle ${soundscape.enabled ? "is-enabled" : ""}`}
            disabled={!soundscape.available}
            onClick={() => void soundscape.toggleSound()}
            type="button"
          >
            <span aria-hidden="true" className="weave-sound-bars">
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
            aria-live="polite"
            className="weave-narrative-slot"
            id="spatial-weave-home"
            ref={narrativeSlotRef}
          >
            {stages.map((stage, index) => (
              <div
                aria-hidden={index !== activeIndex}
                className={`weave-narrative-panel ${index === activeIndex ? "is-active" : ""}`}
                data-stage-panel={stage.id}
                key={stage.id}
              >
                {stage.id === "identity" ? (
                  <div className="weave-identity-state">
                    <h1>
                      <DevdarianiDisplayWordmark className="weave-display-wordmark" />
                    </h1>
                    <p className="weave-identity-tagline">Engineering the Whole.</p>
                  </div>
                ) : (
                  <div className="weave-system-story">
                    <span className="weave-system-meta">
                      <b>{stage.number}</b>
                      <span>System / Orchestrics</span>
                    </span>
                    <h2
                      className="weave-system-title"
                      data-system={stage.id}
                    >
                      <span aria-hidden="true" className="weave-system-title-ghost">
                        {stage.label.toUpperCase()}
                      </span>
                      <AnimatedDisplayText
                        motionGroup="title"
                        text={stage.label.toUpperCase()}
                      />
                    </h2>
                    <p className="weave-system-statement">
                      <AnimatedDisplayText
                        mode="words"
                        motionGroup="statement"
                        text={stage.statement.toUpperCase()}
                      />
                    </p>
                    <i aria-hidden="true" className="weave-system-trace">
                      <b />
                    </i>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="weave-callouts" aria-hidden="true">
            {systemCallouts.map((callout) => (
              <span
                className={`weave-callout weave-callout--${callout.id} ${
                  activeIndex >= callout.revealAt ? "is-visible" : ""
                } ${activeStage.id === callout.id ? "is-active" : ""}`}
                key={callout.id}
              >
                <AnimatedDisplayText
                  className="weave-static-draft-text"
                  staggerMs={18}
                  text={callout.label}
                />
              </span>
            ))}
          </div>

          <div aria-hidden="true" className="weave-follow-label" ref={waveLabelRef}>
            <div className="weave-follow-label-copy" key={activeSystem?.id ?? "none"}>
              <AnimatedDisplayText
                className="weave-follower-title"
                staggerMs={16}
                text={activeSystem?.label ?? ""}
              />
              <small>
                <AnimatedDisplayText
                  className="weave-follower-descriptor"
                  mode="words"
                  staggerMs={38}
                  text={activeSystem?.descriptor ?? ""}
                />
              </small>
            </div>
          </div>

          <div className="weave-system-legend" aria-hidden="true">
            {systemCallouts.map((system) => (
              <span
                className={activeIndex >= system.revealAt ? "is-visible" : ""}
                key={system.id}
              >
                <AnimatedDisplayText
                  className="weave-static-draft-text"
                  staggerMs={18}
                  text={system.label}
                />
              </span>
            ))}
          </div>

          <nav
            aria-hidden={navigationHidden}
            aria-label="Orchestrics sequence"
            className="weave-stage-rail"
          >
            {stages.map((stage, index) => (
              <button
                aria-current={index === activeIndex ? "step" : undefined}
                aria-label={`Go to ${stage.label}: ${stage.statement}`}
                className={index === activeIndex ? "is-active" : ""}
                key={stage.id}
                onClick={() => scrollToStage(getStageScrollTarget(stage))}
                tabIndex={navigationHidden ? -1 : 0}
                type="button"
              >
                <span>{stage.number}</span>
                <span>{stage.label}</span>
              </button>
            ))}
          </nav>

          <div className="weave-progress" aria-hidden="true">
            <span className="weave-progress-stage">
              {activeStage.number} / {activeStage.label}
            </span>
            <span className="weave-progress-value" ref={progressTextRef}>
              {reducedMotion ? "100%" : "00%"}
            </span>
            <span className="weave-progress-track">
              <span ref={progressBarRef} style={reducedMotion ? { transform: "scaleX(1)" } : undefined} />
            </span>
          </div>

          <button
            aria-label="Scroll to align the systems"
            className="weave-scroll-cue"
            onClick={() => scrollToStage(getStageScrollTarget(stages[1]))}
            tabIndex={activeStage.id === "identity" ? 0 : -1}
            type="button"
          >
            <span>Scroll to orchestrate</span>
            <i aria-hidden="true" />
          </button>

          <a
            aria-label="Continue to projects"
            aria-hidden="true"
            className="weave-projects-gateway"
            href="#projects"
            ref={gatewayRef}
            tabIndex={-1}
          >
            <span>Continue</span>
            <strong>Projects</strong>
            <i aria-hidden="true" />
          </a>

          <ol className="sr-only">
            {stages.map((stage) => (
              <li key={stage.id}>
                {stage.label}: {stage.statement}
              </li>
            ))}
          </ol>
          <p className="sr-only">
            A coordinated three-dimensional MEP field brings HVAC, electrical, plumbing, fire
            protection, and BMS systems from separated routes into one buildable whole.
          </p>
        </div>
      </section>
      <ProjectsThreshold handoffProgressRef={projectsHandoffRef} />
    </main>
  );
}
