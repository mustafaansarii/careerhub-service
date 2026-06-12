
export default function BrandLogo({ height = 40, className = '' }) {
    return (
        <svg height={height} viewBox="0 0 900 760" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={`shrink-0 ${className}`}>
            <g stroke="white" strokeLinecap="round" strokeLinejoin="round" fill="none">

                <path d="M372 232 A206 206 0 1 0 372 568" strokeWidth="28" />

                <path d="M488 212 L650 576 L812 212" strokeWidth="28" />

                <path d="M572 252 L650 452 L728 252" strokeWidth="12" />
            </g>
        </svg>
    );
}
