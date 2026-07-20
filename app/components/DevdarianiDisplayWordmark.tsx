type DevdarianiDisplayWordmarkProps = {
  className?: string;
};

export function DevdarianiDisplayWordmark({
  className = "",
}: DevdarianiDisplayWordmarkProps) {
  return (
    <svg
      aria-label="DEVDARIANI"
      className={className}
      fill="none"
      preserveAspectRatio="xMinYMid meet"
      role="img"
      shapeRendering="geometricPrecision"
      viewBox="0 0 480 43"
    >
      <g
        stroke="currentColor"
        strokeLinecap="butt"
        strokeLinejoin="bevel"
        strokeWidth="3.25"
      >
        <path d="M1.7 1.7H16.8C27.2 1.7 33.6 9.3 33.6 21.5S27.2 41.3 16.8 41.3H1.7M1.7 1.7V30.5" />
        <path d="M85 1.7H58.7V41.3H85M58.7 21.3H80" />
        <path d="M103.6 1.7L122.2 40.8L139.6 1.7" />
        <path d="M164.7 1.7H180.5C190.8 1.7 195.6 9.3 195.6 21.5S190.8 41.3 180.5 41.3H164.7M164.7 1.7V30.5" />
        <path d="M216.6 41.3L234.5 1.7L252.9 41.3" />
        <path d="M275 41.3V1.7H289.7C297.8 1.7 302.6 5.7 302.6 12.8S297.8 24.2 289.8 24.2M289.8 24.2L303.8 41.3" />
        <path d="M331.6 1.7V41.3" />
        <path d="M356.7 41.3L374.7 1.7L393.8 41.3" />
        <path d="M415.7 41.3V1.7L447.4 41.3V1.7" />
        <path d="M477.2 1.7V41.3" />
      </g>
    </svg>
  );
}
