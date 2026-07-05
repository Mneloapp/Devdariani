"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

type StudioStatementProps = {
  dark?: boolean;
  kicker: string;
  line: string;
};

export function StudioStatement({ dark = false, kicker, line }: StudioStatementProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 82%", "end 40%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 24 });
  const y = useTransform(progress, [0, 1], [42, -10]);
  const opacity = useTransform(progress, [0, 0.45], [0.25, 1]);

  return (
    <section
      ref={ref}
      className={`${dark ? "bg-dark text-ivory" : "bg-paper text-ink"} min-h-screen`}
    >
      <div className="section-shell flex min-h-screen items-center py-24 md:py-40">
        <motion.div style={{ y, opacity }} className="max-w-6xl">
          <p className={`mb-12 text-sm uppercase tracking-[0.24em] ${dark ? "text-ivory/50" : "text-muted"}`}>
            {kicker}
          </p>
          <h2 className="text-balance text-[clamp(3rem,8.4vw,10rem)] font-light leading-[0.9]">
            {line}
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
