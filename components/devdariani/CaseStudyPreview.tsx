import { SectionMotion } from "./SectionMotion";

const rows = [
  ["Challenge", "Complex mixed-use building"],
  ["Complexity", "Interdependent systems moving through compressed delivery windows."],
  [
    "Orchestrics Approach",
    "Coordinating HVAC, fire, electrical and BMS into one validated delivery path.",
  ],
  ["Outcome", "A controlled framework for proof, sequencing and commissioning."],
];

export function CaseStudyPreview() {
  return (
    <SectionMotion id="proof" className="section-shell py-28 md:py-40">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="eyebrow mb-8">Proof</p>
          <h2 className="text-balance text-[clamp(2.5rem,5vw,5.8rem)] font-light leading-[1]">
            Case studies will become the evidence layer.
          </h2>
        </div>
        <div className="border border-line bg-surface/36">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="grid gap-5 border-b border-line p-6 last:border-b-0 md:grid-cols-[0.45fr_1fr]"
            >
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-accent">
                {label}
              </p>
              <p className="text-xl font-light leading-snug text-text/88">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionMotion>
  );
}
