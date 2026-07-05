"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useRef } from "react";

const systems = [
  { label: "Structure", x: 24, y: 26 },
  { label: "HVAC", x: 44, y: 18 },
  { label: "Electrical", x: 72, y: 30 },
  { label: "Plumbing", x: 58, y: 58 },
  { label: "Fire", x: 32, y: 68 },
  { label: "BMS", x: 80, y: 70 },
  { label: "Procurement", x: 24, y: 80 },
  { label: "Commissioning", x: 50, y: 42 },
];

const links = [
  [0, 1],
  [1, 2],
  [2, 7],
  [7, 3],
  [3, 5],
  [3, 4],
  [4, 6],
  [0, 4],
  [1, 7],
  [5, 7],
];

function SystemPoint({
  label,
  x,
  y,
  index,
  progress,
}: {
  label: string;
  x: number;
  y: number;
  index: number;
  progress: MotionValue<number>;
}) {
  const scale = useTransform(progress, [0, 0.45, 1], [0.68, 1.18, 1]);
  const opacity = useTransform(progress, [0, 0.22 + index * 0.035], [0, 1]);
  const driftX = useTransform(
    progress,
    [0, 1],
    [index % 2 === 0 ? -26 : 24, index % 2 === 0 ? 10 : -8],
  );
  const driftY = useTransform(
    progress,
    [0, 1],
    [index % 3 === 0 ? 22 : -18, index % 3 === 0 ? -6 : 8],
  );

  return (
    <motion.div
      style={{ left: `${x}%`, top: `${y}%`, opacity, scale, x: driftX, y: driftY }}
      className="absolute -translate-x-1/2 -translate-y-1/2"
    >
      <span className="block h-3.5 w-3.5 rounded-full bg-ivory shadow-[0_0_42px_rgba(244,241,234,0.58)]" />
      <span className="mt-5 block whitespace-nowrap text-[clamp(0.78rem,1.15vw,1.05rem)] uppercase tracking-[0.24em] text-ivory/72">
        {label}
      </span>
    </motion.div>
  );
}

function LinkLine({
  start,
  end,
  index,
  progress,
  lineOpacity,
}: {
  start: (typeof systems)[number];
  end: (typeof systems)[number];
  index: number;
  progress: MotionValue<number>;
  lineOpacity: MotionValue<number>;
}) {
  const pathLength = useTransform(progress, [0.16 + index * 0.025, 0.82], [0, 1]);

  return (
    <motion.line
      x1={start.x}
      y1={start.y}
      x2={end.x}
      y2={end.y}
      stroke="rgba(244,241,234,0.52)"
      strokeWidth="0.075"
      style={{ opacity: lineOpacity, pathLength }}
    />
  );
}

export function SystemsConstellation() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 78%", "end 28%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 64, damping: 24 });
  const lineOpacity = useTransform(progress, [0.18, 0.55], [0, 0.86]);
  const captionOpacity = useTransform(progress, [0.46, 0.78], [0, 1]);
  const captionY = useTransform(progress, [0.46, 0.78], [24, 0]);

  return (
    <section ref={ref} className="min-h-screen bg-dark text-ivory">
      <div className="section-shell relative flex min-h-screen items-center py-24 md:py-36">
        <div className="relative h-[78vh] min-h-[620px] w-full overflow-hidden">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {links.map(([a, b], index) => (
              <LinkLine
                key={`${a}-${b}`}
                start={systems[a]}
                end={systems[b]}
                index={index}
                progress={progress}
                lineOpacity={lineOpacity}
              />
            ))}
          </svg>

          {systems.map((system, index) => (
            <SystemPoint
              key={system.label}
              label={system.label}
              x={system.x}
              y={system.y}
              index={index}
              progress={progress}
            />
          ))}

          <motion.div
            style={{ opacity: captionOpacity, y: captionY }}
            className="absolute bottom-8 left-0 max-w-3xl md:bottom-0"
          >
            <p className="mb-6 text-sm uppercase tracking-[0.24em] text-ivory/50">
              (2) Systems
            </p>
            <h2 className="text-balance text-[clamp(2.3rem,7vw,7.8rem)] font-light leading-[0.92] text-ivory/86">
              One coordinated field.
            </h2>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
