type AnimatedDisplayTextProps = {
  className?: string;
  mode?: "characters" | "words";
  motionGroup?: "title" | "statement";
  staggerMs?: number;
  text: string;
};

export function AnimatedDisplayText({
  className = "",
  mode = "characters",
  motionGroup,
  staggerMs = 0,
  text,
}: AnimatedDisplayTextProps) {
  const tokens = mode === "words" ? text.split(/(\s+)/) : Array.from(text);

  return (
    <span className={`weave-motion-text ${className}`.trim()} data-motion-group={motionGroup}>
      <span className="sr-only">{text}</span>
      {tokens.map((token, tokenIndex) => {
        if (/^\s+$/.test(token)) {
          return (
            <span aria-hidden="true" className="weave-motion-space" key={`space-${tokenIndex}`}>
              {token}
            </span>
          );
        }

        const index = tokens
          .slice(0, tokenIndex)
          .filter((previousToken) => !/^\s+$/.test(previousToken)).length;

        return (
          <span
            aria-hidden="true"
            className="weave-motion-unit"
            data-motion-index={index}
            key={`${token}-${tokenIndex}`}
            style={
              staggerMs > 0
                ? {
                    animationDelay: `${index * staggerMs}ms`,
                    transitionDelay: `${index * staggerMs}ms`,
                  }
                : undefined
            }
          >
            {token}
          </span>
        );
      })}
    </span>
  );
}
