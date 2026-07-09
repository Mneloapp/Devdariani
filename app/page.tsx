import SystemDNAChain3D from "@/components/devdariani/SystemDNAChain3D";

const systems = [
  "Structure",
  "HVAC",
  "Electrical",
  "Plumbing",
  "Fire Protection",
  "BMS",
  "Procurement",
  "Commissioning",
  "Orchestrics™",
];

const process = [
  ["01", "Analyze", "Understand the entire ecosystem."],
  ["02", "Relate", "Map dependencies and risks."],
  ["03", "Coordinate", "Align systems before conflict becomes cost."],
  ["04", "Orchestrate", "Deliver one high-performance whole."],
];

export default function Home() {
  return (
    <main className="bg-[#070707] text-[#f4f1ea]">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_42%,rgba(244,241,234,0.09),transparent_30rem),linear-gradient(90deg,#070707_0%,#10100f_52%,#070707_100%)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(244,241,234,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(244,241,234,.1)_1px,transparent_1px)] [background-size:100%_56px,56px_100%]" />

        <div className="absolute inset-y-0 right-0 z-0 w-full opacity-90 md:w-[72%]">
          <SystemDNAChain3D activeIndex={9} progress={0.9} />
        </div>

        <header className="absolute left-0 right-0 top-0 z-20 px-7 py-8 md:px-14">
          <nav className="flex items-center justify-between text-xs uppercase tracking-[0.36em] text-[#f4f1ea]">
            <a href="#" className="font-medium">
              DEVDARIANI
            </a>
            <div className="flex items-center gap-8 text-[#c7c0b6]">
              <span className="hidden md:block">Menu</span>
              <span className="grid gap-1.5" aria-hidden="true">
                <span className="h-px w-8 bg-[#f4f1ea]" />
                <span className="h-px w-8 bg-[#f4f1ea]" />
              </span>
            </div>
          </nav>
        </header>

        <aside className="absolute bottom-16 left-7 top-44 z-20 hidden w-32 md:block">
          <ol className="grid gap-9 text-[0.68rem] uppercase tracking-[0.18em] text-[#8f8980]">
            {["Home", "Philosophy", "Approach", "Work", "Contact"].map((item, index) => (
              <li key={item} className={index === 0 ? "text-[#f4f1ea]" : ""}>
                <span className="block text-sm">{String(index).padStart(2, "0")}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </aside>

        <div className="relative z-10 flex min-h-screen items-center px-7 pt-20 md:px-[13vw]">
          <div className="max-w-5xl">
            <p className="mb-8 text-xs uppercase tracking-[0.42em] text-[#b8b1a6]">
              The Art of Orchestrics™
            </p>
            <h1 className="text-[clamp(4.4rem,11vw,10.5rem)] font-light leading-[0.86] tracking-[-0.06em]">
              DEVDARIANI
            </h1>
            <div className="mt-8 h-px w-44 bg-[#f4f1ea]/30" />
            <p className="mt-8 text-[clamp(2rem,4.2vw,4.4rem)] font-light leading-none tracking-[-0.05em] text-[#f4f1ea]/90">
              Engineering the Whole.
            </p>
            <p className="mt-12 max-w-md text-xs uppercase leading-7 tracking-[0.24em] text-[#a7a096]">
              We orchestrate complex building systems into intelligent,
              coordinated wholes. Because excellence is never an accident.
            </p>
            <a
              href="#approach"
              className="mt-12 inline-flex min-w-72 items-center justify-between border-b border-[#f4f1ea]/65 pb-4 text-xs uppercase tracking-[0.24em] text-[#f4f1ea]"
            >
              Explore Our Approach
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="absolute right-8 top-[24%] z-10 hidden w-72 md:block">
          <div className="grid gap-7">
            {systems.map((system) => (
              <div key={system} className="grid grid-cols-[1fr_auto] items-center gap-5">
                <div className="h-px bg-[#f4f1ea]/24" />
                <p className="w-44 text-xs uppercase tracking-[0.26em] text-[#d8d2c8]">
                  {system}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-14 left-7 z-20 text-xs uppercase tracking-[0.28em] text-[#b8b1a6] md:left-14">
          • Scroll
        </p>
        <p className="absolute bottom-14 right-7 z-20 max-w-sm border-l border-[#f4f1ea]/45 pl-8 text-right text-xs uppercase leading-7 tracking-[0.24em] text-[#c7c0b6] md:right-14">
          Complexity is not the problem.
          <br />
          Fragmentation is.
        </p>
      </section>

      <section className="min-h-screen border-t border-[#f4f1ea]/10 bg-[#070707] px-7 py-28 text-[#f4f1ea] md:px-20 md:py-40">
        <div className="grid gap-16 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-8 text-xs uppercase tracking-[0.35em] text-[#9c968d]">
              01 / Philosophy
            </p>
            <h2 className="max-w-3xl text-[clamp(2.6rem,5.8vw,6.8rem)] font-light leading-[0.95] tracking-[-0.05em]">
              Modern buildings are no longer built.
              <br />
              They are orchestrated.
            </h2>
          </div>
          <div className="self-end text-sm uppercase leading-7 tracking-[0.22em] text-[#9c968d]">
            Complexity is inevitable.
            <br />
            Fragmentation is optional.
          </div>
        </div>
      </section>

      <section id="approach" className="min-h-screen border-t border-[#f4f1ea]/10 bg-[#070707] px-7 py-28 text-[#f4f1ea] md:px-20 md:py-40">
        <div className="grid gap-16 md:grid-cols-[0.8fr_1fr]">
          <div>
            <p className="mb-8 text-xs uppercase tracking-[0.35em] text-[#9c968d]">
              02 / Approach
            </p>
            <h2 className="max-w-3xl text-[clamp(2.6rem,5vw,5.8rem)] font-light leading-[0.98] tracking-[-0.05em]">
              From Fragmentation
              <br />
              to Orchestrics™
            </h2>
          </div>
          <div className="grid content-end gap-9">
            {process.map(([number, title, copy]) => (
              <div key={title} className="grid gap-3 border-l border-[#f4f1ea]/28 pl-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[#9c968d]">
                  {number}
                </p>
                <h3 className="text-xl uppercase tracking-[0.18em] text-[#f4f1ea]">
                  {title}
                </h3>
                <p className="text-sm text-[#9c968d]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#f4f1ea]/10 bg-[#070707] px-7 py-28 text-[#f4f1ea] md:px-20 md:py-40">
        <div className="grid gap-16 md:grid-cols-3">
          {["Perfect Control", "Quiet Confidence", "Precision in Every Detail"].map((item, index) => (
            <div key={item}>
              <p className="mb-5 text-xs uppercase tracking-[0.35em] text-[#9c968d]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="text-3xl font-light tracking-[-0.04em] md:text-5xl">
                {item}
              </h3>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#f4f1ea]/10 bg-[#070707] px-7 py-28 text-[#f4f1ea] md:px-20 md:py-40">
        <div className="max-w-5xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-[#9c968d]">
            04 / Contact
          </p>
          <h2 className="text-[clamp(2.8rem,6vw,7rem)] font-light leading-[0.98] tracking-[-0.05em]">
            If your project demands coordination instead of compromise, start
            the conversation.
          </h2>
          <a
            href="mailto:info@devdariani.com"
            className="mt-12 inline-block border border-[#f4f1ea]/55 px-7 py-4 text-sm uppercase tracking-[0.25em] transition hover:bg-[#f4f1ea] hover:text-[#070707]"
          >
            Start the Conversation
          </a>
        </div>
      </section>
    </main>
  );
}
