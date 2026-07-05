import { EditorialSection } from "./EditorialSection";

export function ImageBlock() {
  return (
    <EditorialSection className="section-shell py-24 md:py-36">
      <div className="grid gap-5 md:grid-cols-[1.25fr_0.75fr] md:items-end">
        <div className="relative aspect-[4/3] overflow-hidden bg-ink md:aspect-[16/10]">
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(244,241,234,0.06),transparent_35%),radial-gradient(circle_at_72%_28%,rgba(244,241,234,0.2),transparent_28rem),linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
          <div className="absolute inset-x-[12%] top-1/2 h-px bg-ivory/24" />
          <div className="absolute bottom-[18%] left-[18%] h-px w-[42%] bg-ivory/14" />
          <div className="absolute right-[20%] top-[18%] h-[64%] w-px bg-ivory/14" />
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-[#d9d5cc]">
          <div className="absolute inset-8 border border-ink/16" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-ink/12" />
          <div className="absolute bottom-10 left-10 right-10 h-px bg-ink/14" />
          <p className="absolute bottom-5 left-5 text-[0.68rem] uppercase tracking-[0.24em] text-muted">
            System Study
          </p>
        </div>
      </div>
      <p className="mt-5 text-[0.72rem] uppercase tracking-[0.24em] text-muted">
        (2a) Detail / Coordination / System
      </p>
    </EditorialSection>
  );
}
