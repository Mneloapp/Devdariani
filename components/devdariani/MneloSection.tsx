import { SectionMotion } from "./SectionMotion";

export function MneloSection() {
  return (
    <SectionMotion id="mnelo" className="section-shell py-28 md:py-44">
      <div className="relative overflow-hidden border border-line bg-surface/46 p-8 md:p-14">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(200,169,106,0.08))]" />
        <div className="relative max-w-4xl">
          <p className="eyebrow mb-8">Mnelo Connection</p>
          <h2 className="text-balance text-[clamp(2.6rem,6vw,6.4rem)] font-light leading-[0.98]">
            Every methodology needs an engine.
          </h2>
          <p className="mt-10 max-w-3xl text-[clamp(1.25rem,2.5vw,2.55rem)] font-light leading-snug text-text/82">
            Mnelo is the digital engine behind Orchestrics™ — built to bring
            intelligence, structure and automation to engineering delivery.
          </p>
          <a href="https://mnelo.com" className="premium-button mt-10">
            Explore Mnelo
          </a>
        </div>
      </div>
    </SectionMotion>
  );
}
