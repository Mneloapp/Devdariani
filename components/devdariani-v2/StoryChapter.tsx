"use client";

import { motion } from "framer-motion";
import type { ChapterCopy } from "@/lib/devdariani-v2/copy";
import { easing, reveal } from "@/lib/devdariani-v2/motion";
import { DevdarianiWordmark } from "./DevdarianiWordmark";

type StoryChapterProps = {
  chapter: ChapterCopy;
  selectedWorkSoon: string;
};

function Multiline({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line) => (
        <span className="block" key={line}>
          {line}
        </span>
      ))}
    </>
  );
}

export function StoryChapter({ chapter, selectedWorkSoon }: StoryChapterProps) {
  const isHome = chapter.id === "home";
  const isWork = chapter.id === "work";
  const isContact = chapter.id === "contact";

  return (
    <section
      className="relative flex min-h-screen items-center px-5 py-28 md:px-[13vw] md:py-36"
      data-chapter-id={chapter.id}
      id={chapter.id}
    >
      <motion.div
        className={`relative z-10 max-w-5xl ${chapter.id === "work" ? "md:max-w-3xl" : ""}`}
        initial="hidden"
        transition={{ duration: 0.9, ease: easing }}
        variants={reveal}
        viewport={{ amount: 0.45, once: false }}
        whileInView="visible"
      >
        <p className="mb-8 text-[0.68rem] uppercase tracking-[0.35em] text-[var(--text-muted)]">
          {isHome ? chapter.eyebrow : `${chapter.number} / ${chapter.nav}`}
        </p>

        {isHome ? (
          <h1>
            <DevdarianiWordmark className="text-[clamp(2.5rem,12vw,4.6rem)] tracking-[0.005em] md:text-[clamp(4.1rem,11vw,10.5rem)] md:tracking-[0.015em]" />
            <span className="mt-8 block text-[clamp(2rem,4.3vw,4.5rem)] font-light leading-none tracking-[-0.05em] text-[var(--text)]">
              Engineering the Whole.
            </span>
          </h1>
        ) : (
          <h2 className="text-balance text-[clamp(2.45rem,5.9vw,7.2rem)] font-light leading-[0.96] tracking-[-0.055em] text-[var(--text)]">
            <Multiline text={chapter.title} />
          </h2>
        )}

        {chapter.support ? (
          <p className="mt-10 max-w-xl whitespace-pre-line text-sm uppercase leading-7 tracking-[0.22em] text-[var(--text-muted)] md:text-[0.82rem]">
            {chapter.support}
          </p>
        ) : null}

        {chapter.steps ? (
          <div className="mt-12 grid max-w-2xl gap-6">
            {chapter.steps.map((step, index) => (
              <div className="grid gap-2 border-l border-[var(--line-strong)] pl-5" key={step.title}>
                <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[var(--text-muted)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-lg uppercase tracking-[0.16em] text-[var(--text)]">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">{step.body}</p>
              </div>
            ))}
          </div>
        ) : null}

        {chapter.principles ? (
          <div className="mt-10 grid gap-3 text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
            {chapter.principles.map((principle) => (
              <span key={principle}>{principle}</span>
            ))}
          </div>
        ) : null}

        {isWork ? (
          <p className="mt-10 max-w-md text-sm uppercase leading-7 tracking-[0.22em] text-[var(--text-muted)]">
            {selectedWorkSoon}
          </p>
        ) : null}

        {chapter.cta ? (
          <a
            className="mt-12 inline-flex min-w-72 items-center justify-between border-b border-[var(--line-strong)] pb-4 text-xs uppercase tracking-[0.24em] text-[var(--text)] transition hover:border-[var(--text)]"
            href={isContact ? "mailto:info@devdariani.com" : "#approach"}
          >
            {chapter.cta}
            <span aria-hidden="true">→</span>
          </a>
        ) : null}
      </motion.div>
    </section>
  );
}
