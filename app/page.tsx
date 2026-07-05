import {
  DynamicHero,
  EditorialFooter,
  EditorialHeader,
  KineticSpread,
  StudioStatement,
  SystemsConstellation,
  WorkIndex,
} from "@/components/devdariani";

export default function Home() {
  return (
    <main>
      <EditorialHeader />
      <DynamicHero />

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

      <section
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
      </section>

      <WorkIndex />

      <section
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
      </section>

      <EditorialFooter />
    </main>
  );
}
