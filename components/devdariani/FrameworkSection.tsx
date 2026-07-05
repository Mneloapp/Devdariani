"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useRef, useState } from "react";

const steps = [
  ["Understand", "Define the real complexity."],
  ["Map", "Expose systems and dependencies."],
  ["Coordinate", "Align before conflict becomes cost."],
  ["Integrate", "Connect one operational logic."],
  ["Execute", "Deliver with precision."],
  ["Validate", "Commission the whole."],
  ["Optimize", "Improve beyond delivery."],
];

function FrameworkStep({
  title,
  copy,
  index,
  active,
  revealIndex,
  onActivate,
}: {
  title: string;
  copy: string;
  index: number;
  active: number;
  revealIndex: MotionValue<number>;
  onActivate: (index: number) => void;
}) {
  const opacity = useTransform(revealIndex, [index - 1, index, index + 4], [0.28, 1, 1]);
  const y = useTransform(revealIndex, [index - 1, index], [18, 0]);

  return (
    <motion.button
      type="button"
      onMouseEnter={() => onActivate(index)}
      onFocus={() => onActivate(index)}
      style={{ opacity, y }}
      className="group relative min-h-28 text-left md:min-h-80"
    >
      <span className="mb-5 block h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_32px_rgba(200,169,106,0.38)] md:mx-auto" />
      <span className="block text-[0.7rem] uppercase tracking-[0.2em] text-muted md:text-center">
        {title}
      </span>
      <span
        className={`mt-5 block max-w-[11rem] text-sm leading-relaxed text-text/72 transition-opacity duration-500 md:mx-auto md:text-center ${
          active === index ? "opacity-100" : "opacity-35"
        }`}
      >
        {copy}
      </span>
    </motion.button>
  );
}

export function FrameworkSection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 74%", "end 26%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 24 });
  const pathLength = useTransform(progress, [0, 1], [0.05, 1]);
  const revealIndex = useTransform(progress, [0, 1], [0, steps.length - 1]);

  return (
    <section
      ref={ref}
      id="framework"
      className="section-shell flex min-h-screen items-center py-28 md:py-44"
    >
      <div className="w-full">
        <p className="eyebrow mb-12">The Orchestrics Framework</p>
        <div className="relative min-h-[560px]">
          <svg
            className="absolute left-0 top-1/2 h-px w-full overflow-visible"
            viewBox="0 0 100 1"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <motion.line
              x1="0"
              y1="0.5"
              x2="100"
              y2="0.5"
              stroke="rgba(200,169,106,0.5)"
              strokeWidth="0.12"
              style={{ pathLength }}
            />
          </svg>

          <div className="grid min-h-[560px] gap-6 md:grid-cols-7 md:items-center">
            {steps.map(([title, copy], index) => (
              <FrameworkStep
                key={title}
                title={title}
                copy={copy}
                index={index}
                active={active}
                revealIndex={revealIndex}
                onActivate={setActive}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
