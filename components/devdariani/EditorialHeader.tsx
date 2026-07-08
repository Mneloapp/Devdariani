export function EditorialHeader() {
  return (
    <header className="section-shell pointer-events-none absolute left-0 right-0 top-0 z-40">
      <nav
        className="pointer-events-auto flex items-start justify-between border-b border-ink/12 py-5 text-[0.66rem] uppercase tracking-[0.18em] text-ink/58 sm:text-[0.72rem] sm:tracking-[0.2em]"
        aria-label="Primary navigation"
      >
        <a href="#index" className="text-ink">
          DEVDARIANI
        </a>
        <div className="hidden items-center gap-5 md:flex md:gap-8">
          <a href="#index" className="transition-colors hover:text-ink">
            (1) Index
          </a>
          <a href="#orchestrics" className="transition-colors hover:text-ink">
            (2) Orchestrics
          </a>
          <a href="#work" className="transition-colors hover:text-ink">
            (3) Work
          </a>
          <a href="#contact" className="transition-colors hover:text-ink">
            (4) Contact
          </a>
        </div>
        <a href="#contact" className="flex w-14 flex-col gap-2 pt-1 md:hidden" aria-label="Contact">
          <span className="h-px w-full bg-ink" />
          <span className="h-px w-full bg-ink" />
        </a>
      </nav>
    </header>
  );
}
