type DevdarianiWordmarkProps = {
  className?: string;
  compact?: boolean;
};

function AngledGlyph({ type }: { type: "a" | "v" }) {
  const isA = type === "a";

  return (
    <svg
      aria-hidden="true"
      className={`devdariani-angle ${isA ? "devdariani-angle--a" : "devdariani-angle--v"}`}
      fill="none"
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
      className={`devdariani-wordmark ${compact ? "devdariani-wordmark--compact" : ""} ${className}`}
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
          <span className="devdariani-letter" key={`${letter}-${index}`}>
            {letter}
          </span>
        );
      })}
    </span>
  );
}

