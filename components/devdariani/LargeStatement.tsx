import { EditorialSection } from "./EditorialSection";

type LargeStatementProps = {
  dark?: boolean;
  eyebrow: string;
  lines: string[];
};

export function LargeStatement({ dark = false, eyebrow, lines }: LargeStatementProps) {
  return (
    <div className={dark ? "bg-dark text-ivory" : "bg-paper text-ink"}>
      <EditorialSection className="section-shell flex min-h-screen items-center py-24 md:py-40">
        <div className="max-w-6xl">
          <p className={`mb-10 text-sm uppercase tracking-[0.24em] ${dark ? "text-ivory/54" : "text-muted"}`}>
            {eyebrow}
          </p>
          <div className="space-y-4">
            {lines.map((line) => (
              <p
                key={line}
                className="text-balance text-[clamp(2.8rem,7.2vw,8.4rem)] font-light leading-[0.98]"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </EditorialSection>
    </div>
  );
}
