"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";

type ProjectsThresholdProps = {
  handoffProgressRef: RefObject<number>;
};

function smoothstep(min: number, max: number, value: number) {
  const normalized = Math.min(1, Math.max(0, (value - min) / Math.max(0.0001, max - min)));
  return normalized * normalized * (3 - 2 * normalized);
}

export function ProjectsThreshold({ handoffProgressRef }: ProjectsThresholdProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;

    const update = () => {
      animationFrame = 0;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = Math.max(1, window.innerHeight);
      const rawProgress = media.matches
        ? 1
        : Math.min(1, Math.max(0, (viewportHeight - rect.top) / viewportHeight));
      const gateProgress = media.matches ? 1 : handoffProgressRef.current;
      const effectiveProgress = Math.min(rawProgress, gateProgress);
      const planeProgress = smoothstep(0, 0.72, effectiveProgress);
      const headerProgress = smoothstep(0.18, 0.62, effectiveProgress);
      const indexProgress = smoothstep(0.5, 0.96, effectiveProgress);
      const gateOffset = (rawProgress - effectiveProgress) * viewportHeight;

      section.style.setProperty("--projects-clip", `${((1 - planeProgress) * 17).toFixed(2)}%`);
      section.style.setProperty("--projects-gate-offset", `${gateOffset.toFixed(2)}px`);
      section.style.setProperty("--projects-header-opacity", headerProgress.toFixed(3));
      section.style.setProperty("--projects-index-opacity", indexProgress.toFixed(3));
      section.style.setProperty("--projects-index-shift", `${((1 - indexProgress) * 2.5).toFixed(2)}rem`);
      section.style.setProperty("--projects-rule-scale", planeProgress.toFixed(3));

      const letters = titleRef.current?.querySelectorAll<HTMLElement>("[data-project-letter]");
      letters?.forEach((letter, index) => {
        const stagger = index * 0.045;
        const reveal = smoothstep(0.12 + stagger, 0.58 + stagger, effectiveProgress);
        const inverse = 1 - reveal;
        letter.style.opacity = reveal.toFixed(3);
        letter.style.clipPath = `inset(0 0 ${(inverse * 100).toFixed(2)}% 0)`;
        letter.style.transform = `translate3d(0, ${(inverse * 0.72).toFixed(3)}em, 0) skewY(${(
          inverse * -4
        ).toFixed(2)}deg)`;
      });

      if (!media.matches && rawProgress > gateProgress + 0.0005) {
        animationFrame = window.requestAnimationFrame(update);
      }
    };

    const requestUpdate = () => {
      if (animationFrame !== 0) return;
      animationFrame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    media.addEventListener("change", requestUpdate);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      media.removeEventListener("change", requestUpdate);
    };
  }, [handoffProgressRef]);

  return (
    <section aria-labelledby="projects-title" className="projects-threshold" id="projects" ref={sectionRef}>
      <div className="projects-threshold__frame">
        <div aria-hidden="true" className="projects-threshold__grid" />
        <header className="projects-threshold__header">
          <span>Projects</span>
          <span>Selected work</span>
        </header>

        <div className="projects-threshold__hero">
          <p>Selected work</p>
          <h2 id="projects-title" ref={titleRef}>
            <span className="sr-only">Projects</span>
            {Array.from("PROJECTS").map((letter, index) => (
              <span aria-hidden="true" data-project-letter key={`${letter}-${index}`}>
                {letter}
              </span>
            ))}
          </h2>
          <p>Selected work will be published shortly.</p>
        </div>

        <div aria-hidden="true" className="projects-threshold__index">
          <i />
          <i />
          <i />
        </div>

        <footer className="projects-threshold__footer">Project index / Forthcoming</footer>
      </div>
    </section>
  );
}
