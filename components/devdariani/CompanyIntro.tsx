import { SectionMotion } from "./SectionMotion";

export function CompanyIntro() {
  return (
    <SectionMotion className="section-shell py-28 md:py-44">
      <div className="grid gap-14 border-y border-line py-16 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="eyebrow mb-8">DEVDARIANI</p>
          <h2 className="text-[clamp(2.7rem,7vw,7.4rem)] font-light leading-none">
            Engineering the Whole.
          </h2>
        </div>
        <div className="space-y-8 text-[clamp(1.25rem,2.2vw,2.35rem)] font-light leading-snug text-text/84">
          <p>DEVDARIANI exists to transform complexity into coordinated systems.</p>
          <p>
            We design, integrate and deliver complex building systems through
            Orchestrics™ — a methodology created to bring precision, control and
            clarity to modern projects.
          </p>
        </div>
      </div>
    </SectionMotion>
  );
}
