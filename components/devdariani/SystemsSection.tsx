import { SectionMotion } from "./SectionMotion";

const systems = [
  "Engineering Design",
  "BIM Coordination",
  "HVAC",
  "Electrical",
  "Plumbing",
  "Fire Protection",
  "BMS & Controls",
  "Procurement",
  "Installation",
  "Testing & Commissioning",
  "Digital Delivery",
];

export function SystemsSection() {
  return (
    <SectionMotion id="systems" className="section-shell py-28 md:py-40">
      <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-8">What We Orchestrate</p>
          <h2 className="max-w-4xl text-balance text-[clamp(2.5rem,6vw,6.2rem)] font-light leading-[0.98]">
            One delivery logic. Many interdependent systems.
          </h2>
        </div>
        <p className="max-w-md text-lg leading-relaxed text-muted">
          Each discipline remains distinct, but never isolated.
        </p>
      </div>
      <div className="grid border-l border-t border-line md:grid-cols-2 lg:grid-cols-3">
        {systems.map((system, index) => (
          <div
            key={system}
            className="group min-h-36 border-b border-r border-line p-6 transition-colors duration-500 hover:bg-surface/60"
          >
            <p className="mb-8 text-[0.68rem] uppercase tracking-[0.2em] text-muted">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="text-2xl font-light text-text transition-colors duration-500 group-hover:text-accent">
              {system}
            </h3>
          </div>
        ))}
      </div>
    </SectionMotion>
  );
}
