import {
  ApproachList,
  EditorialFooter,
  EditorialHeader,
  EditorialSection,
  ImageBlock,
  LargeStatement,
  PrincipleList,
  WorkIndex,
} from "@/components/devdariani";

const coordinatedSystems = [
  "Structure",
  "HVAC",
  "Electrical",
  "Plumbing",
  "Fire Protection",
  "BMS",
  "Procurement",
  "Commissioning",
];

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

      <LargeStatement
        eyebrow="Statement"
        lines={["Modern buildings are no longer built.", "They are orchestrated."]}
      />

      <ImageBlock />

      <LargeStatement
        dark
        eyebrow="Core Thought"
        lines={["Complexity deserves coordination."]}
      />

      <EditorialSection
        id="orchestrics"
        className="section-shell flex min-h-screen items-center py-24 md:py-40"
      >
        <div className="grid w-full gap-16 md:grid-cols-[0.75fr_1.25fr] md:items-end">
          <p className="text-sm uppercase tracking-[0.24em] text-muted">Orchestrics™</p>
          <div>
            <h2 className="text-[clamp(3.4rem,9vw,9.5rem)] font-light leading-none text-ink">
              Orchestrics™
            </h2>
            <p className="mt-8 max-w-2xl text-[clamp(1.15rem,2vw,1.7rem)] font-light leading-snug text-muted">
              A methodology for transforming complex building projects into
              coordinated systems.
            </p>
          </div>
        </div>
      </EditorialSection>

      <PrincipleList />

      <EditorialSection
        className="section-shell flex min-h-screen items-center py-24 md:py-40"
      >
        <div className="w-full">
          <p className="mb-14 text-sm uppercase tracking-[0.24em] text-muted">
            What We Coordinate
          </p>
          <div className="grid gap-x-10 gap-y-5 text-[clamp(2.1rem,5vw,6rem)] font-light leading-none text-ink md:grid-cols-2">
            {coordinatedSystems.map((system) => (
              <p key={system}>{system}</p>
            ))}
          </div>
        </div>
      </EditorialSection>

      <WorkIndex />
      <ApproachList />

      <EditorialSection
        id="contact"
        className="section-shell flex min-h-screen items-center py-24 md:py-40"
      >
        <div className="max-w-5xl">
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
