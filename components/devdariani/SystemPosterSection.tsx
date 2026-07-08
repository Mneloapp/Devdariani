"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const systems = [
  { name: "Structure", className: "left-[7%] top-[18%]" },
  { name: "HVAC", className: "left-[37%] top-[10%]" },
  { name: "Electrical", className: "right-[8%] top-[24%]" },
  { name: "Plumbing", className: "left-[18%] top-[48%]" },
  { name: "Fire", className: "right-[34%] top-[48%]" },
  { name: "BMS", className: "right-[10%] top-[56%]" },
  { name: "Procurement", className: "left-[8%] bottom-[14%]" },
  { name: "Commissioning", className: "right-[16%] bottom-[11%]" },
];

export function SystemPosterSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 24 });
  const yA = useTransform(progress, [0, 1], [80, -60]);
  const yB = useTransform(progress, [0, 1], [-30, 70]);
  const lineScale = useTransform(progress, [0.18, 0.68], [0.2, 1]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden bg-dark text-ivory"
      aria-labelledby="systems-title"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(244,241,234,.15),transparent_22rem),linear-gradient(180deg,#070707_0%,#11100d_48%,#070707_100%)]" />
      <motion.div
        style={{ scaleX: lineScale }}
        className="absolute left-[8%] right-[8%] top-1/2 h-px origin-left bg-ivory/24"
      />
      <motion.div
        style={{ scaleX: lineScale }}
        className="absolute bottom-[28%] left-[14%] right-[18%] h-px origin-right bg-ivory/14"
      />
      <div className="section-shell relative z-10 flex min-h-screen flex-col justify-between py-24 md:py-32">
        <div className="flex items-start justify-between gap-8 text-xs uppercase tracking-[0.24em] text-ivory/54">
          <p>System Field</p>
          <p className="hidden text-right md:block">Fragmentation becomes coordination</p>
        </div>

        <div className="relative min-h-[54vh]">
          <h2
            id="systems-title"
            className="absolute left-0 top-1/2 -translate-y-1/2 text-[clamp(3.5rem,14vw,15rem)] font-semibold leading-[0.78] text-ivory/10"
          >
            SYSTEMS
          </h2>
          <div className="hidden md:block">
            {systems.map((system, index) => (
              <motion.p
                key={system.name}
                style={{ y: index % 2 ? yA : yB }}
                initial={{ opacity: 0, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-18% 0px" }}
                transition={{
                  duration: 0.9,
                  delay: index * 0.055,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`absolute text-[clamp(1.9rem,4vw,5.2rem)] font-light leading-none text-ivory ${system.className}`}
              >
                {system.name}
              </motion.p>
            ))}
          </div>

          <div className="grid gap-4 pt-20 md:hidden">
            {systems.map((system, index) => (
              <motion.p
                key={system.name}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.04 }}
                className="border-b border-ivory/12 pb-4 text-[clamp(2.2rem,12vw,4.6rem)] font-light leading-none"
              >
                {system.name}
              </motion.p>
            ))}
          </div>
        </div>

        <div className="grid gap-6 border-t border-ivory/14 pt-8 md:grid-cols-[0.7fr_1.3fr]">
          <p className="text-xs uppercase tracking-[0.24em] text-ivory/48">
            Orchestrics™
          </p>
          <p className="max-w-4xl text-[clamp(1.7rem,3.6vw,4.6rem)] font-light leading-[0.95] text-ivory">
            Complexity is not removed.
            <span className="block text-ivory/48">It is aligned.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
