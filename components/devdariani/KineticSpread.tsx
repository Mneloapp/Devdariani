"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

export function KineticSpread() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 24 });
  const yA = useTransform(progress, [0, 1], [80, -80]);
  const yB = useTransform(progress, [0, 1], [-48, 64]);
  const yC = useTransform(progress, [0, 1], [120, -36]);

  return (
    <section ref={ref} className="section-shell py-20 md:py-32">
      <div className="grid min-h-[92vh] gap-5 md:grid-cols-[0.85fr_1.35fr_0.75fr] md:items-center">
        <motion.div
          style={{ y: yA }}
          className="relative aspect-[3/4] overflow-hidden bg-[#cfcac0]"
        >
          <div className="absolute inset-8 border border-ink/16" />
          <div className="absolute bottom-8 left-8 right-8 h-px bg-ink/18" />
        </motion.div>
        <motion.div
          style={{ y: yB }}
          className="relative aspect-[4/5] overflow-hidden bg-dark md:aspect-[5/4]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_32%,rgba(244,241,234,0.18),transparent_24rem),linear-gradient(120deg,rgba(244,241,234,0.08),transparent_42%)]" />
          <div className="absolute left-[16%] right-[16%] top-1/2 h-px bg-ivory/20" />
          <div className="absolute bottom-[18%] left-[18%] h-px w-[38%] bg-ivory/14" />
          <p className="absolute bottom-6 left-6 text-[0.68rem] uppercase tracking-[0.24em] text-ivory/50">
            Detail / Coordination / System
          </p>
        </motion.div>
        <motion.div
          style={{ y: yC }}
          className="relative aspect-[4/5] overflow-hidden bg-[#e2ded5]"
        >
          <div className="absolute left-1/2 top-0 h-full w-px bg-ink/12" />
          <div className="absolute inset-x-8 top-[32%] h-px bg-ink/14" />
          <div className="absolute inset-x-8 bottom-[24%] h-px bg-ink/14" />
        </motion.div>
      </div>
    </section>
  );
}
