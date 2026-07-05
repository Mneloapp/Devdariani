import { SectionMotion } from "./SectionMotion";

export function CompanyIntro() {
  return (
    <SectionMotion className="section-shell flex min-h-screen items-center py-28 md:py-44">
      <div className="max-w-6xl">
        <p className="eyebrow mb-8">DEVDARIANI</p>
        <h2 className="text-balance text-[clamp(2.8rem,7vw,7.6rem)] font-light leading-[0.96]">
          DEVDARIANI exists to engineer the whole.
        </h2>
        <p className="mt-10 max-w-3xl text-balance text-[clamp(1.1rem,2.2vw,2.05rem)] font-light leading-snug text-text/74">
          We use Orchestrics™ to design, integrate and deliver complex building
          systems as one coordinated outcome.
        </p>
      </div>
    </SectionMotion>
  );
}
