export function EditorialHeader() {
  return (
    <header className="section-shell pointer-events-none absolute left-0 right-0 top-0 z-40">
      <nav
        className="pointer-events-auto flex flex-col gap-4 border-b border-ivory/12 py-5 text-[0.66rem] uppercase tracking-[0.18em] text-ivory/58 sm:flex-row sm:items-center sm:justify-between sm:text-[0.72rem] sm:tracking-[0.2em]"
        aria-label="Primary navigation"
      >
        <a href="#index" className="text-ivory">
          DEVDARIANI
        </a>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3 sm:flex sm:items-center sm:gap-5 md:gap-8">
          <a href="#index" className="transition-colors hover:text-ivory">
            (1) Index
          </a>
          <a href="#orchestrics" className="transition-colors hover:text-ivory">
            (2) Orchestrics
          </a>
          <a href="#work" className="transition-colors hover:text-ivory">
            (3) Work
          </a>
          <a href="#contact" className="transition-colors hover:text-ivory">
            (4) Contact
          </a>
        </div>
      </nav>
    </header>
  );
}
