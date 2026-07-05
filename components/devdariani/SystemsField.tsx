"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const systems = [
  { label: "Structure", x: "6%", y: "18%" },
  { label: "HVAC", x: "42%", y: "9%" },
  { label: "Electrical", x: "70%", y: "28%" },
  { label: "Plumbing", x: "18%", y: "58%" },
  { label: "Fire", x: "58%", y: "65%" },
  { label: "BMS", x: "83%", y: "78%" },
  { label: "Procurement", x: "4%", y: "86%" },
  { label: "Commissioning", x: "46%", y: "42%" },
];

export function SystemsField() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 30%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 60, damping: 22 });
  const scale = useTransform(progress, [0, 1], [0.96, 1]);
  const opacity = useTransform(progress, [0, 0.35], [0.45, 1]);

  return (
    <section
      ref={ref}
      className="section-shell flex min-h-screen items-center py-24 md:py-40"
    >
      <div className="relative h-[72vh] min-h-[560px] w-full overflow-hidden">
        <motion.div style={{ scale, opacity }} className="absolute inset-0">
          {systems.map((system, index) => (
            <motion.p
              key={system.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
              className="absolute text-[clamp(1.45rem,4.2vw,5rem)] font-light leading-none text-ink"
              style={{ left: system.x, top: system.y }}
            >
              {system.label}
            </motion.p>
          ))}
        </motion.div>
        <p className="absolute bottom-0 right-0 max-w-sm text-right text-sm uppercase tracking-[0.24em] text-muted">
          Systems move as one.
        </p>
      </div>
    </section>
  );
}
