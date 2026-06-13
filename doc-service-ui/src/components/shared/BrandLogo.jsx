export default function BrandLogo({ height = 60, className = "" }) {
  return (
    <svg
      width={height * 5}
      height={height}
      viewBox="0 0 1000 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
    >
      {/* Document Icon */}
      <g transform="translate(10,25)">
        <path
          d="M20 0 H90 L120 30 V150 H20 Z"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinejoin="round"
        />

        <path
          d="M90 0 V30 H120"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinejoin="round"
        />

        <line
          x1="40"
          y1="55"
          x2="100"
          y2="55"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <line
          x1="40"
          y1="85"
          x2="100"
          y2="85"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <line
          x1="40"
          y1="115"
          x2="80"
          y2="115"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      {/* MyCV Text */}
      <text
        x="170"
        y="145"
        fontSize="140"
        fontWeight="100"
        fontFamily="Inter, Poppins, Arial, sans-serif"
        letterSpacing="-2"
        fill="currentColor"
      >
        MyCV
      </text>
    </svg>
  );
}