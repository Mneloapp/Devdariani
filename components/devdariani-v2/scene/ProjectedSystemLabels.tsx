"use client";

import { systems } from "@/lib/devdariani-v2/copy";

type ProjectedSystemLabelsProps = {
  activeChapter: string;
};

export function ProjectedSystemLabels({ activeChapter }: ProjectedSystemLabelsProps) {
  const activeAll = activeChapter === "systems" || activeChapter === "orchestrics";

  return (
    <div className="pointer-events-none fixed right-8 top-[22vh] z-20 hidden w-[22rem] md:block">
      <div className="grid gap-6">
        {systems.map((system, index) => (
          <div
            className={`grid grid-cols-[1fr_auto] items-center gap-5 transition-opacity duration-700 ${
              activeAll || index < 3 ? "opacity-100" : "opacity-34"
            }`}
            key={system}
          >
            <span className="h-px bg-[var(--line-strong)]" />
            <span className="w-44 text-[0.66rem] uppercase tracking-[0.24em] text-[var(--text)]">
              {system}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
