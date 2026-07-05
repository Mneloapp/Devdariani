import { SectionMotion } from "./SectionMotion";

const principles = [
  "Every system has a purpose.",
  "Every purpose creates relationships.",
  "Every relationship creates order.",
];

export function MethodologySection() {
  return (
    <SectionMotion className="section-shell flex min-h-screen items-center py-28 md:py-40">
      <div className="w-full">
        <p className="eyebrow mb-12">The Logic</p>
        <div className="grid gap-10 md:gap-14">
          {principles.map((principle, index) => (
            <p
              key={principle}
              className="text-balance text-[clamp(2.4rem,6vw,6.8rem)] font-light leading-[0.98] text-text"
              style={{ opacity: 1 - index * 0.14 }}
            >
              {principle}
            </p>
          ))}
        </div>
      </div>
    </SectionMotion>
  );
}
