import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service';
import BrandLogo from '../shared/BrandLogo';

const iconBase = 'h-5 w-5';
const DocIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconBase}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-6 4h4m3 4H8a2 2 0 01-2-2V5a2 2 0 012-2h6l4 4v12a2 2 0 01-2 2z" />
    </svg>
);
const GridIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconBase}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h6v6H4V5zm10 0h6v6h-6V5zM4 15h6v4H4v-4zm10 0h6v4h-6v-4z" />
    </svg>
);
const FolderIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconBase}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
);
const MailIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconBase}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4V6zm0 1l8 6 8-6" />
    </svg>
);

const ICONS = { builder: <DocIcon />, grid: <GridIcon />, folder: <FolderIcon />, mail: <MailIcon /> };

const navItems = [
    {
        label: 'Resume',
        mega: {
            columns: [
                {
                    kind: 'cards',
                    items: [
                        { icon: 'grid', title: 'Resume Templates', desc: 'Recruiter-approved designs', to: '/templates?type=CV_AND_RESUME&page=1&size=10' },
                        { icon: 'folder', title: 'Explore Doc Templates', desc: 'Browse every document design', to: '/templates?type=CV_AND_RESUME&page=1&size=10' },
                        { icon: 'mail', title: 'My Templates', desc: 'Resumes saved to your account', to: '/my-templates?type=CV_AND_RESUME&page=1&size=10' },
                        { icon: 'builder', title: 'Build your resume', desc: 'Create with live preview', to: '/templates?type=CV_AND_RESUME&page=1&size=20' },
                    ],
                },
                {
                    kind: 'list', heading: 'Popular examples',
                    items: [
                        { label: 'Software Engineer', to: '/templates?type=CV_AND_RESUME&keyword=Software' },
                        { label: 'Data Scientist', to: '/templates?type=CV_AND_RESUME&keyword=Data' },
                        { label: 'Marketing', to: '/templates?type=CV_AND_RESUME&keyword=Marketing' },
                        { label: 'Finance & Accounting', to: '/templates?type=CV_AND_RESUME&keyword=Finance' },
                        { label: 'Graduate / Entry level', to: '/templates?type=CV_AND_RESUME&keyword=Entry' },
                    ],
                },
            ],
            promo: { title: 'Free, ATS-friendly resume builder', desc: 'Build and download in minutes — no account needed.', cta: 'Build your resume', to: '/templates?type=CV_AND_RESUME&page=1&size=20' },
        },
    },
    {
        label: 'Cover Letter',
        mega: {
            columns: [
                {
                    kind: 'cards',
                    items: [
                        { icon: 'mail', title: 'Cover Letter Templates', desc: 'Match your resume design', to: '/templates?type=COVER_LETTER&page=1&size=10' },
                        { icon: 'grid', title: 'Keyword based', desc: 'Find by style, e.g. modern', to: '/templates?type=COVER_LETTER&page=1&size=10&keyword=modern' },
                        { icon: 'folder', title: 'For all', desc: 'See every cover letter', to: '/templates?type=COVER_LETTER&page=1&size=20' },
                    ],
                },
            ],
            promo: { title: 'ATS-friendly cover letters', desc: 'Create a matching cover letter fast.', cta: 'Browse templates', to: '/templates?type=COVER_LETTER&page=1&size=20' },
        },
    },
    { label: 'For Organizations', to: '/contact-us' },
    { label: 'Pricing', to: '/pricing' },
];

const profileItems = [
    { label: 'My Profile', to: '/profile' },
    { label: 'My Documents', to: '/my-templates' },
    { label: 'Settings', to: '/settings' },
];

function megaLinks(item) {
    const out = [];
    (item.mega?.columns || []).forEach((col) => (col.items || []).forEach((it) => out.push({ label: it.title || it.label, to: it.to })));
    if (item.mega?.promo) out.push({ label: item.mega.promo.cta, to: item.mega.promo.to });
    return out;
}

function ChevronDown({ open }) {
    return (
        <svg
            className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    );
}

function DropdownNavItem({ item, isOpen, onOpen, onCloseSelf, onClose }) {
    const ref = useRef(null);
    const btnRef = useRef(null);
    const closeTimer = useRef(null);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    const reposition = useCallback(() => {
        if (!btnRef.current) return;
        const r = btnRef.current.getBoundingClientRect();
        setPos({ top: r.bottom });
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [isOpen, reposition]);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    useEffect(() => () => clearTimeout(closeTimer.current), []);

    const enter = () => {
        clearTimeout(closeTimer.current);
        reposition();
        onOpen();
    };

    const leave = () => {
        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(onCloseSelf, 220);
    };

    return (
        <div ref={ref} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
            <button
                ref={btnRef}
                type="button"
                onClick={() => (isOpen ? onCloseSelf() : enter())}
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${isOpen ? 'bg-white/10 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'}`}
            >
                {item.label}
                <ChevronDown open={isOpen} />
            </button>

            <div
                style={{ position: 'fixed', top: pos.top, left: 0, right: 0, zIndex: 99999, transform: `translateY(${isOpen ? '0px' : '-6px'})` }}
                onMouseEnter={enter}
                onMouseLeave={leave}
                className={`px-4 pt-3 transition-[opacity,transform] duration-200 sm:px-6 lg:px-8 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
                <div className="mx-auto max-w-7xl">
                    <MegaPanel mega={item.mega} onClose={onClose} />
                </div>
            </div>
        </div>
    );
}

function MegaColumn({ col, onClose }) {
    if (col.kind === 'cards') {
        return (
            <div className="space-y-1">
                {col.items.map((it) => (
                    <NavLink key={it.to + it.title} to={it.to} onClick={onClose} className="group/item flex items-start gap-3 rounded-xl p-3 transition hover:bg-slate-50">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 transition-colors group-hover/item:bg-teal-100">{ICONS[it.icon]}</span>
                        <span className="min-w-0">
                            <span className="block text-sm font-semibold text-slate-800">{it.title}</span>
                            <span className="block text-xs leading-snug text-slate-500">{it.desc}</span>
                        </span>
                    </NavLink>
                ))}
            </div>
        );
    }
    if (col.kind === 'links') {
        return (
            <div>
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{col.heading}</p>
                <div className="space-y-0.5">
                    {col.items.map((it) => (
                        <NavLink key={it.to + it.title} to={it.to} onClick={onClose} className="block rounded-xl px-3 py-2 transition hover:bg-slate-50">
                            <span className="block text-sm font-semibold text-slate-800">{it.title}</span>
                            {it.desc && <span className="block text-xs leading-snug text-slate-500">{it.desc}</span>}
                        </NavLink>
                    ))}
                </div>
            </div>
        );
    }
    return (
        <div>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{col.heading}</p>
            <ul className="space-y-0.5">
                {col.items.map((it) => (
                    <li key={it.to + it.label}>
                        <NavLink to={it.to} onClick={onClose} className="block rounded-lg px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-teal-700">{it.label}</NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function MegaPromo({ promo, onClose }) {
    return (
        <div className="relative flex w-full shrink-0 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 p-5 lg:w-72">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-teal-200/50 blur-2xl" />
            <div className="relative">
                <h4 className="text-base font-bold text-slate-900">{promo.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{promo.desc}</p>
            </div>
            <NavLink to={promo.to} onClick={onClose} className="relative mt-5 inline-flex items-center justify-center gap-1.5 rounded-full bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500">
                {promo.cta}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M3 12h18" /></svg>
            </NavLink>
        </div>
    );
}

function MegaPanel({ mega, onClose }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-black/5">
            <div className="flex flex-col gap-6 p-6 lg:flex-row">
                <div className="grid flex-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mega.columns.map((col, i) => <MegaColumn key={i} col={col} onClose={onClose} />)}
                </div>
                {mega.promo && <MegaPromo promo={mega.promo} onClose={onClose} />}
            </div>
        </div>
    );
}

function NavCenter({ visibleNavItems }) {
    const [openItem, setOpenItem] = useState(null);
    const closeAll = useCallback(() => setOpenItem(null), []);
    const closeIf = useCallback((label) => setOpenItem((cur) => (cur === label ? null : cur)), []);

    return (
        <div className="hidden items-center gap-1 md:flex">
            {visibleNavItems.map((item) =>
                item.mega ? (
                    <DropdownNavItem
                        key={item.label}
                        item={item}
                        isOpen={openItem === item.label}
                        onOpen={() => setOpenItem(item.label)}
                        onCloseSelf={() => closeIf(item.label)}
                        onClose={closeAll}
                    />
                ) : (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        onClick={closeAll}
                        className={({ isActive }) =>
                            `rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-white/10 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'}`
                        }
                    >
                        {item.label}
                    </NavLink>
                )
            )}
        </div>
    );
}

function ProfileMenu({ onLogout }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const btnRef = useRef(null);
    const [pos, setPos] = useState({ top: 0, right: 0 });

    const reposition = useCallback(() => {
        if (!btnRef.current) return;
        const r = btnRef.current.getBoundingClientRect();
        setPos({ top: r.bottom + 10, right: window.innerWidth - r.right });
    }, []);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (!open) return;
        reposition();
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [open, reposition]);

    return (
        <div ref={ref} className="relative">
            <button
                ref={btnRef}
                onClick={() => setOpen((v) => !v)}
                className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label="Profile menu"
            >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 opacity-90 transition-opacity group-hover:opacity-100">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-50" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-white bg-teal-500" />
                </span>
            </button>

            <div
                style={{ position: 'fixed', top: pos.top, right: pos.right, width: '13rem', zIndex: 99999, transform: `translateY(${open ? '0px' : '-6px'})` }}
                className={`transition-[opacity,transform] duration-200 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-black/5">
                    <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Account</p>
                    </div>
                    <div className="space-y-0.5 p-2">
                        {profileItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                    <div className="border-t border-slate-100 p-2">
                        <button
                            onClick={() => { setOpen(false); onLogout(); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                            </svg>
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MobileMenu({ visibleNavItems, isAuthenticated, profileItems, onLogout, menuRef, menuTop }) {
    const [openSection, setOpenSection] = useState(null);
    const toggle = (label) => setOpenSection((prev) => (prev === label ? null : label));

    return (
        <div
            ref={menuRef}
            style={{ top: menuTop }}
            className="fixed left-0 right-0 z-[9999] border-b border-slate-200 bg-white shadow-xl md:hidden"
        >
            <div className="max-h-[72vh] space-y-0.5 overflow-y-auto px-3 py-3">
                {visibleNavItems.map((item) =>
                    item.mega ? (
                        <div key={item.label}>
                            <button
                                onClick={() => toggle(item.label)}
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                            >
                                {item.label}
                                <ChevronDown open={openSection === item.label} />
                            </button>
                            {openSection === item.label && (
                                <div className="mb-1 ml-2 space-y-0.5 border-l-2 border-slate-100 pl-3">
                                    {megaLinks(item).map((child) => (
                                        <NavLink
                                            key={child.to + child.label}
                                            to={child.to}
                                            className={({ isActive }) =>
                                                `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`
                                            }
                                        >
                                            {child.label}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <NavLink
                            key={item.label}
                            to={item.to}
                            className={({ isActive }) =>
                                `block rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-800 hover:bg-slate-50'}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    )
                )}
            </div>

            <div className="border-t border-slate-200 px-3 py-3">
                {isAuthenticated ? (
                    <div className="space-y-0.5">
                        {profileItems.map((item) => (
                            <NavLink key={item.to} to={item.to} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                {item.label}
                            </NavLink>
                        ))}
                        <button onClick={onLogout} className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50">
                            Sign out
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <NavLink to="/login" className="block w-full rounded-full border border-slate-300 px-3 py-2.5 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50">
                            Sign in
                        </NavLink>
                        <NavLink to="/signup" className="block w-full rounded-full border-2 border-teal-500 px-3 py-2.5 text-center text-sm font-semibold text-teal-600 hover:bg-teal-50">
                            Get Started
                        </NavLink>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const navigate = useNavigate();
    const location = useLocation();
    const hamburgerRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const headerRef = useRef(null);
    const [mobileMenuTop, setMobileMenuTop] = useState(56);

    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated());
        setIsMobileMenuOpen(false);
    }, [location]);

    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const measure = () => {
            const bottom = headerRef.current?.getBoundingClientRect().bottom;
            if (bottom != null) setMobileMenuTop(bottom);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [isMobileMenuOpen]);

    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handler = (e) => {
            if (hamburgerRef.current?.contains(e.target)) return;
            if (mobileMenuRef.current?.contains(e.target)) return;
            setIsMobileMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('mousedown', handler);
        };
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        try {
            await authService.logout();
            setIsAuthenticated(false);
            navigate('/');
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Logout failed');
            console.error('Logout failed', error);
        }
    };

    const visibleNavItems = navItems.filter((item) => !item.authRequired || isAuthenticated);

    return (
        <header
            ref={headerRef}
            className="relative z-50 border-b border-white bg-gradient-to-b from-slate-950/45 via-slate-950/15 to-transparent text-white"
        >
            <nav className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">

                <div className="flex flex-1 items-center">
                    <button onClick={() => navigate('/')} className="group flex items-center gap-2.5 outline-none">
                        <BrandLogo height={38} />
                        <span className="text-lg font-medium tracking-[0.14em] text-white transition-opacity group-hover:opacity-90">
                            NextCV
                        </span>
                    </button>
                </div>

                <NavCenter visibleNavItems={visibleNavItems} />

                <div className="flex flex-1 items-center justify-end gap-2">
                    {isAuthenticated ? (
                        <div className="hidden md:block">
                            <ProfileMenu onLogout={handleLogout} />
                        </div>
                    ) : (
                        <div className="hidden items-center gap-1.5 md:flex">
                            <NavLink
                                to="/login"
                                className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                            >
                                Sign in
                            </NavLink>
                            <NavLink
                                to="/signup"
                                className="inline-flex items-center gap-1.5 rounded-full border-2 border-teal-400 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-400/10"
                            >
                                Get Started
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M3 12h18" />
                                </svg>
                            </NavLink>
                        </div>
                    )}

                    <button
                        ref={hamburgerRef}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-white/90 transition hover:bg-white/10 hover:text-white focus:outline-none md:hidden"
                    >
                        <span className="sr-only">Open menu</span>
                        {isMobileMenuOpen ? (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        )}
                    </button>
                </div>
            </nav>

            {isMobileMenuOpen && (
                <MobileMenu
                    visibleNavItems={visibleNavItems}
                    isAuthenticated={isAuthenticated}
                    profileItems={profileItems}
                    onLogout={handleLogout}
                    menuRef={mobileMenuRef}
                    menuTop={mobileMenuTop}
                />
            )}
        </header>
    );
}
