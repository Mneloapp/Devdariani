type DevdarianiWordmarkProps = {
  className?: string;
  compact?: boolean;
};

function AngledGlyph({ type }: { type: "a" | "v" }) {
  const isA = type === "a";

  return (
    <svg
      aria-hidden="true"
      className={`inline-block ${isA ? "w-[0.74em]" : "w-[0.76em]"}`}
      fill="none"
      style={{ height: "0.9em", transform: "translateY(0.06em)" }}
      viewBox="0 0 100 100"
    >
      <path
        d={isA ? "M 6 94 L 45 10 M 55 10 L 94 94" : "M 6 8 L 45 92 M 55 92 L 94 8"}
        stroke="currentColor"
        strokeLinecap="butt"
        strokeWidth="8"
      />
    </svg>
  );
}

export function DevdarianiWordmark({
  className = "",
  compact = false,
}: DevdarianiWordmarkProps) {
  const letters = ["D", "E", "V", "D", "A", "R", "I", "A", "N", "I"];

  return (
    <span
      aria-label="DEVDARIANI"
      className={`inline-flex items-baseline font-light leading-none tracking-[0.08em] text-current ${className}`}
      role="img"
    >
      {letters.map((letter, index) => {
        if (letter === "A") {
          return <AngledGlyph key={`${letter}-${index}`} type="a" />;
        }
        if (letter === "V") {
          return <AngledGlyph key={`${letter}-${index}`} type="v" />;
        }

        return (
          <span key={`${letter}-${index}`} className={compact ? "mx-[0.015em]" : "mx-[0.01em]"}>
            {letter}
          </span>
        );
      })}
    </span>
  );
}
