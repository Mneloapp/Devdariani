import { SectionMotion } from "./SectionMotion";

export function OrchestricsReveal() {
  return (
    <SectionMotion
      id="orchestrics"
      className="section-shell flex min-h-screen items-center justify-center py-32 text-center"
    >
      <div className="max-w-5xl">
        <p className="eyebrow mb-8">The Shift</p>
        <h2 className="text-[clamp(4rem,13vw,13rem)] font-light leading-none text-text">
          Orchestrics™
        </h2>
        <div className="hairline my-10" />
        <p className="mx-auto max-w-3xl text-balance text-[clamp(1.35rem,3vw,3rem)] font-light leading-tight text-text/84">
          The methodology of transforming complex building projects into
          coordinated, high-performing systems.
        </p>
      </div>
    </SectionMotion>
  );
}
