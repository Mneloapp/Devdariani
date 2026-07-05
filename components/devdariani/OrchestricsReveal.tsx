"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useRef } from "react";

const nodes = [
  [24, 30],
  [40, 18],
  [62, 26],
  [76, 48],
  [58, 68],
  [34, 62],
  [49, 43],
];

const links = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 0],
  [0, 6],
  [2, 6],
  [4, 6],
];

function RevealNode({
  x,
  y,
  index,
  progress,
}: {
  x: number;
  y: number;
  index: number;
  progress: MotionValue<number>;
}) {
  const scale = useTransform(progress, [0, 1], [0.65, 1]);

  return (
    <motion.circle
      cx={x}
      cy={y}
      r={index === 6 ? "0.38" : "0.22"}
      fill={index === 6 ? "rgba(200,169,106,0.86)" : "rgba(244,241,234,0.68)"}
      style={{ scale }}
    />
  );
}

export function OrchestricsReveal() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 82%", "end 20%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 64, damping: 22 });
  const titleOpacity = useTransform(progress, [0.28, 0.54], [0, 1]);
  const titleY = useTransform(progress, [0.28, 0.54], [28, 0]);
  const fieldOpacity = useTransform(progress, [0, 0.42], [0.15, 1]);

  return (
    <section
      ref={ref}
      id="orchestrics"
      className="section-shell relative flex min-h-screen items-center justify-center overflow-hidden py-32 text-center"
    >
      <motion.svg
        style={{ opacity: fieldOpacity }}
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {links.map(([a, b]) => (
          <motion.line
            key={`${a}-${b}`}
            x1={nodes[a][0]}
            y1={nodes[a][1]}
            x2={nodes[b][0]}
            y2={nodes[b][1]}
            stroke="rgba(200,169,106,0.26)"
            strokeWidth="0.055"
            style={{ pathLength: progress }}
          />
        ))}
        {nodes.map(([x, y], index) => (
          <RevealNode key={`${x}-${y}`} x={x} y={y} index={index} progress={progress} />
        ))}
      </motion.svg>
      <div className="max-w-5xl">
        <motion.p
          style={{ opacity: titleOpacity, y: titleY }}
          className="eyebrow mb-8"
        >
          The Shift
        </motion.p>
        <motion.h2
          style={{ opacity: titleOpacity, y: titleY }}
          className="text-[clamp(4rem,13vw,13rem)] font-light leading-none text-text"
        >
          Orchestrics™
        </motion.h2>
        <motion.p
          style={{ opacity: titleOpacity, y: titleY }}
          className="mx-auto mt-10 max-w-3xl text-balance text-[clamp(1.15rem,2.3vw,2.1rem)] font-light leading-tight text-text/78"
        >
          A methodology for turning complex building systems into one coordinated whole.
        </motion.p>
      </div>
    </section>
  );
}
