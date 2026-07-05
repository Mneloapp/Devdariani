import { EditorialSection } from "./EditorialSection";

const work = [
  ["Complex Mixed-Use Building", "Tbilisi", "2026", "In Development"],
  ["Hospitality Building Systems", "Georgia", "2026", "In Development"],
  ["Industrial Facility Coordination", "Georgia", "2026", "Concept"],
];

export function WorkIndex() {
  return (
    <EditorialSection
      id="work"
      className="section-shell flex min-h-screen items-center py-24 md:py-40"
    >
      <div className="w-full">
        <div className="mb-16 grid gap-6 md:grid-cols-[0.35fr_1fr] md:items-end">
          <p className="text-sm uppercase tracking-[0.24em] text-muted">Selected Work</p>
          <h2 className="text-[clamp(2.6rem,6vw,6.4rem)] font-light leading-none text-ink">
            Work in formation.
          </h2>
        </div>
        <div className="border-t border-ink/14 text-sm md:text-base">
          <div className="hidden grid-cols-[1.3fr_0.6fr_0.35fr_0.65fr] border-b border-ink/14 py-4 uppercase tracking-[0.18em] text-muted md:grid">
            <p>Project</p>
            <p>Location</p>
            <p>Year</p>
            <p>Status</p>
          </div>
          {work.map(([project, location, year, status]) => (
            <div
              key={project}
              className="grid gap-3 border-b border-ink/14 py-6 md:grid-cols-[1.3fr_0.6fr_0.35fr_0.65fr]"
            >
              <p className="text-xl font-light text-ink md:text-2xl">{project}</p>
              <p className="text-muted">{location}</p>
              <p className="text-muted">{year}</p>
              <p className="text-muted">{status}</p>
            </div>
          ))}
        </div>
      </div>
    </EditorialSection>
  );
}
