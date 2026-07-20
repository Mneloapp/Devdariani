"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { DevdarianiDisplayWordmark } from "./DevdarianiDisplayWordmark";
import { CorridorJourneyCanvas } from "./CorridorJourneyCanvas";
import type { ShaftTheme } from "./ShaftJourneyCanvas";

type CorridorJourneyChapterProps = {
  handoffProgressRef: RefObject<number>;
  theme: ShaftTheme;
};

type CorridorPhaseId = "founder" | "whole" | "method" | "horizon";

const corridorPhases: readonly {
  at: number;
  id: CorridorPhaseId;
  label: string;
  number: string;
}[] = [
  { at: 0.08, id: "founder", label: "Founder", number: "01" },
  { at: 0.35, id: "whole", label: "The whole", number: "02" },
  { at: 0.58, id: "method", label: "Method", number: "03" },
  { at: 0.81, id: "horizon", label: "Horizon", number: "04" },
] as const;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(min: number, max: number, value: number) {
  const normalized = clamp01((value - min) / Math.max(0.0001, max - min));
  return normalized * normalized * (3 - 2 * normalized);
}

function getActivePhase(progress: number) {
  for (let index = corridorPhases.length - 1; index >= 0; index -= 1) {
    if (progress >= corridorPhases[index].at) return index;
  }
  return 0;
}

function FounderPortraitStudy() {
  return (
    <figure className="corridor-founder-study">
      <svg
        aria-hidden="true"
        className="corridor-founder-study__drawing"
        viewBox="0 0 420 560"
      >
        <g className="corridor-founder-study__grid">
          <path d="M20 70H400M20 150H400M20 230H400M20 310H400M20 390H400M20 470H400" />
          <path d="M70 20V540M140 20V540M210 20V540M280 20V540M350 20V540" />
        </g>
        <g className="corridor-founder-study__construction">
          <circle cx="210" cy="280" r="124" />
          <circle cx="210" cy="280" r="76" />
          <path d="M86 280H334M210 156V404M122 192L298 368M298 192L122 368" />
        </g>
        <g className="corridor-founder-study__geometry">
          <path d="M34 92L150 210L210 280" />
          <path d="M386 92L270 210L210 280" />
          <path d="M34 468L150 350L210 280" />
          <path d="M386 468L270 350L210 280" />
          <path d="M210 28V280M210 280V532" />
          <circle cx="150" cy="210" r="7" />
          <circle cx="270" cy="210" r="7" />
          <circle cx="150" cy="350" r="7" />
          <circle cx="270" cy="350" r="7" />
        </g>
        <g className="corridor-founder-study__datum">
          <path d="M20 515H400" />
          <circle cx="210" cy="280" r="6" />
        </g>
      </svg>
      <strong aria-hidden="true">G / D</strong>
      <figcaption>
        <span>Founder datum / 01</span>
        <span>Orchestrics Geometry™</span>
      </figcaption>
    </figure>
  );
}

export function CorridorJourneyChapter({
  handoffProgressRef,
  theme,
}: CorridorJourneyChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const canvasRenderRequestRef = useRef<(() => void) | null>(null);
  const activePhaseRef = useRef(0);
  const finalReadyRef = useRef(false);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [finalReady, setFinalReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let isNearChapter = true;

    const update = () => {
      animationFrame = 0;
      if (!isNearChapter && !motionPreference.matches) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = Math.max(
        1,
        frame.offsetHeight || document.documentElement.clientHeight,
      );
      const scrollDistance = Math.max(1, section.offsetHeight - viewportHeight);
      const entryProgress = motionPreference.matches
        ? 1
        : clamp01((viewportHeight - rect.top) / viewportHeight);
      const chapterProgress = motionPreference.matches
        ? 1
        : clamp01(-rect.top / scrollDistance);
      const handoffGate = motionPreference.matches
        ? 1
        : clamp01(handoffProgressRef.current);
      const effectiveEntry = motionPreference.matches
        ? 1
        : Math.min(
            entryProgress,
            Math.max(handoffGate, smoothstep(0.04, 0.9, entryProgress)),
          );

      progressRef.current = chapterProgress;
      canvasRenderRequestRef.current?.();

      const founderOpacity =
        smoothstep(0.025, 0.105, chapterProgress) *
        (1 - smoothstep(0.285, 0.39, chapterProgress));
      const wholeOpacity =
        smoothstep(0.305, 0.39, chapterProgress) *
        (1 - smoothstep(0.515, 0.61, chapterProgress));
      const methodOpacity =
        smoothstep(0.535, 0.615, chapterProgress) *
        (1 - smoothstep(0.73, 0.815, chapterProgress));
      const horizonOpacity = smoothstep(0.76, 0.86, chapterProgress);
      const cityNight = smoothstep(0.82, 0.98, chapterProgress);
      const passageOpacity =
        smoothstep(0.04, 0.64, effectiveEntry) *
        (1 - smoothstep(0.06, 0.145, chapterProgress));

      section.style.setProperty("--corridor-entry", effectiveEntry.toFixed(3));
      section.style.setProperty("--corridor-progress", chapterProgress.toFixed(4));
      section.style.setProperty("--corridor-passage-opacity", passageOpacity.toFixed(3));
      section.style.setProperty("--corridor-founder-opacity", founderOpacity.toFixed(3));
      section.style.setProperty("--corridor-whole-opacity", wholeOpacity.toFixed(3));
      section.style.setProperty("--corridor-method-opacity", methodOpacity.toFixed(3));
      section.style.setProperty("--corridor-horizon-opacity", horizonOpacity.toFixed(3));
      section.style.setProperty("--corridor-night", cityNight.toFixed(3));
      section.style.setProperty(
        "--corridor-night-overlay",
        (cityNight * 0.28).toFixed(3),
      );
      section.style.setProperty(
        "--corridor-scan-opacity",
        (effectiveEntry * (1 - horizonOpacity)).toFixed(3),
      );
      section.style.setProperty(
        "--corridor-founder-depth",
        `${((1 - founderOpacity) * 3.4).toFixed(3)}rem`,
      );
      section.style.setProperty(
        "--corridor-whole-depth",
        `${((1 - wholeOpacity) * 3.4).toFixed(3)}rem`,
      );
      section.style.setProperty(
        "--corridor-method-depth",
        `${((1 - methodOpacity) * 3.4).toFixed(3)}rem`,
      );
      section.style.setProperty(
        "--corridor-horizon-shift",
        `${((1 - horizonOpacity) * 2.4).toFixed(3)}rem`,
      );

      const nextPhaseIndex = motionPreference.matches
        ? corridorPhases.length - 1
        : getActivePhase(chapterProgress);
      if (nextPhaseIndex !== activePhaseRef.current) {
        activePhaseRef.current = nextPhaseIndex;
        setActivePhaseIndex(nextPhaseIndex);
      }

      const nextFinalReady = motionPreference.matches || chapterProgress >= 0.86;
      if (nextFinalReady !== finalReadyRef.current) {
        finalReadyRef.current = nextFinalReady;
        setFinalReady(nextFinalReady);
      }

      if (!motionPreference.matches && entryProgress > handoffGate + 0.0005) {
        animationFrame = window.requestAnimationFrame(update);
      }
    };

    const requestUpdate = () => {
      if (animationFrame !== 0) return;
      animationFrame = window.requestAnimationFrame(update);
    };
    const updateMotionPreference = () => {
      setReducedMotion(motionPreference.matches);
      requestUpdate();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearChapter = entry?.isIntersecting ?? true;
        if (isNearChapter) requestUpdate();
      },
      { rootMargin: "120% 0px", threshold: 0 },
    );

    updateMotionPreference();
    observer.observe(section);
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    motionPreference.addEventListener("change", updateMotionPreference);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      motionPreference.removeEventListener("change", updateMotionPreference);
    };
  }, [handoffProgressRef]);

  const scrollToPhase = (at: number) => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const scrollDistance = Math.max(1, section.offsetHeight - frame.offsetHeight);
    window.scrollTo({
      behavior: reducedMotion ? "auto" : "smooth",
      top: sectionTop + scrollDistance * at,
    });
  };

  const activePhase = corridorPhases[activePhaseIndex];

  return (
    <section
      aria-labelledby="founder-title"
      className="corridor-chapter"
      data-corridor-phase={activePhase.id}
      id="origin"
      ref={sectionRef}
    >
      <div className="corridor-chapter__frame" ref={frameRef}>
        <button
          className="corridor-chapter__skip"
          onClick={() => scrollToPhase(0.9)}
          type="button"
        >
          Skip to the horizon
        </button>

        <CorridorJourneyCanvas
          progressRef={progressRef}
          renderRequestRef={canvasRenderRequestRef}
          reducedMotion={reducedMotion}
          theme={theme}
        />
        <div aria-hidden="true" className="corridor-chapter__atmosphere" />
        <div aria-hidden="true" className="corridor-chapter__scanline" />

        <header className="corridor-chapter__header">
          <span>The Art of Orchestrics™</span>
          <span>
            02 / Passage / {activePhase.number} {activePhase.label}
          </span>
        </header>

        <nav aria-label="Corridor chapter sequence" className="corridor-chapter__rail">
          {corridorPhases.map((phase, index) => (
            <button
              aria-current={index === activePhaseIndex ? "step" : undefined}
              className={index === activePhaseIndex ? "is-active" : ""}
              key={phase.id}
              onClick={() => scrollToPhase(phase.at)}
              type="button"
            >
              <span>{phase.number}</span>
              <span>{phase.label}</span>
            </button>
          ))}
        </nav>

        <div aria-hidden="true" className="corridor-passage-mark">
          <span>From the system</span>
          <i />
          <span>To the thinking behind it</span>
        </div>

        <article className="corridor-wall-scene corridor-wall-scene--founder">
          <div className="corridor-wall-scene__copy">
            <p className="corridor-wall-scene__eyebrow">01 / Founding engineer</p>
            <h2 id="founder-title" tabIndex={-1}>
              <span>Giorgi</span>
              <DevdarianiDisplayWordmark className="corridor-founder-wordmark" />
            </h2>
            <p className="corridor-founder-role">Founder / MEP Engineer</p>
            <p className="corridor-wall-scene__body">
              Giorgi Devdariani is an MEP engineer whose practice spans design, coordination and
              installation. He founded Devdariani to close the distance between what is drawn,
              what is built and how a building ultimately performs.
            </p>
          </div>
          <FounderPortraitStudy />
        </article>

        <article className="corridor-wall-scene corridor-wall-scene--whole">
          <p className="corridor-wall-scene__eyebrow">02 / Conviction</p>
          <h2>
            <span>The drawing.</span>
            <span>The site.</span>
            <span>The building.</span>
          </h2>
          <p className="corridor-wall-scene__body">
            They should never become three different realities.
          </p>
          <p className="corridor-system-register">
            <span>Every line must coordinate.</span><i />
            <span>Every detail must build.</span><i />
            <span>Every system must perform.</span>
          </p>
        </article>

        <article className="corridor-wall-scene corridor-wall-scene--method">
          <p className="corridor-wall-scene__eyebrow">03 / Method</p>
          <h2>Orchestrics™</h2>
          <h3>The discipline of making every system work as one.</h3>
          <ol className="corridor-method-steps">
            <li><span>01</span><strong>Design</strong></li>
            <li><span>02</span><strong>Coordination</strong></li>
            <li><span>03</span><strong>Installation</strong></li>
          </ol>
          <p className="corridor-wall-scene__body">
            One continuous method—from first line to final delivery.
          </p>
        </article>

        <article
          className={`corridor-horizon ${finalReady ? "is-interactive" : ""}`}
          id="corridor-horizon"
        >
          <p className="corridor-horizon__eyebrow">04 / Engineering beyond the core</p>
          <h2>
            <span>What works behind the walls</span>
            <span>shapes the life beyond them.</span>
          </h2>
          <DevdarianiDisplayWordmark className="corridor-horizon__wordmark" />
          <div className="corridor-horizon__footer">
            <p>
              <strong>Engineering the Whole.</strong>
              <span>Integrated MEP design + installation</span>
            </p>
            <a
              href="mailto:info@devdariani.ge?subject=Project%20enquiry"
              tabIndex={finalReady ? 0 : -1}
            >
              <span>Discuss a project</span>
              <i aria-hidden="true">↗</i>
            </a>
          </div>
        </article>

        <footer className="corridor-chapter__footer">
          <span>Giorgi Devdariani / Founder</span>
          <span>Tbilisi / Georgia</span>
        </footer>
      </div>
    </section>
  );
}
