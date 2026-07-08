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
  const titleY = useTransform(smooth, [0, 1], [0, -140]);
  const titleOpacity = useTransform(smooth, [0, 0.75], [1, 0.32]);
  const fieldScale = useTransform(smooth, [0, 1], [0.72, 1.24]);
  const fieldOpacity = useTransform(smooth, [0, 0.18, 0.78], [0.12, 0.55, 0.9]);
  const spatialY = useTransform(smooth, [0, 1], [80, -90]);
  const spatialRotate = useTransform(smooth, [0, 1], [-10, 10]);
  const meterWidth = useTransform(smooth, [0, 1], ["18%", "100%"]);

  useMotionValueEvent(order, "change", (latest) => {
    setFieldOrder(latest);
  });

  return (
    <section
      ref={ref}
      id="index"
      className="relative min-h-[118vh] overflow-hidden bg-paper text-ink"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_46%,rgba(17,17,17,0.05),transparent_22rem),linear-gradient(180deg,#f7f3ec_0%,#f4f1ea_56%,#ece7dd_100%)]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(17,17,17,.18)_1px,transparent_1px)] [background-size:100%_48px]" />

      <motion.div
        style={{ scale: fieldScale, opacity: fieldOpacity }}
        className="absolute inset-x-[-22%] top-[19%] h-[62vh] md:inset-x-[14%] md:top-[23%] md:h-[58vh]"
      >
        {shouldRender3D ? (
          <div className="h-full w-full">
            <RelationalField3D order={fieldOrder} tone="light" />
          </div>
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(17,17,17,0.11),transparent_22rem)]" />
        )}
      </motion.div>

      <motion.div
        style={{ y: spatialY, rotate: spatialRotate }}
        className="pointer-events-none absolute -left-[18vw] top-[30%] hidden origin-center text-[clamp(7rem,18vw,24rem)] font-semibold leading-none text-ink/[0.055] md:block"
      >
        SYSTEM
      </motion.div>
      <motion.div
        style={{ y: spatialY }}
        className="pointer-events-none absolute -right-[20vw] top-[36%] hidden text-[clamp(6rem,16vw,22rem)] font-semibold leading-none text-ink/[0.06] md:block"
      >
        ORDER
      </motion.div>
      <div className="absolute bottom-[19%] left-[8%] right-[8%] h-px bg-ink/10" />

      <div className="section-shell relative z-10 flex min-h-screen flex-col justify-between pb-14 pt-28 md:pb-20 md:pt-36">
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          className="grid min-h-[58vh] place-items-center pt-[12vh] text-center"
        >
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="mb-10 text-[0.68rem] uppercase tracking-[0.28em] text-ink/48 md:text-xs"
            >
              The Art of Orchestrics™
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(3.2rem,9.8vw,11rem)] font-light leading-[0.86] text-ink"
            >
              Engineering{" "}
              <span className="block">the Whole.</span>
            </motion.h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-8 text-xs uppercase tracking-[0.22em] text-ink/52 md:grid-cols-[1fr_auto]"
        >
          <div className="grid gap-4 sm:grid-cols-[auto_auto_auto] sm:justify-start sm:gap-10">
            <p>DEVDARIANI</p>
            <p>Orchestrics™</p>
            <a href="#orchestrics" className="text-ink transition-opacity hover:opacity-55">
              Discover
            </a>
          </div>
          <div className="min-w-72">
            <div className="mb-3 flex justify-between gap-5">
              <span>Complexity</span>
              <span>Coordination</span>
              <span>Order</span>
            </div>
            <div className="h-px bg-ink/18">
              <motion.div className="h-px bg-ink/72" style={{ width: meterWidth }} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
