"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

export function DynamicHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 24 });
  const titleY = useTransform(progress, [0, 1], [0, -90]);
  const titleScale = useTransform(progress, [0, 1], [1, 0.94]);
  const lineOne = useTransform(progress, [0, 1], ["8%", "28%"]);
  const lineTwo = useTransform(progress, [0, 1], ["82%", "58%"]);
  const panelY = useTransform(progress, [0, 1], [42, -36]);

  return (
    <section ref={ref} id="index" className="relative min-h-screen overflow-hidden bg-dark text-ivory">
      <motion.div
        className="absolute top-[18%] h-px bg-ivory/16"
        style={{ left: lineOne, right: "12%" }}
      />
      <motion.div
        className="absolute bottom-[24%] h-px bg-ivory/12"
        style={{ left: "18%", right: lineTwo }}
      />
      <motion.div
        style={{ y: panelY }}
        className="absolute right-[8%] top-[24%] hidden h-[44vh] w-px bg-ivory/12 md:block"
      />

      <div className="section-shell flex min-h-screen flex-col justify-between pb-16 pt-32 md:pb-24 md:pt-40">
        <motion.div
          style={{ y: titleY, scale: titleScale, transformOrigin: "left center" }}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl pt-[18vh]"
        >
          <motion.p
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1.25, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 text-[clamp(2.5rem,10.6vw,11rem)] font-medium leading-[0.86] text-ivory"
          >
            DEVDARIANI
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.58, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(2rem,5vw,5.8rem)] font-light leading-[0.98] text-ivory/88"
          >
            Engineering the Whole.
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-between gap-8 text-sm uppercase tracking-[0.22em] text-ivory/52"
        >
          <p>The Art of Orchestrics™</p>
          <p>(1) Welcome</p>
        </motion.div>
      </div>
    </section>
  );
}
