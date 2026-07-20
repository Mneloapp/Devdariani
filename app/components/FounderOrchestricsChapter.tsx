"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { DevdarianiDisplayWordmark } from "./DevdarianiDisplayWordmark";

type FounderOrchestricsChapterProps = {
  handoffProgressRef: RefObject<number>;
};

type OriginPhaseId = "origin" | "conviction" | "method" | "practice";

const originPhases: readonly {
  at: number;
  id: OriginPhaseId;
  label: string;
  number: string;
}[] = [
  { at: 0, id: "origin", label: "Origin", number: "01" },
  { at: 0.27, id: "conviction", label: "Conviction", number: "02" },
  { at: 0.53, id: "method", label: "Method", number: "03" },
  { at: 0.82, id: "practice", label: "Practice", number: "04" },
] as const;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(min: number, max: number, value: number) {
  const normalized = clamp01((value - min) / Math.max(0.0001, max - min));
  return normalized * normalized * (3 - 2 * normalized);
}

function getActivePhase(progress: number) {
  for (let index = originPhases.length - 1; index >= 0; index -= 1) {
    if (progress >= originPhases[index].at) return index;
  }
  return 0;
}

function setUnitReveal(units: NodeListOf<HTMLElement>, progress: number) {
  const count = Math.max(1, units.length);
  units.forEach((unit, index) => {
    const stagger = (index / count) * 0.3;
    const reveal = smoothstep(stagger, Math.min(1, stagger + 0.58), progress);
    const inverse = 1 - reveal;
    unit.style.opacity = reveal.toFixed(3);
    unit.style.clipPath = `inset(0 0 ${(inverse * 100).toFixed(2)}% 0)`;
    unit.style.transform = `translate3d(0, ${(inverse * 0.72).toFixed(3)}em, 0) skewY(${(
      inverse * -4
    ).toFixed(2)}deg)`;
  });
}

function MotionWords({
  group,
  lines,
}: {
  group: OriginPhaseId;
  lines: readonly string[];
}) {
  const fullText = lines.join(" ");
  const indexedLines = lines.map((line, lineIndex) => {
    const priorWordCount = lines
      .slice(0, lineIndex)
      .reduce((total, previousLine) => total + previousLine.trim().split(/\s+/).length, 0);
    const tokens = line.split(/(\s+)/);
    return tokens.map((token, tokenIndex) => ({
      index:
        priorWordCount +
        tokens.slice(0, tokenIndex + 1).filter((candidate) => !/^\s+$/.test(candidate))
          .length -
        1,
      token,
      tokenIndex,
    }));
  });

  return (
    <>
      <span className="sr-only">{fullText}</span>
      <span aria-hidden="true" className="origin-motion-copy" data-origin-group={group}>
        {indexedLines.map((tokens, lineIndex) => (
          <span className="origin-motion-line" key={`${lines[lineIndex]}-${lineIndex}`}>
            {tokens.map(({ index, token, tokenIndex }) => {
              if (/^\s+$/.test(token)) {
                return <span key={`space-${lineIndex}-${tokenIndex}`}>{token}</span>;
              }
              return (
                <span data-origin-unit={index} key={`${token}-${lineIndex}-${tokenIndex}`}>
                  {token}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </>
  );
}

export function FounderOrchestricsChapter({
  handoffProgressRef,
}: FounderOrchestricsChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const activePhaseRef = useRef(0);
  const finalReadyRef = useRef(false);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [finalReady, setFinalReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const originUnits = section.querySelectorAll<HTMLElement>(
      '[data-origin-group="origin"] [data-origin-unit]',
    );
    const convictionUnits = section.querySelectorAll<HTMLElement>(
      '[data-origin-group="conviction"] [data-origin-unit]',
    );
    const methodUnits = section.querySelectorAll<HTMLElement>(
      '[data-origin-group="method"] [data-origin-unit]',
    );
    const practiceUnits = section.querySelectorAll<HTMLElement>(
      '[data-origin-group="practice"] [data-origin-unit]',
    );
    const methodSteps = section.querySelectorAll<HTMLElement>("[data-origin-method-step]");
    const wordmarkLetters = section.querySelectorAll<SVGPathElement>(
      ".origin-chapter__wordmark path",
    );

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
            Math.max(handoffGate, smoothstep(0.04, 0.92, entryProgress)),
          );

      const surfaceReveal = smoothstep(0.02, 0.9, effectiveEntry);
      const originOpacity =
        smoothstep(0.18, 0.72, effectiveEntry) *
        (1 - smoothstep(0.11, 0.24, chapterProgress));
      const convictionOpacity =
        smoothstep(0.14, 0.27, chapterProgress) *
        (1 - smoothstep(0.39, 0.5, chapterProgress));
      const methodOpacity =
        smoothstep(0.43, 0.56, chapterProgress) *
        (1 - smoothstep(0.69, 0.79, chapterProgress));
      const practiceOpacity = smoothstep(0.74, 0.88, chapterProgress);
      const convergenceOpacity =
        smoothstep(0.04, 0.5, effectiveEntry) *
        (1 - smoothstep(0.2, 0.42, chapterProgress));
      const axisProgress =
        smoothstep(0.18, 0.78, effectiveEntry) *
        (0.2 + smoothstep(0, 0.94, chapterProgress) * 0.8);
      const geometryProgress = smoothstep(0.42, 0.68, chapterProgress);

      section.style.setProperty("--origin-entry", surfaceReveal.toFixed(3));
      section.style.setProperty("--origin-chapter-progress", chapterProgress.toFixed(4));
      section.style.setProperty("--origin-origin-opacity", originOpacity.toFixed(3));
      section.style.setProperty(
        "--origin-origin-shift",
        `${((1 - originOpacity) * 2.1).toFixed(3)}rem`,
      );
      section.style.setProperty(
        "--origin-conviction-opacity",
        convictionOpacity.toFixed(3),
      );
      section.style.setProperty(
        "--origin-conviction-shift",
        `${((1 - convictionOpacity) * 2.1).toFixed(3)}rem`,
      );
      section.style.setProperty("--origin-method-opacity", methodOpacity.toFixed(3));
      section.style.setProperty(
        "--origin-method-shift",
        `${((1 - methodOpacity) * 2.1).toFixed(3)}rem`,
      );
      section.style.setProperty("--origin-practice-opacity", practiceOpacity.toFixed(3));
      section.style.setProperty(
        "--origin-practice-shift",
        `${((1 - practiceOpacity) * 2.1).toFixed(3)}rem`,
      );
      section.style.setProperty(
        "--origin-convergence-opacity",
        convergenceOpacity.toFixed(3),
      );
      section.style.setProperty("--origin-axis-progress", axisProgress.toFixed(3));
      section.style.setProperty("--origin-geometry-progress", geometryProgress.toFixed(3));
      section.style.setProperty(
        "--origin-tracer-position",
        `${(18 + chapterProgress * 68).toFixed(2)}%`,
      );
      section.style.setProperty(
        "--origin-grid-opacity",
        (0.1 + geometryProgress * 0.22).toFixed(3),
      );

      setUnitReveal(originUnits, smoothstep(0.22, 0.82, effectiveEntry));
      setUnitReveal(convictionUnits, smoothstep(0.15, 0.34, chapterProgress));
      setUnitReveal(methodUnits, smoothstep(0.44, 0.63, chapterProgress));
      setUnitReveal(practiceUnits, smoothstep(0.75, 0.92, chapterProgress));

      methodSteps.forEach((step, index) => {
        const reveal = smoothstep(
          0.5 + index * 0.035,
          0.66 + index * 0.035,
          chapterProgress,
        );
        step.style.opacity = reveal.toFixed(3);
        step.style.transform = `translate3d(${((1 - reveal) * 1.25).toFixed(
          3,
        )}rem, 0, 0)`;
      });

      wordmarkLetters.forEach((letter, index) => {
        const stagger = index * 0.02;
        const reveal = smoothstep(
          0.77 + stagger,
          0.91 + stagger,
          chapterProgress,
        );
        const inverse = 1 - reveal;
        letter.style.opacity = reveal.toFixed(3);
        letter.style.clipPath = `inset(0 0 ${(inverse * 100).toFixed(2)}% 0)`;
        letter.style.transform = `translate3d(0, ${(inverse * 72).toFixed(
          2,
        )}%, 0) skewY(${(inverse * -4).toFixed(2)}deg)`;
      });

      const nextPhaseIndex = motionPreference.matches
        ? originPhases.length - 1
        : getActivePhase(chapterProgress);
      if (nextPhaseIndex !== activePhaseRef.current) {
        activePhaseRef.current = nextPhaseIndex;
        setActivePhaseIndex(nextPhaseIndex);
      }

      const nextFinalReady = motionPreference.matches || chapterProgress >= 0.82;
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearChapter = entry.isIntersecting;
        if (isNearChapter) requestUpdate();
      },
      { rootMargin: "120% 0px", threshold: 0 },
    );

    observer.observe(section);
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    motionPreference.addEventListener("change", requestUpdate);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      motionPreference.removeEventListener("change", requestUpdate);
    };
  }, [handoffProgressRef]);

  const scrollToPhase = (at: number) => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const scrollDistance = Math.max(1, section.offsetHeight - frame.offsetHeight);
    window.scrollTo({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      top: sectionTop + scrollDistance * at,
    });
  };

  const activePhase = originPhases[activePhaseIndex];

  return (
    <section
      aria-labelledby="founder-title"
      className="origin-chapter"
      data-origin-phase={activePhase.id}
      id="origin"
      ref={sectionRef}
    >
      <div className="origin-chapter__frame" ref={frameRef}>
        <button
          className="origin-chapter__skip"
          onClick={() => scrollToPhase(0.9)}
          type="button"
        >
          Skip to project enquiry
        </button>

        <div aria-hidden="true" className="origin-chapter__grid" />
        <svg
          aria-hidden="true"
          className="origin-chapter__convergence"
          preserveAspectRatio="none"
          viewBox="0 0 1000 1000"
        >
          <path className="is-hvac" d="M0 0L500 180" pathLength="1" />
          <path className="is-electrical" d="M250 0L500 180" pathLength="1" />
          <path className="is-plumbing" d="M500 0L500 180" pathLength="1" />
          <path className="is-fire" d="M750 0L500 180" pathLength="1" />
          <path className="is-bms" d="M1000 0L500 180" pathLength="1" />
          <path className="is-datum" d="M500 180V1000" pathLength="1" />
        </svg>
        <i aria-hidden="true" className="origin-chapter__tracer" />

        <header className="origin-chapter__header">
          <span>02 / The Engineer Behind the Whole</span>
          <span>
            {activePhase.number} / {activePhase.label}
          </span>
        </header>

        <nav aria-label="Origin chapter sequence" className="origin-chapter__rail">
          {originPhases.map((phase, index) => (
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

        <article className="origin-scene origin-scene--origin">
          <p className="origin-scene__eyebrow">01 / Origin</p>
          <h2 id="founder-title" tabIndex={-1}>
            <MotionWords
              group="origin"
              lines={[
                "Before Devdariani became a company,",
                "it was a way of engineering.",
              ]}
            />
          </h2>
          <div className="origin-nameplate">
            <strong>Giorgi Devdariani</strong>
            <span>Founder / MEP Engineer</span>
          </div>
          <p className="origin-scene__body">
            Experience across design, coordination and installation shaped one conviction: a
            building must be engineered as a whole.
          </p>
        </article>

        <article className="origin-scene origin-scene--conviction">
          <p className="origin-scene__eyebrow">02 / Conviction</p>
          <h2>
            <MotionWords
              group="conviction"
              lines={["Not separate systems.", "One engineered whole."]}
            />
          </h2>
          <p className="origin-system-register">
            Air <i /> Power <i /> Water <i /> Life safety <i /> Control
          </p>
          <p className="origin-scene__body">
            Each follows its own logic. Performance begins when they are resolved together.
          </p>
        </article>

        <article className="origin-scene origin-scene--method">
          <p className="origin-scene__eyebrow">03 / Method</p>
          <h2>
            <MotionWords group="method" lines={["Orchestrics™"]} />
          </h2>
          <h3>The discipline of making every system work as one.</h3>
          <p className="origin-scene__body">
            A continuous method for aligning design, coordination and installation—from first
            line to final delivery.
          </p>
          <ol className="origin-method-steps">
            <li data-origin-method-step>
              <span>01</span>
              <strong>Design</strong>
            </li>
            <li data-origin-method-step>
              <span>02</span>
              <strong>Coordination</strong>
            </li>
            <li data-origin-method-step>
              <span>03</span>
              <strong>Installation</strong>
            </li>
          </ol>
        </article>

        <article
          className={`origin-scene origin-scene--practice ${finalReady ? "is-interactive" : ""}`}
          id="origin-practice"
        >
          <p className="origin-scene__eyebrow">04 / Practice</p>
          <h2>
            <MotionWords
              group="practice"
              lines={["From experience,", "a new engineering practice."]}
            />
          </h2>
          <DevdarianiDisplayWordmark className="origin-chapter__wordmark" />
          <div className="origin-practice__footer">
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

        <footer className="origin-chapter__footer">
          <span>The Art of Orchestrics™</span>
          <span>Tbilisi / Georgia</span>
        </footer>
      </div>
    </section>
  );
}
