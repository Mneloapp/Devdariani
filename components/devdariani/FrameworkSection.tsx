import { SectionMotion } from "./SectionMotion";

const steps = [
  ["Understand", "We define the real complexity behind the project."],
  ["Map", "We identify systems, dependencies and risks."],
  ["Coordinate", "We align disciplines before conflict becomes cost."],
  ["Integrate", "We connect systems into one operational logic."],
  ["Execute", "We deliver with precision and accountability."],
  ["Validate", "We test, verify and commission the whole."],
  ["Optimize", "We improve performance beyond delivery."],
];

export function FrameworkSection() {
  return (
    <SectionMotion id="framework" className="section-shell py-28 md:py-44">
      <div className="mb-16 max-w-4xl">
        <p className="eyebrow mb-8">The Orchestrics Framework</p>
        <h2 className="text-balance text-[clamp(2.6rem,6vw,6.7rem)] font-light leading-[0.98]">
          From uncertainty to validated performance.
        </h2>
      </div>
      <div className="relative">
        <div className="absolute left-[1.15rem] top-0 hidden h-full w-px bg-line md:block" />
        <div className="space-y-5">
          {steps.map(([title, copy], index) => (
            <div
              key={title}
              className="grid gap-5 border border-line bg-background/42 p-5 md:grid-cols-[3rem_0.7fr_1.3fr] md:items-center md:border-x-0 md:border-b md:border-t-0 md:bg-transparent md:p-0 md:py-8"
            >
              <span className="flex h-9 w-9 items-center justify-center border border-accent/50 bg-background text-xs text-accent">
                {index + 1}
              </span>
              <h3 className="text-3xl font-light text-text">{title}</h3>
              <p className="text-lg leading-relaxed text-muted">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionMotion>
  );
}
