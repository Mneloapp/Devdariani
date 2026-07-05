"use client";

import { motion } from "framer-motion";

const points = [
  [18, 28],
  [28, 62],
  [42, 38],
  [55, 70],
  [67, 31],
  [78, 55],
  [87, 24],
  [12, 76],
  [35, 18],
  [61, 15],
  [73, 82],
  [49, 52],
];

export function HeroSilence() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden"
      aria-label="Opening Silence"
    >
      <div className="absolute inset-0">
        <svg
          className="h-full w-full opacity-60"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {points.map(([x, y], index) => (
            <motion.circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r="0.16"
              fill="rgba(244,241,234,0.72)"
              initial={{ opacity: 0.08, scale: 0.7 }}
              animate={{
                opacity: [0.08, 0.28, 0.12],
                scale: [0.7, 1, 0.86],
                x: index % 2 === 0 ? [0, 0.8, 0.2] : [0, -0.55, 0.1],
                y: index % 3 === 0 ? [0, -0.5, 0.1] : [0, 0.45, -0.1],
              }}
              transition={{
                duration: 12 + index,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          ))}
          {points.slice(0, 7).map(([x, y], index) => {
            const next = points[index + 4];
            return (
              <motion.line
                key={`${x}-${next[0]}`}
                x1={x}
                y1={y}
                x2={next[0]}
                y2={next[1]}
                stroke="rgba(200,169,106,0.16)"
                strokeWidth="0.035"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 1, 0.85], opacity: [0, 0.5, 0.2] }}
                transition={{
                  duration: 16,
                  delay: index * 0.7,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        className="section-shell relative z-10"
      >
        <div className="max-w-4xl">
          <p className="mb-8 text-[0.74rem] uppercase tracking-[0.42em] text-muted">
            The Art of Orchestrics™
          </p>
          <h1 className="text-balance text-[clamp(3.2rem,10vw,9.8rem)] font-medium leading-[0.88] tracking-normal text-text">
            DEVDARIANI
          </h1>
          <p className="mt-8 max-w-2xl text-[clamp(1.25rem,2.4vw,2.45rem)] font-light leading-tight text-text/88">
            Engineering the Whole.
          </p>
          <a href="#world" className="premium-button mt-12">
            Discover Orchestrics™
          </a>
        </div>
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-line" />
    </section>
  );
}
