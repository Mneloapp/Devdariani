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

const RelationalField3D = dynamic(
  () => import("./RelationalField3D").then((mod) => mod.RelationalField3D),
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

const systems = [
  "Structure",
  "HVAC",
  "Electrical",
  "BMS",
  "Plumbing",
  "Fire",
  "Procurement",
  "Commissioning",
];

const systemNodes = [
  { label: "Structure", x: 35, y: 18, tx: -24, ty: -6, chapter: 1 },
  { label: "HVAC", x: 65, y: 27, tx: 8, ty: -7, chapter: 2 },
  { label: "Electrical", x: 36, y: 36, tx: -24, ty: -4, chapter: 3 },
  { label: "BMS", x: 64, y: 45, tx: 8, ty: -4, chapter: 4, core: true },
  { label: "Plumbing", x: 36, y: 54, tx: -24, ty: -3, chapter: 5 },
  { label: "Fire", x: 64, y: 63, tx: 8, ty: -3, chapter: 6 },
  { label: "Procurement", x: 35, y: 72, tx: -25, ty: -2, chapter: 8 },
  { label: "Commissioning", x: 65, y: 81, tx: 7, ty: -2, chapter: 9 },
];

const systemLinks = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
];

const chapterFocusNode = [3, 0, 1, 2, 3, 4, 5, 3, 6, 7];

function useShouldRender3D() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.innerWidth < 760;
    setEnabled(!reduce && !coarse && !narrow);
  }, []);

  return enabled;
}

export function BrandStory() {
  const containerRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressLabel, setProgressLabel] = useState("00%");
  const [fieldOrder, setFieldOrder] = useState(0.08);
  const shouldRender3D = useShouldRender3D();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
  });
  const fieldProgress = useTransform(smoothProgress, [0, 1], [0.08, 0.94]);
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const fieldOpacity = useTransform(smoothProgress, [0, 0.14, 1], [0.34, 0.78, 0.58]);

  useMotionValueEvent(fieldProgress, "change", (latest) => {
    setFieldOrder(latest);
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
  const focusedNode = chapterFocusNode[activeIndex] ?? 3;
  const activeSystemLabel = systemNodes[focusedNode]?.label ?? "BMS";
  const revealedSystemLabels = useMemo(
    () =>
      systemNodes
        .filter((node) => started && (node.chapter ?? 0) <= activeIndex)
        .map((node) => node.label),
    [activeIndex, started],
  );

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
            <RelationalField3D
              activeLabel={activeSystemLabel}
              order={fieldOrder}
              revealedLabels={revealedSystemLabels}
              tone="dark"
            />
          ) : (
            <div className="h-full bg-[radial-gradient(circle_at_58%_42%,rgba(244,241,234,.13),transparent_20rem)]" />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_52%,rgba(244,241,234,.08),transparent_28rem),linear-gradient(180deg,rgba(7,7,7,.66),#070707_82%)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(244,241,234,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(244,241,234,.12)_1px,transparent_1px)] [background-size:100%_56px,56px_100%]" />
      </div>
      <SystemConstellationLayer activeIndex={activeIndex} started={started} />

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

      <FloatingSystems activeIndex={activeIndex} started={started} />
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

function SystemConstellationLayer({
  activeIndex,
  started,
}: {
  activeIndex: number;
  started: boolean;
}) {
  const phase = Math.max(0, activeIndex - 1);
  const focusedNode = chapterFocusNode[activeIndex] ?? 3;
  const completedLinkCount = Math.max(0, Math.min(systemLinks.length, activeIndex - 1));

  return (
    <motion.div
      aria-hidden="true"
      animate={{ opacity: started ? 1 : 0.42 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed inset-0 z-[2] overflow-hidden"
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <radialGradient id="system-node-glow">
            <stop offset="0%" stopColor="rgba(244,241,234,0.7)" />
            <stop offset="100%" stopColor="rgba(244,241,234,0)" />
          </radialGradient>
        </defs>
        {systemLinks.map(([from, to], index) => {
          const a = systemNodes[from];
          const b = systemNodes[to];
          const isActiveSegment =
            from === focusedNode || to === focusedNode || index === completedLinkCount - 1;
          const isCompleted = started && index < completedLinkCount;
          return (
            <motion.line
              key={`${a.label}-${b.label}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(244,241,234,0.55)"
              strokeWidth={isActiveSegment ? "0.14" : "0.08"}
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: isCompleted ? 1 : 0,
                opacity: isCompleted ? (isActiveSegment ? 0.82 : 0.28) : 0,
              }}
              transition={{ duration: 1.1, delay: index * 0.035, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}
        {systemNodes.map((node, index) => {
          const distanceFromFocus = Math.abs(index - focusedNode);
          const isFocused = index === focusedNode;
          const isPast = started && (node.chapter ?? 0) < activeIndex;
          const isRevealed = started && (node.chapter ?? 0) <= activeIndex;
          const isNearby = distanceFromFocus === 1;
          const pulse = isFocused ? 0.92 : isPast ? 0.42 : 0.2;
          return (
            <motion.g
              key={node.label}
              animate={{
                x: Math.sin(phase * 0.52 + index * 1.4) * (node.core ? 1.4 : 2.8),
                y: Math.cos(phase * 0.48 + index * 1.1) * (node.core ? 1.2 : 2.4),
              }}
              transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={isFocused ? 3.2 : node.core ? 2.7 : 1.9}
                fill="url(#system-node-glow)"
                opacity={isFocused ? 0.54 : isPast ? 0.14 : isNearby && isRevealed ? 0.12 : 0}
              />
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={isFocused ? 0.58 : node.core ? 0.46 : 0.28}
                fill="rgba(244,241,234,0.88)"
                animate={{
                  opacity: isRevealed ? [pulse, pulse + 0.16, pulse] : 0,
                  scale: isRevealed ? [1, 1.16, 1] : 0.8,
                }}
                transition={{ duration: 3.2 + index * 0.08, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.g>
          );
        })}
      </svg>

      {systemNodes.map((node, index) => (
        <motion.span
          key={node.label}
          animate={{
            x: node.tx + Math.sin(phase * 0.55 + index) * 12,
            y: node.ty + Math.cos(phase * 0.5 + index) * 10,
            opacity:
              index === focusedNode
                ? 0.86
                : started && (node.chapter ?? 0) < activeIndex
                  ? 0.28
                  : 0,
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute uppercase tracking-[0.22em] ${
            node.core
              ? "text-[0.62rem] text-ivory/70 md:text-[clamp(0.72rem,1.4vw,1.2rem)]"
              : "text-[0.48rem] text-ivory/48 md:text-[clamp(0.58rem,1vw,0.78rem)]"
          }`}
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
          }}
        >
          {node.label}
        </motion.span>
      ))}
    </motion.div>
  );
}

function FloatingSystems({
  activeIndex,
  started,
}: {
  activeIndex: number;
  started: boolean;
}) {
  const visible = started;
  const focusedNode = chapterFocusNode[activeIndex] ?? 3;

  return (
    <motion.div
      aria-hidden="true"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed inset-0 z-[1] hidden overflow-hidden md:block"
    >
      {systems.map((system, index) => (
        <motion.span
          key={system}
          animate={{
            x: visible ? Math.sin(index * 1.6 + activeIndex) * 28 : 0,
            y: visible ? Math.cos(index * 1.1 + activeIndex) * 24 : 0,
            opacity: index === focusedNode ? 0.11 : 0.025,
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute text-[clamp(1.8rem,4.8vw,6rem)] font-light leading-none text-ivory"
          style={{
            left: `${8 + (index % 4) * 24}%`,
            top: `${18 + Math.floor(index / 4) * 48 + (index % 2) * 7}%`,
          }}
        >
          {system}
        </motion.span>
      ))}
    </motion.div>
  );
}
