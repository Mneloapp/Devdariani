"use client";

import { motion, useScroll, useSpring, useMotionValueEvent } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { ChapterId, ExperienceCopy } from "@/lib/devdariani-v2/copy";
import { systems } from "@/lib/devdariani-v2/copy";
import type { Locale } from "@/lib/devdariani-v2/locales";
import { ChapterRail } from "./ChapterRail";
import { ExperienceHeader } from "./ExperienceHeader";
import { StoryChapter } from "./StoryChapter";
import { OrchestricsCanvas } from "./scene/OrchestricsCanvas";
import { ProjectedSystemLabels } from "./scene/ProjectedSystemLabels";

type DevdarianiExperienceProps = {
  copy: ExperienceCopy;
  debug?: boolean;
  locale: Locale;
};

function isChapterId(value: string | undefined, chapters: ExperienceCopy["chapters"]): value is ChapterId {
  return Boolean(value && chapters.some((chapter) => chapter.id === value));
}

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function DevdarianiExperience({
  copy,
  debug = false,
  locale,
}: DevdarianiExperienceProps) {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { damping: 28, stiffness: 72 });
  const [activeId, setActiveId] = useState(copy.chapters[0].id);
  const [progressLabel, setProgressLabel] = useState("00%");
  const reducedMotion = useReducedMotionPreference();

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    setProgressLabel(`${String(Math.round(latest * 100)).padStart(2, "0")}%`);
  });

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter-id]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const target = visible.target as HTMLElement;
        const chapterId = target.dataset.chapterId;
        if (isChapterId(chapterId, copy.chapters)) {
          setActiveId(chapterId);
        }
      },
      { rootMargin: "-34% 0px -34% 0px", threshold: [0.25, 0.5, 0.7] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [copy.chapters]);

  const activeChapter = useMemo(
    () => copy.chapters.find((chapter) => chapter.id === activeId) ?? copy.chapters[0],
    [activeId, copy.chapters],
  );

  return (
    <main
      className="devdariani-v2 relative min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)]"
      lang={locale}
    >
      <div className="fixed inset-0 z-0">
        <OrchestricsCanvas
          activeChapter={activeId}
          debug={debug}
          progress={smoothProgress}
          reducedMotion={reducedMotion}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_63%_43%,rgba(233,230,223,0.08),transparent_30rem),linear-gradient(90deg,rgba(5,6,7,0.92),rgba(5,6,7,0.44)_54%,rgba(5,6,7,0.82))]" />
        <div className="absolute inset-0 opacity-[0.11] [background-image:linear-gradient(rgba(233,230,223,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(233,230,223,.1)_1px,transparent_1px)] [background-size:100%_56px,56px_100%]" />
      </div>

      <ExperienceHeader copy={copy} locale={locale} />
      <ChapterRail activeId={activeId} chapters={copy.chapters} />
      <ProjectedSystemLabels activeChapter={activeId} />

      <div className="fixed bottom-0 left-0 right-0 z-40 h-px bg-[var(--line)]">
        <motion.div className="h-px bg-[var(--text)]" style={{ scaleX: smoothProgress, transformOrigin: "0 50%" }} />
      </div>

      <div className="pointer-events-none fixed bottom-7 left-5 z-40 flex items-center gap-4 text-[0.66rem] uppercase tracking-[0.24em] text-[var(--text-muted)] md:left-10">
        <span>•</span>
        <span>{activeChapter.number} / {activeChapter.nav}</span>
      </div>
      <div className="pointer-events-none fixed bottom-7 right-5 z-40 text-[0.66rem] uppercase tracking-[0.24em] text-[var(--text-muted)] md:right-10">
        {progressLabel}
      </div>

      <div className="relative z-10">
        {copy.chapters.map((chapter) => (
          <div key={chapter.id}>
            <StoryChapter chapter={chapter} selectedWorkSoon={copy.meta.selectedWorkSoon} />
            {chapter.id === "systems" ? (
              <div className="-mt-24 grid gap-3 px-5 pb-28 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)] md:hidden">
                {systems.map((system) => (
                  <span className="border-b border-[var(--line)] pb-3" key={system}>
                    {system}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {debug ? (
        <div className="fixed left-4 top-24 z-50 grid gap-1 rounded bg-black/70 p-3 font-mono text-[0.7rem] text-lime-200">
          <span>debug3d=1</span>
          <span>chapter: {activeId}</span>
          <span>progress: {progressLabel}</span>
          <span>reduced: {String(reducedMotion)}</span>
        </div>
      ) : null}
    </main>
  );
}
