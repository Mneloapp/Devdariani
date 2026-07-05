import { SectionMotion } from "./SectionMotion";

const principles = [
  "Every system has a purpose.",
  "Every purpose creates relationships.",
  "Every relationship creates order.",
];

export function MethodologySection() {
  return (
    <SectionMotion className="section-shell grid gap-16 py-28 md:py-40 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="eyebrow mb-8">What Is Orchestrics</p>
        <h2 className="max-w-2xl text-balance text-[clamp(2.4rem,5vw,5.2rem)] font-light leading-[1.02]">
          Coordination is designed before it is delivered.
        </h2>
      </div>
      <div className="space-y-10">
        <p className="max-w-3xl text-balance text-[clamp(1.45rem,3vw,3.2rem)] font-light leading-tight text-text/86">
          Orchestrics™ is the methodology of transforming complex building
          projects into coordinated, high-performing systems.
        </p>
        <div className="grid gap-px bg-line">
          {principles.map((principle) => (
            <div key={principle} className="bg-background py-6 text-2xl font-light text-text/90">
              {principle}
            </div>
          ))}
        </div>
      </div>
    </SectionMotion>
  );
}
