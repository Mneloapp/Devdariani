"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const RelationalField3D = dynamic(
  () => import("./RelationalField3D").then((mod) => mod.RelationalField3D),
  { ssr: false },
);

function useShouldRender3D() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.innerWidth < 760;
    setEnabled(!reduce && !coarse && !narrow);
  }, []);

  return enabled;
}

export function Hero3D() {
  const ref = useRef<HTMLElement>(null);
  const shouldRender3D = useShouldRender3D();
  const [fieldOrder, setFieldOrder] = useState(0.16);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });
  const order = useTransform(smooth, [0, 1], [0.16, 0.92]);
  const titleY = useTransform(smooth, [0, 1], [0, -82]);
  const titleOpacity = useTransform(smooth, [0, 0.88], [1, 0.55]);

  useMotionValueEvent(order, "change", (latest) => {
    setFieldOrder(latest);
  });

  return (
    <section
      ref={ref}
      id="index"
      className="relative min-h-screen overflow-hidden bg-dark text-ivory"
    >
      <div className="absolute inset-0 opacity-80">
        {shouldRender3D ? (
          <motion.div className="h-full w-full">
            <RelationalField3D order={fieldOrder} />
          </motion.div>
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_70%_38%,rgba(244,241,234,0.12),transparent_24rem)]" />
        )}
      </div>

      <div className="absolute left-[8%] right-[8%] top-[18%] h-px bg-ivory/12" />
      <div className="absolute bottom-[24%] left-[18%] right-[28%] h-px bg-ivory/10" />

      <div className="section-shell relative z-10 flex min-h-screen flex-col justify-between pb-16 pt-32 md:pb-24 md:pt-40">
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl pt-[18vh]"
        >
          <motion.p
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1.25, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 text-[clamp(2.5rem,10.6vw,11rem)] font-medium leading-[0.86] text-ivory"
          >
            DEVDARIANI
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.56, ease: [0.22, 1, 0.36, 1] }}
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
          <p>Complexity / Coordination / Order</p>
        </motion.div>
      </div>
    </section>
  );
}
