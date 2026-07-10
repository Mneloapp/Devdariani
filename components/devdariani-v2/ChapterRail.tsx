import type { ChapterCopy } from "@/lib/devdariani-v2/copy";

type ChapterRailProps = {
  activeId: string;
  chapters: ChapterCopy[];
};

export function ChapterRail({ activeId, chapters }: ChapterRailProps) {
  return (
    <aside className="pointer-events-auto fixed bottom-16 left-8 top-36 z-30 hidden w-36 md:block">
      <ol className="relative grid gap-7 text-[0.66rem] uppercase tracking-[0.18em] text-[var(--text-muted)]">
        <span className="absolute bottom-4 left-[0.1rem] top-10 w-px bg-[var(--line)]" />
        {chapters.map((chapter) => {
          const active = chapter.id === activeId;
          return (
            <li key={chapter.id} className="relative">
              <a
                className={`grid gap-1 transition-colors ${active ? "text-[var(--text)]" : "hover:text-[var(--text)]"}`}
                href={`#${chapter.id}`}
              >
                <span>{chapter.number}</span>
                <span>{chapter.nav}</span>
              </a>
              {active ? (
                <span className="absolute -left-[0.18rem] top-1 h-1.5 w-1.5 rounded-full bg-[var(--text)]" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
