"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const agents = [
  { label: "Architecture", from: [24, 18], to: [25, 30] },
  { label: "Structure", from: [72, 14], to: [52, 18] },
  { label: "HVAC", from: [24, 74], to: [35, 60] },
  { label: "Electrical", from: [80, 36], to: [68, 42] },
  { label: "Plumbing", from: [62, 84], to: [56, 75] },
  { label: "Fire", from: [36, 12], to: [36, 22] },
  { label: "BMS", from: [82, 78], to: [80, 68] },
  { label: "Procurement", from: [24, 52], to: [25, 66] },
  { label: "Commissioning", from: [52, 10], to: [62, 28] },
];

const relationships = [
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 6],
  [4, 7],
  [5, 8],
  [0, 5],
  [3, 8],
  [6, 8],
  [2, 7],
];

type Agent = (typeof agents)[number];

function AgentNode({ agent, order }: { agent: Agent; order: ReturnType<typeof useSpring> }) {
  const left = useTransform(order, [0, 1], [`${agent.from[0]}%`, `${agent.to[0]}%`]);
  const top = useTransform(order, [0, 1], [`${agent.from[1]}%`, `${agent.to[1]}%`]);
  const scale = useTransform(order, [0, 0.7, 1], [0.96, 0.98, 1]);

  return (
    <motion.div
      style={{ left, top, scale }}
      className="absolute -translate-x-1/2 -translate-y-1/2 border border-line bg-background/78 px-2.5 py-2 text-[0.58rem] uppercase tracking-[0.14em] text-text/88 backdrop-blur-md sm:px-4 sm:text-[0.72rem]"
    >
      {agent.label}
      <span className="absolute left-1/2 top-full h-6 w-px -translate-x-1/2 bg-line" />
      <span className="absolute left-1/2 top-[calc(100%+1.4rem)] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent/80" />
    </motion.div>
  );
}

export function FragmentationSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 78%", "end 24%"],
  });
  const order = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.5 });
  const lineOpacity = useTransform(order, [0.2, 0.66], [0, 0.72]);

  return (
    <section
      ref={ref}
      id="fragmentation"
      className="section-shell grid min-h-[120vh] items-center gap-12 py-28 lg:grid-cols-[0.8fr_1.2fr]"
    >
      <div className="max-w-xl">
        <p className="eyebrow mb-8">The Problem</p>
        <h2 className="text-balance text-[clamp(2.45rem,5.2vw,5.65rem)] font-light leading-[1]">
          Complexity is not the problem.
          <span className="block text-accent">Fragmentation is.</span>
        </h2>
      </div>

      <div className="relative min-h-[560px] overflow-hidden border border-line bg-surface/36 p-4 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(200,169,106,0.11),transparent_30rem)]" />
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {relationships.map(([a, b]) => {
            const start = agents[a].to;
            const end = agents[b].to;
            return (
              <motion.line
                key={`${a}-${b}`}
                x1={start[0]}
                y1={start[1]}
                x2={end[0]}
                y2={end[1]}
                stroke="rgba(200,169,106,0.44)"
                strokeWidth="0.08"
                style={{ opacity: lineOpacity, pathLength: order }}
              />
            );
          })}
        </svg>

        {agents.map((agent) => (
          <AgentNode key={agent.label} agent={agent} order={order} />
        ))}

        <motion.div
          style={{
            opacity: useTransform(order, [0.62, 0.9], [0, 1]),
            y: useTransform(order, [0.62, 0.9], [14, 0]),
          }}
          className="absolute bottom-8 left-8 right-8 border-t border-line pt-6"
        >
          <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted">
            The Shift
          </p>
          <p className="mt-3 text-balance text-2xl font-light text-text sm:text-4xl">
            What if complexity could become coordination?
          </p>
        </motion.div>
      </div>
    </section>
  );
}
