import { SectionMotion } from "./SectionMotion";

export function MneloSection() {
  return (
    <SectionMotion
      id="mnelo"
      className="section-shell flex min-h-screen items-center py-28 md:py-44"
    >
      <div className="relative w-full overflow-hidden py-20">
        <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line opacity-50" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="eyebrow mb-8">Mnelo</p>
          <h2 className="text-balance text-[clamp(2.8rem,7vw,7.4rem)] font-light leading-[0.96]">
            Every methodology needs an engine.
          </h2>
          <p className="mx-auto mt-10 max-w-2xl text-balance text-[clamp(1.15rem,2.2vw,2.1rem)] font-light leading-snug text-text/74">
            Mnelo powers Orchestrics™ with digital intelligence.
          </p>
          <a href="https://mnelo.com" className="premium-button mt-10">
            Explore Mnelo
          </a>
        </div>
      </div>
    </SectionMotion>
  );
}
