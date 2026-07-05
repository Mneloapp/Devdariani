export function EditorialHeader() {
  return (
    <header className="section-shell pointer-events-none fixed left-0 right-0 top-0 z-40">
      <nav
        className="pointer-events-auto flex flex-col gap-4 border-b border-ink/10 py-5 text-[0.66rem] uppercase tracking-[0.18em] text-muted backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:text-[0.72rem] sm:tracking-[0.2em]"
        aria-label="Primary navigation"
      >
        <a href="#index" className="text-ink">
          DEVDARIANI
        </a>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3 sm:flex sm:items-center sm:gap-5 md:gap-8">
          <a href="#index" className="transition-colors hover:text-ink">
            Index
          </a>
          <a href="#orchestrics" className="transition-colors hover:text-ink">
            Orchestrics
          </a>
          <a href="#work" className="transition-colors hover:text-ink">
            Work
          </a>
          <a href="#contact" className="transition-colors hover:text-ink">
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}
