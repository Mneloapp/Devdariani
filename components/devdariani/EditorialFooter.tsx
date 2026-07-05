export function EditorialFooter() {
  return (
    <footer className="section-shell border-t border-ink/14 py-10">
      <div className="grid gap-8 text-sm text-muted md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mb-3 text-xl tracking-[0.18em] text-ink">DEVDARIANI</p>
          <p>The Art of Orchestrics™</p>
        </div>
        <div className="flex flex-col gap-2 md:text-right">
          <a href="https://devdariani.com">devdariani.com</a>
          <a href="https://devdariani.ge">devdariani.ge</a>
        </div>
      </div>
    </footer>
  );
}
