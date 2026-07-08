"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

const SystemDNAChain3D = dynamic(
  () => import("./SystemDNAChain3D").then((mod) => mod.SystemDNAChain3D),
  { ssr: false },
);

type Chapter = {
  eyebrow: string;
  id: string;
  label: string;
  lines: string[];
  meta?: string;
};

const chapters: Chapter[] = [
  {
    eyebrow: "00 / Prologue",
    id: "prologue",
    label: "Prologue",
    lines: ["DEVDARIANI", "The Art of Orchestrics™", "Engineering the Whole."],
    meta: "Click to begin.",
  },
  {
    eyebrow: "01 / Fragmentation",
    id: "fragmentation",
    label: "Fragmentation",
    lines: ["Modern buildings are no longer built.", "They are orchestrated."],
  },
  {
    eyebrow: "02 / Complexity",
    id: "complexity",
    label: "Complexity",
    lines: ["Complexity is not the problem.", "Fragmentation is."],
  },
  {
    eyebrow: "03 / Relation",
    id: "relation",
    label: "Relation",
    lines: ["Every system has a role.", "Every role creates relationships."],
  },
  {
    eyebrow: "04 / Coordination",
    id: "coordination",
    label: "Coordination",
    lines: ["Relationships become coordination."],
  },
  {
    eyebrow: "05 / Orchestrics",
    id: "orchestrics",
    label: "Orchestrics",
    lines: [
      "Orchestrics™",
      "A methodology for transforming complex building projects into coordinated systems.",
    ],
  },
  {
    eyebrow: "06 / Principles",
    id: "principles",
    label: "Principles",
    lines: ["Perfect Control.", "Quiet Confidence.", "Precision in Every Detail."],
  },
  {
    eyebrow: "07 / The Whole",
    id: "whole",
    label: "The Whole",
    lines: ["Engineering the Whole."],
  },
  {
    eyebrow: "08 / Work",
    id: "work",
    label: "Work",
    lines: ["Selected Work.", "Challenge / Complexity / Outcome."],
  },
  {
    eyebrow: "09 / Contact",
    id: "contact",
    label: "Contact",
    lines: [
      "If your project demands coordination instead of compromise,",
      "start the conversation.",
    ],
  },
];

function useShouldRender3D() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!reduce);
  }, []);

  return enabled;
}

export function BrandStory() {
  const containerRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressLabel, setProgressLabel] = useState("00%");
  const [chainProgress, setChainProgress] = useState(0.08);
  const shouldRender3D = useShouldRender3D();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
  });
  const fieldProgress = useTransform(smoothProgress, [0, 1], [0.08, 0.94]);
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const fieldOpacity = useTransform(smoothProgress, [0, 0.14, 1], [0.42, 0.82, 0.64]);

  useMotionValueEvent(fieldProgress, "change", (latest) => {
    setChainProgress(latest);
  });

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    setProgressLabel(`${String(Math.round(latest * 100)).padStart(2, "0")}%`);
  });

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-story-chapter]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const target = visible.target as HTMLElement;
        const nextIndex = Number(target.dataset.storyChapter ?? 0);
        setActiveIndex(nextIndex);
      },
      { rootMargin: "-28% 0px -28% 0px", threshold: [0.2, 0.45, 0.7] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const activeChapter = chapters[activeIndex] ?? chapters[0];
  const navChapters = useMemo(() => chapters.slice(1), []);

  function beginStory() {
    setStarted(true);
    window.setTimeout(() => {
      document
        .getElementById("fragmentation")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 260);
  }

  return (
    <main ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-dark text-ivory">
      <div className="fixed inset-0 z-0">
        <motion.div style={{ opacity: fieldOpacity }} className="absolute inset-0">
          {shouldRender3D ? (
            <SystemDNAChain3D activeIndex={activeIndex} progress={chainProgress} />
          ) : (
            <div className="h-full bg-[radial-gradient(circle_at_58%_42%,rgba(244,241,234,.13),transparent_20rem)]" />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_52%,rgba(244,241,234,.08),transparent_28rem),linear-gradient(180deg,rgba(7,7,7,.66),#070707_82%)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(244,241,234,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(244,241,234,.12)_1px,transparent_1px)] [background-size:100%_56px,56px_100%]" />
      </div>

      <header className="section-shell fixed left-0 right-0 top-0 z-40">
        <nav className="flex items-center justify-between border-b border-ivory/14 py-5 text-[0.66rem] uppercase tracking-[0.24em] text-ivory/58">
          <a href="#prologue" className="text-ivory">
            DEVDARIANI
          </a>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setSoundOn((value) => !value)}
              className="text-ivory/58 transition-colors hover:text-ivory"
              aria-pressed={soundOn}
            >
              Sound {soundOn ? "On" : "Off"}
            </button>
            <span className="tabular-nums text-ivory">{progressLabel}</span>
          </div>
        </nav>
      </header>

      <aside className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
        <ol className="grid gap-3 text-right text-[0.62rem] uppercase tracking-[0.22em] text-ivory/36">
          {navChapters.map((chapter, index) => {
            const chapterIndex = index + 1;
            const isActive = chapterIndex === activeIndex;
            return (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  className={`transition-colors ${isActive ? "text-ivory" : "hover:text-ivory/72"}`}
                >
                  {String(chapterIndex).padStart(2, "0")} / {chapter.label}
                </a>
              </li>
            );
          })}
        </ol>
      </aside>

      <div className="fixed bottom-0 left-0 right-0 z-40 h-px bg-ivory/12">
        <motion.div className="h-px bg-ivory" style={{ width: progressWidth }} />
      </div>

      <AnimatePresence>
        {!started ? (
          <motion.button
            type="button"
            onClick={beginStory}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
            className="fixed inset-0 z-50 cursor-pointer bg-dark text-left text-ivory"
          >
            <span className="section-shell flex min-h-screen flex-col justify-between pb-14 pt-28 md:pb-20 md:pt-36">
              <span className="text-[0.66rem] uppercase tracking-[0.28em] text-ivory/48">
                00 / Prologue
              </span>
              <span className="grid gap-8">
                <span className="block text-[clamp(3.2rem,13vw,14rem)] font-semibold leading-[0.78]">
                  DEVDARIANI
                </span>
                <span className="block max-w-3xl text-[clamp(2rem,5.6vw,6rem)] font-light leading-[0.95] text-ivory/86">
                  Engineering the Whole.
                </span>
              </span>
              <span className="flex items-end justify-between gap-8 text-[0.66rem] uppercase tracking-[0.24em] text-ivory/54">
                <span>The Art of Orchestrics™</span>
                <span>Click to begin</span>
              </span>
            </span>
          </motion.button>
        ) : null}
      </AnimatePresence>

      <div className="relative z-10">
        {chapters.map((chapter, index) => (
          <StoryChapter
            key={chapter.id}
            chapter={chapter}
            index={index}
            isActive={activeChapter.id === chapter.id}
            started={started}
          />
        ))}
      </div>

      <div className="pointer-events-none fixed bottom-8 left-0 right-0 z-30 md:hidden">
        <div className="section-shell flex items-center justify-between text-[0.62rem] uppercase tracking-[0.2em] text-ivory/46">
          <span>{activeChapter.eyebrow}</span>
          <span>{progressLabel}</span>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-10 left-10 z-20 hidden text-[0.62rem] uppercase tracking-[0.22em] text-ivory/34 md:block">
        Scroll to continue
      </div>

    </main>
  );
}

function StoryChapter({
  chapter,
  index,
  isActive,
  started,
}: {
  chapter: Chapter;
  index: number;
  isActive: boolean;
  started: boolean;
}) {
  const isContact = chapter.id === "contact";

  return (
    <section
      id={chapter.id}
      data-story-chapter={index}
      className="section-shell relative flex min-h-screen items-center py-28 md:py-36"
    >
      <motion.div
        initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
        whileInView={{ opacity: started || index === 0 ? 1 : 0.25, y: 0, filter: "blur(0px)" }}
        viewport={{ once: false, amount: 0.55 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={`w-full ${index % 2 === 0 ? "md:pl-[8vw]" : "md:pl-[28vw]"}`}
      >
        <p className="mb-10 text-[0.68rem] uppercase tracking-[0.28em] text-ivory/44">
          {chapter.eyebrow}
        </p>
        <div
          className={`grid gap-4 ${isActive ? "opacity-100" : "opacity-70"} transition-opacity duration-500`}
        >
          {chapter.lines.map((line, lineIndex) => (
            <motion.p
              key={`${chapter.id}-${line}`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.75 }}
              transition={{
                duration: 0.75,
                delay: lineIndex * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={
                lineIndex === 0
                  ? "max-w-6xl text-balance text-[clamp(3.1rem,9vw,10rem)] font-light leading-[0.9] text-ivory"
                  : "max-w-4xl text-balance text-[clamp(1.35rem,3.3vw,3.6rem)] font-light leading-[1.05] text-ivory/62"
              }
            >
              {line}
            </motion.p>
          ))}
        </div>
        {chapter.meta ? (
          <p className="mt-12 text-[0.68rem] uppercase tracking-[0.24em] text-ivory/44">
            {chapter.meta}
          </p>
        ) : null}
        {isContact ? (
          <a
            href="mailto:hello@devdariani.com"
            className="mt-12 inline-flex min-h-14 items-center rounded-full border border-ivory/26 px-6 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:border-ivory hover:bg-ivory hover:text-dark"
          >
            Start the Conversation
          </a>
        ) : null}
      </motion.div>
    </section>
  );
}
