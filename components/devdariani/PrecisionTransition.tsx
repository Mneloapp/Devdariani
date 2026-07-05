import { SectionMotion } from "./SectionMotion";

export function PrecisionTransition() {
  return (
    <SectionMotion className="section-shell flex min-h-screen items-center py-28 md:py-44">
      <div className="relative w-full overflow-hidden py-20">
        <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line opacity-45" />
        <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(244,241,234,0.14),transparent)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="eyebrow mb-8">Precision</p>
          <h2 className="text-balance text-[clamp(2.8rem,7vw,7.4rem)] font-light leading-[0.96]">
            Precision is not a feature.
            <span className="block text-accent">It is a system.</span>
          </h2>
          <p className="mx-auto mt-10 max-w-2xl text-balance text-[clamp(1.15rem,2.2vw,2.1rem)] font-light leading-snug text-text/74">
            From design to delivery, every decision is connected.
          </p>
        </div>
      </div>
    </SectionMotion>
  );
}
