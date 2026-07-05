"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useRef } from "react";

const systems = [
  { label: "Design", x: 18, y: 42 },
  { label: "BIM", x: 34, y: 24 },
  { label: "HVAC", x: 52, y: 35 },
  { label: "Electrical", x: 70, y: 25 },
  { label: "Plumbing", x: 78, y: 55 },
  { label: "Fire", x: 60, y: 72 },
  { label: "BMS", x: 42, y: 64 },
  { label: "Procurement", x: 24, y: 70 },
  { label: "Commissioning", x: 50, y: 50 },
];

const links = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 0],
  [2, 8],
  [3, 8],
  [5, 8],
  [6, 8],
];

function SystemNode({
  system,
  index,
  progress,
}: {
  system: (typeof systems)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(
    progress,
    [index / systems.length - 0.1, index / systems.length + 0.12],
    [0, 1],
  );
  const scale = useTransform(progress, [0, 1], [0.9, 1]);

  return (
    <motion.div
      style={{
        left: `${system.x}%`,
        top: `${system.y}%`,
        opacity,
        scale,
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2"
    >
      <span className="block rounded-full bg-accent/80 p-1 shadow-[0_0_36px_rgba(200,169,106,0.28)]" />
      <span className="mt-3 block whitespace-nowrap bg-background/72 px-3 py-2 text-[0.62rem] uppercase tracking-[0.16em] text-text/82 backdrop-blur-md">
        {system.label}
      </span>
    </motion.div>
  );
}

export function SystemsSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 78%", "end 28%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 66, damping: 24 });

  return (
    <section
      ref={ref}
      id="systems"
      className="section-shell flex min-h-screen items-center py-28 md:py-40"
    >
      <div className="grid w-full gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
        <div>
          <p className="eyebrow mb-8">Systems</p>
          <h2 className="text-balance text-[clamp(2.5rem,6vw,6.2rem)] font-light leading-[0.98]">
            Many systems.
            <span className="block text-accent">One outcome.</span>
          </h2>
        </div>
        <div className="relative h-[560px] overflow-hidden">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {links.map(([a, b]) => (
              <motion.line
                key={`${a}-${b}`}
                x1={systems[a].x}
                y1={systems[a].y}
                x2={systems[b].x}
                y2={systems[b].y}
                stroke="rgba(200,169,106,0.28)"
                strokeWidth="0.07"
                style={{ pathLength: progress }}
              />
            ))}
          </svg>
          {systems.map((system, index) => (
            <SystemNode
              key={system.label}
              system={system}
              index={index}
              progress={progress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
