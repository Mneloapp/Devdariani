"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type EditorialSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
};

export function EditorialSection({
  children,
  className = "",
  delay = 0,
  id,
}: EditorialSectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
