"use client";

import { motion, useScroll, useTransform } from "framer-motion";

const navItems = [
  ["Orchestrics", "#orchestrics"],
  ["Framework", "#framework"],
  ["Systems", "#systems"],
  ["Mnelo", "#mnelo"],
  ["Contact", "#contact"],
];

export function FloatingNav() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.08, 0.14], [0, 0, 1]);
  const y = useTransform(scrollYProgress, [0.08, 0.14], [-14, 0]);

  return (
    <motion.nav
      style={{ opacity, y }}
      className="fixed left-1/2 top-5 z-50 hidden w-[min(920px,calc(100%-2rem))] -translate-x-1/2 items-center justify-between border border-line bg-background/72 px-4 py-3 text-[0.68rem] uppercase tracking-[0.18em] text-muted backdrop-blur-xl md:flex"
      aria-label="Primary navigation"
    >
      <a href="#top" className="text-text">
        DEVDARIANI
      </a>
      <div className="flex items-center gap-5">
        {navItems.map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="transition-colors duration-300 hover:text-text"
          >
            {label}
          </a>
        ))}
      </div>
    </motion.nav>
  );
}
