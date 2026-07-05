import {
  EditorialFooter,
  EditorialHeader,
  EditorialSection,
  KineticSpread,
  StudioStatement,
  SystemsConstellation,
  SystemsField,
  WorkIndex,
} from "@/components/devdariani";

export default function Home() {
  return (
    <main>
      <EditorialHeader />

      <section id="index" className="min-h-screen bg-dark text-ivory">
        <div className="section-shell flex min-h-screen flex-col justify-between pb-16 pt-32 md:pb-24 md:pt-40">
          <EditorialSection className="max-w-6xl pt-[18vh]">
            <p className="mb-10 text-[clamp(2.5rem,10.6vw,11rem)] font-medium leading-[0.86] text-ivory">
              DEVDARIANI
            </p>
            <h1 className="text-[clamp(2rem,5vw,5.8rem)] font-light leading-[0.98] text-ivory/88">
              Engineering the Whole.
            </h1>
          </EditorialSection>
          <EditorialSection delay={0.18} className="flex justify-between gap-8 text-sm uppercase tracking-[0.22em] text-ivory/52">
            <p>The Art of Orchestrics™</p>
            <p>(1) Welcome</p>
          </EditorialSection>
        </div>
      </section>

      <SystemsConstellation />

      <KineticSpread />

      <StudioStatement
        kicker="Statement"
        line="Buildings are orchestrated."
      />

      <StudioStatement
        dark
        kicker="Core"
        line="Complexity deserves coordination."
      />

      <EditorialSection
        id="orchestrics"
        className="section-shell flex min-h-[80vh] items-center py-24 md:py-36"
      >
        <div className="grid w-full gap-16 md:grid-cols-[0.75fr_1.25fr] md:items-end">
          <p className="text-sm uppercase tracking-[0.24em] text-muted">(2) Orchestrics™</p>
          <div>
            <h2 className="text-[clamp(3.4rem,9vw,9.5rem)] font-light leading-none text-ink">
              Orchestrics™
            </h2>
            <p className="mt-8 max-w-xl text-[clamp(1.05rem,1.8vw,1.45rem)] font-light leading-snug text-muted">
              Complex projects. One coordinated system.
            </p>
          </div>
        </div>
      </EditorialSection>

      <SystemsField />

      <WorkIndex />

      <EditorialSection
        id="contact"
        className="section-shell flex min-h-screen items-center py-24 md:py-40"
      >
        <div className="max-w-5xl">
          <p className="mb-10 text-sm uppercase tracking-[0.24em] text-muted">
            Contact
          </p>
          <h2 className="text-balance text-[clamp(2.7rem,7vw,7.2rem)] font-light leading-[0.98] text-ink">
            Coordination instead of compromise.
          </h2>
          <a href="mailto:hello@devdariani.com" className="editorial-button mt-12">
            Start the Conversation
          </a>
        </div>
      </EditorialSection>

      <EditorialFooter />
    </main>
  );
}
