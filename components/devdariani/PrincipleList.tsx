import { EditorialSection } from "./EditorialSection";

const principles = [
  ["01", "Perfect Control"],
  ["02", "Quiet Confidence"],
  ["03", "Precision in Every Detail"],
];

export function PrincipleList() {
  return (
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
              <p className="text-[clamp(2rem,5vw,5.4rem)] font-light leading-none text-ink">
                {title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </EditorialSection>
  );
}
