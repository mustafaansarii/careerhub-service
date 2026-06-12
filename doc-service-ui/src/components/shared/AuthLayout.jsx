import { useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';

/**
 * Generic full-page auth layout.
 * Left 50% — background image + logo + badge/title/description/features
 * Right 50% — solid bg (light/dark), full height top-to-bottom edge-to-edge
 */
export default function AuthLayout({ badge, title, description, features = [], breadcrumb, children }) {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen w-full">

            {/* ── LEFT — bg image + branding ───────────────────────────── */}
            <div
                className="hidden lg:flex flex-col w-1/2 bg-cover bg-center text-white relative overflow-hidden"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}
            >
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-black/30 pointer-events-none hidden dark:block" />

                {/* Decorative oversized background word */}
                <span className="absolute -bottom-4 -left-2 text-[10rem] font-black tracking-tighter text-white/[0.04] select-none leading-none pointer-events-none">
                    AUTH
                </span>

                {/* Subtle teal glow blob */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

                {/* Logo bar */}
                <header className="relative z-10 border-b border-white/10 shrink-0">
                    <div className="flex h-14 items-center px-10">
                        <button
                            onClick={() => navigate('/')}
                            className="group flex items-center gap-3 outline-none"
                        >
                            <BrandLogo height={38} className="drop-shadow-[0_0_10px_rgba(45,212,191,0.45)]" />
                            <span className="text-sm font-medium tracking-[0.25em] text-white">NextCV</span>
                        </button>
                    </div>
                </header>

                {/* Copy — shifted toward top with justify-start + padding */}
                <div className="relative z-10 flex flex-col gap-6 px-10 pt-8 pb-12">

                    {/* Breadcrumb */}
                    {breadcrumb && (
                        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase pl-2">
                            <button
                                onClick={() => navigate('/')}
                                className="text-white/30 hover:text-white/60 transition-colors"
                            >
                                Home
                            </button>
                            <span className="text-white/20">/</span>
                            <span className="text-teal-400/80">{breadcrumb}</span>
                        </div>
                    )}

                    {/* Badge with pulsing dot */}
                    {badge && (
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-400/25 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300 backdrop-blur-sm">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-50" />
                                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-teal-400" />
                            </span>
                            {badge}
                        </div>
                    )}

                    {/* Title */}
                    {title && (
                        <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-white drop-shadow-sm xl:text-5xl">
                            {title}
                        </h1>
                    )}

                    {/* Teal accent line */}
                    <div className="w-10 h-0.5 rounded-full bg-teal-400/60" />

                    {/* Description */}
                    {description && (
                        <p className="max-w-sm text-[0.84rem] leading-relaxed text-white/50">
                            {description}
                        </p>
                    )}

                    {/* Feature list */}
                    {features.length > 0 && (
                        <ul className="space-y-3 pt-1">
                            {features.map((feat, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15 ring-1 ring-teal-400/20">
                                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-teal-400">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    {feat}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Vertical divider */}
            <div className="hidden lg:block w-px bg-black/50 dark:bg-white shrink-0" />

            {/* ── RIGHT — full-height solid panel, touches top + right edge */}
            <div className="flex flex-1 flex-col">
                {/* Mobile-only logo bar */}
                <header
                    className="lg:hidden border-b border-white/20 shrink-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/assest/home_page.png')" }}
                >
                    <div className="flex h-14 items-center justify-between px-4">
                        <button onClick={() => navigate('/')} className="group flex items-center gap-3 outline-none">
                            <BrandLogo height={36} />
                            <span className="text-base font-medium tracking-widest text-white">NextCV</span>
                        </button>
                        {/* Breadcrumb on mobile */}
                        {breadcrumb && (
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase">
                                <button
                                    onClick={() => navigate('/')}
                                    className="text-black/60 hover:text-black transition-colors"
                                >
                                    Home
                                </button>
                                <span className="text-black/30">/</span>
                                <span className="text-teal-600">{breadcrumb}</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Form — sits directly on the flowing aurora background (no panel) */}
                <div className="flex flex-1 items-center justify-center px-6 py-12">
                    {children}
                </div>
            </div>
        </div>
    );
}
