"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type SectionMotionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function SectionMotion({ children, className = "", id }: SectionMotionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-18% 0px" }}
      transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
