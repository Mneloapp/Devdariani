"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const work = [
  ["Mixed-Use", "Tbilisi / 2026"],
  ["Hospitality", "Georgia / 2026"],
  ["Industrial", "Concept"],
];

export function WorkIndex() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 24 });
  const y = useTransform(progress, [0, 1], [60, -70]);

  return (
    <section
      ref={ref}
      id="work"
      className="section-shell min-h-screen py-24 md:py-40"
    >
      <div className="mb-12 flex items-end justify-between gap-8">
        <p className="text-sm uppercase tracking-[0.24em] text-muted">(3) Work</p>
        <p className="text-sm uppercase tracking-[0.24em] text-muted">Selected / Soon</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {work.map(([title, meta], index) => (
          <motion.article
            key={title}
            style={{ y: index === 1 ? y : undefined }}
            className="group"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-dark">
              <div
                className="absolute inset-0 opacity-80 transition-transform duration-700 group-hover:scale-105"
                style={{
                  background:
                    index === 0
                      ? "linear-gradient(135deg, rgba(244,241,234,.18), transparent 45%), #10100f"
                      : index === 1
                        ? "radial-gradient(circle at 35% 30%, rgba(244,241,234,.2), transparent 18rem), #d7d2c7"
                        : "linear-gradient(180deg, rgba(17,17,17,.08), transparent), #c8c5bc",
                }}
              />
              <div className="absolute inset-8 border border-ivory/14 mix-blend-difference" />
            </div>
            <div className="mt-5 flex items-center justify-between gap-6 border-t border-ink/14 pt-4">
              <h3 className="text-2xl font-light text-ink">{title}</h3>
              <p className="text-right text-xs uppercase tracking-[0.18em] text-muted">
                {meta}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
