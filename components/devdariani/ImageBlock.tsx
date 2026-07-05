import { EditorialSection } from "./EditorialSection";

export function ImageBlock() {
  return (
    <EditorialSection className="section-shell py-24 md:py-36">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink md:aspect-[16/9]">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(244,241,234,0.06),transparent_35%),radial-gradient(circle_at_72%_28%,rgba(244,241,234,0.2),transparent_28rem),linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
        <div className="absolute inset-x-[12%] top-1/2 h-px bg-ivory/24" />
        <div className="absolute bottom-[18%] left-[18%] h-px w-[42%] bg-ivory/14" />
        <div className="absolute right-[20%] top-[18%] h-[64%] w-px bg-ivory/14" />
      </div>
      <p className="mt-5 text-[0.72rem] uppercase tracking-[0.24em] text-muted">
        Detail / Coordination / System
      </p>
    </EditorialSection>
  );
}
