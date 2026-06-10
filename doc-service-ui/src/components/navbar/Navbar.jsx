import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service';


const navItems = [
    {
        label: 'Resume',
        children: [
            { label: 'Resume Templates', to: '/templates?type=CV_AND_RESUME' },
            { label: 'Browse All Templates', to: '/templates' },
            { label: 'My Documents', to: '/my-templates' },
        ],
    },
    {
        label: 'Cover Letter',
        children: [
            { label: 'Cover Letter Templates', to: '/templates?type=FORMAL_LETTERS' },
            { label: 'Browse All Templates', to: '/templates' },
        ],
    },
    { label: 'Blog', to: '/blog' },
    { label: 'For Organizations', to: '/contact-us' },
    { label: 'Pricing', to: '/pricing' },
];

const profileItems = [
    { label: 'My Profile', to: '/profile' },
    { label: 'My Templates', to: '/my-templates' },
    { label: 'Settings', to: '/settings' },
];

function ChevronDown({ open }) {
    return (
        <svg
            className={`ml-1 h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    );
}

function DropdownNavItem({ item, isOpen, onOpen, onClose }) {
    const ref = useRef(null);
    const btnRef = useRef(null);
    const closeTimer = useRef(null);
    const [pointerEnabled, setPointerEnabled] = useState(isOpen);
    const [dropPos, setDropPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                clearTimeout(closeTimer.current);
                onClose();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    // Keep the dropdown clickable during the closing animation.
    useEffect(() => {
        if (isOpen) {
            setPointerEnabled(true);
            // Recalculate position when opening
            if (btnRef.current) {
                const rect = btnRef.current.getBoundingClientRect();
                setDropPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
            }
            return;
        }

        const t = setTimeout(() => setPointerEnabled(false), 180);
        return () => clearTimeout(t);
    }, [isOpen]);

    const handleMouseEnter = () => {
        clearTimeout(closeTimer.current);
        onOpen();
    };

    const handleMouseLeave = () => {
        closeTimer.current = setTimeout(() => onClose(), 250);
    };

    const ROWS = 4;
    const numCols = Math.ceil(item.children.length / ROWS);
    const dropdownWidth = numCols * 160;

    return (
        <div
            ref={ref}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                ref={btnRef}
                className="flex items-center text-sm font-medium text-inherit transition-colors duration-200 hover:opacity-80"
            >
                {item.label}
                <ChevronDown open={isOpen} />
            </button>

            <div
                style={{
                    width: `${dropdownWidth}px`,
                    position: 'fixed',
                    top: dropPos.top,
                    left: dropPos.left,
                    transform: `translateX(-50%) translateY(${isOpen ? '0px' : '-4px'})`,
                    zIndex: 99999,
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`transition-all duration-200 ${isOpen
                    ? 'opacity-100'
                    : 'opacity-0'
                    } ${pointerEnabled ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
                <div className="mx-auto -mb-px flex h-2 w-4 justify-center overflow-hidden">
                    <div className="h-2 w-2 rotate-45 border-l border-t border-black/50 dark:border-white/50 bg-white/95 dark:bg-black/90" />
                </div>

                <div className="overflow-hidden rounded-lg border border-black/50 dark:border-white/50 bg-white/95 dark:bg-black/90 shadow-lg">
                    <div
                        className="p-2 grid grid-flow-col gap-0.5"
                        style={{ gridTemplateRows: `repeat(${Math.min(item.children.length, ROWS)}, auto)` }}
                    >
                        {item.children.map((child) => (
                            <NavLink
                                key={child.to}
                                to={child.to}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${isActive
                                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
                                        : 'text-inherit hover:bg-black/5 dark:hover:bg-white/10'
                                    }`
                                }
                            >
                                {child.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function NavCenter({ visibleNavItems }) {
    const [openItem, setOpenItem] = useState(null);

    const closeAll = useCallback(() => setOpenItem(null), []);

    return (
        <div className="hidden md:flex items-center gap-1">
            {visibleNavItems.map((item) =>
                item.children ? (
                    <DropdownNavItem
                        key={item.label}
                        item={item}
                        isOpen={openItem === item.label}
                        onOpen={() => setOpenItem(item.label)}
                        onClose={closeAll}
                    />
                ) : (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        onClick={closeAll}
                        className={({ isActive }) =>
                            `px-3 py-1.5 text-sm font-medium transition-colors duration-200 rounded-md ${isActive
                                ? 'text-teal-600'
                                : 'text-inherit hover:opacity-80'
                            }`
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
    const [dropPos, setDropPos] = useState({ top: 0, right: 0 });

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Lock scroll while profile menu is open.
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    const handleToggle = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setDropPos({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
        setOpen((v) => !v);
    };

    return (
        <div ref={ref} className="relative">
            <button
                ref={btnRef}
                onClick={handleToggle}
                className="cursor-pointer group relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-black/80 dark:border-black/80 bg-transparent transition-colors duration-200 hover:border-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
                aria-label="Profile menu"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-white/910 opacity-80 transition-opacity duration-200 group-hover:opacity-100"
                >
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
                <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-40" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-500" />
                </span>
            </button>

            <div
                style={{
                    position: 'fixed',
                    top: dropPos.top,
                    right: dropPos.right,
                    width: '12rem',
                    zIndex: 99999,
                    transform: `translateY(${open ? '0px' : '-4px'})`,
                }}
                className={`transition-all duration-200 ${open
                    ? 'pointer-events-auto opacity-100'
                    : 'pointer-events-none opacity-0'
                    }`}
            >
                <div className="flex justify-end pr-3 -mb-px">
                    <div className="h-2 w-2 rotate-45 border-l border-t border-black/50 dark:border-white/50 bg-white/95 dark:bg-black/90" />
                </div>

                <div className="overflow-hidden rounded-lg border border-black/50 dark:border-white/50 bg-white/95 dark:bg-black/90 shadow-lg">
                    <div className="border-b border-black/50 dark:border-white/50 px-4 py-2.5">
                        <p className="text-xs font-medium uppercase tracking-widest opacity-60">Account</p>
                    </div>
                    <div className="p-2 space-y-0.5">
                        {profileItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${isActive
                                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
                                        : 'text-inherit hover:bg-black/5 dark:hover:bg-white/10'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                    <div className="border-t border-black/50 dark:border-white/50 p-2">
                        <button
                            onClick={() => { setOpen(false); onLogout(); }}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-500 transition-colors duration-150 hover:bg-red-50"
                        >
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
            className="fixed left-0 right-0 z-9999 border-b border-black/50 dark:border-white/50 bg-white/95 dark:bg-black/90 shadow-lg md:hidden"
        >
            <div className="max-h-[70vh] overflow-y-auto px-3 py-3 space-y-0.5">
                {visibleNavItems.map((item) =>
                    item.children ? (
                        <div key={item.label}>
                            <button
                                onClick={() => toggle(item.label)}
                                className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-inherit hover:bg-black/5"
                            >
                                {item.label}
                                <svg
                                    className={`h-4 w-4 shrink-0 opacity-60 transition-transform duration-200 ${openSection === item.label ? 'rotate-180' : ''}`}
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {openSection === item.label && (
                                <div className="ml-3 mt-0.5 border-l-2 border-black/50 dark:border-white/50 pl-3 space-y-0.5 pb-1">
                                    {item.children.map((child) => (
                                        <NavLink
                                            key={child.to}
                                            to={child.to}
                                            className={({ isActive }) =>
                                                `block rounded-md px-3 py-2 text-sm font-medium ${isActive
                                                    ? 'bg-teal-50 text-teal-700'
                                                    : 'text-inherit hover:bg-black/5'
                                                }`
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
                                `block rounded-md px-3 py-2.5 text-sm font-medium ${isActive
                                    ? 'bg-teal-50 text-teal-700'
                                    : 'text-inherit hover:bg-black/5'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    )
                )}
            </div>

            <div className="border-t border-black/50 dark:border-white/50 px-3 py-3">
                {isAuthenticated ? (
                    <div className="space-y-0.5">
                        {profileItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className="block rounded-md px-3 py-2 text-sm font-medium text-inherit hover:bg-black/5"
                            >
                                {item.label}
                            </NavLink>
                        ))}
                        <button
                            onClick={onLogout}
                            className="mt-1 block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50"
                        >
                            Sign out
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <NavLink
                            to="/login"
                            className="block w-full rounded-md border border-slate-200 px-3 py-2.5 text-center text-sm font-medium text-inherit hover:bg-black/5"
                        >
                            Sign in
                        </NavLink>
                        <NavLink
                            to="/signup"
                            className="block w-full rounded-md bg-slate-900 px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-800"
                        >
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

    // Lock scroll + close on outside click for mobile menu.
    useEffect(() => {
        if (!isMobileMenuOpen) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handler = (e) => {
            const target = e.target;
            if (hamburgerRef.current?.contains(target)) return;
            if (mobileMenuRef.current?.contains(target)) return;
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
        <header ref={headerRef} className="relative z-9999 border-b border-black/50 dark:border-white/50 bg-inherit text-inherit">
            <nav className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <div className="flex flex-1 items-center">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-3 outline-none"
                    >
                        {/* Logo mark (V icon) */}
                        <svg
                            width="38"
                            height="38"
                            viewBox="0 0 600 600"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            className="shrink-0"
                        >
                            <g stroke="white" strokeWidth="22" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M150 150 L300 450 L450 150" />
                                <path d="M220 200 L300 380 L380 200" strokeWidth="10" />
                            </g>
                        </svg>

                        {/* Brand name */}
                        <span className="text-base text-white font-bold tracking-widest">
                            DOCSERVICE
                        </span>
                    </button>
                </div>

                {/* Desktop nav */}
                <NavCenter visibleNavItems={visibleNavItems} />

                {/* Right: Auth / Profile */}
                <div className="flex flex-1 items-center justify-end gap-3">
                    {isAuthenticated ? (
                        <div className="hidden md:block">
                            <ProfileMenu onLogout={handleLogout} />
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-3">
                            <NavLink
                                to="/login"
                                className="text-sm font-medium text-inherit transition hover:opacity-80"
                            >
                                Sign in
                            </NavLink>
                            <NavLink
                                to="/signup"
                                className="inline-flex items-center gap-1.5 rounded-full border border-black px-4 py-2 text-sm font-semibold text-black transition-all hover:border-teal-500"
                            >
                                Get Started
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M3 12h18" />
                                </svg>
                            </NavLink>
                        </div>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        ref={hamburgerRef}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="inline-flex items-center justify-center rounded-md p-2 text-inherit opacity-80 transition hover:bg-black/5 hover:opacity-100 focus:outline-none md:hidden"
                    >
                        <span className="sr-only">Open menu</span>
                        {isMobileMenuOpen ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
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
