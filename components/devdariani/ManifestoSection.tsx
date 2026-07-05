import { SectionMotion } from "./SectionMotion";

type ManifestoSectionProps = {
  id?: string;
  eyebrow?: string;
  lines: string[];
  align?: "left" | "center";
};

export function ManifestoSection({
  id,
  eyebrow,
  lines,
  align = "left",
}: ManifestoSectionProps) {
  return (
    <SectionMotion
      id={id}
      className="section-shell flex min-h-[86vh] items-center py-32 md:py-44"
    >
      <div
        className={
          align === "center"
            ? "mx-auto max-w-5xl text-center"
            : "max-w-5xl text-left"
        }
      >
        {eyebrow ? <p className="eyebrow mb-8">{eyebrow}</p> : null}
        <div className="space-y-7">
          {lines.map((line) => (
            <p
              key={line}
              className="text-balance text-[clamp(2.15rem,5.35vw,5.4rem)] font-light leading-[1.02] text-text"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </SectionMotion>
  );
}
