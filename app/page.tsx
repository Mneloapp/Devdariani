import {
  EditorialFooter,
  EditorialHeader,
  EditorialSection,
  Hero3D,
  WorkIndex,
} from "@/components/devdariani";

const principles = [
  ["01", "Perfect Control"],
  ["02", "Quiet Confidence"],
  ["03", "Precision in Every Detail"],
];

export default function Home() {
  return (
    <main>
      <EditorialHeader />
      <Hero3D />

      <EditorialSection className="section-shell flex min-h-screen items-center py-24 md:py-40">
        <div className="max-w-6xl">
          <p className="mb-10 text-sm uppercase tracking-[0.24em] text-muted">
            Statement
          </p>
          <div className="space-y-4 text-[clamp(2.8rem,7.2vw,8.4rem)] font-light leading-[0.98] text-ink">
            <p>Modern buildings are no longer built.</p>
            <p>They are orchestrated.</p>
          </div>
          <p className="mt-20 max-w-4xl text-[clamp(2rem,5vw,5.4rem)] font-light leading-[1] text-ink">
            Complexity is not the problem.
            <span className="block text-muted">Fragmentation is.</span>
          </p>
        </div>
      </EditorialSection>

      <EditorialSection
        id="orchestrics"
        className="section-shell flex min-h-screen items-center py-24 md:py-40"
      >
        <div className="grid w-full gap-16 md:grid-cols-[0.65fr_1.35fr] md:items-end">
          <p className="text-sm uppercase tracking-[0.24em] text-muted">
            Orchestrics™
          </p>
          <div>
            <h2 className="text-[clamp(3.8rem,11vw,12rem)] font-light leading-none text-ink">
              Orchestrics™
            </h2>
            <p className="mt-10 max-w-3xl text-[clamp(1.2rem,2.2vw,2rem)] font-light leading-snug text-muted">
              A methodology for transforming complex building projects into
              coordinated systems.
            </p>
          </div>
        </div>
      </EditorialSection>

      <EditorialSection className="section-shell flex min-h-screen items-center py-24 md:py-40">
        <div className="w-full">
          <p className="mb-14 text-sm uppercase tracking-[0.24em] text-muted">
            Principles
          </p>
          <div className="border-t border-ink/14">
            {principles.map(([number, title]) => (
              <div
                key={title}
                className="grid gap-6 border-b border-ink/14 py-8 md:grid-cols-[0.2fr_1fr]"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-muted">
                  {number} /
                </p>
                <p className="text-[clamp(2.1rem,5.2vw,5.8rem)] font-light leading-none text-ink">
                  {title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </EditorialSection>

      <WorkIndex />

      <EditorialSection
        id="contact"
        className="section-shell flex min-h-screen items-center py-24 md:py-40"
      >
        <div className="max-w-6xl">
          <p className="mb-10 text-sm uppercase tracking-[0.24em] text-muted">
            Contact
          </p>
          <h2 className="text-balance text-[clamp(2.7rem,7vw,7.2rem)] font-light leading-[0.98] text-ink">
            If your project demands coordination instead of compromise, start
            the conversation.
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
