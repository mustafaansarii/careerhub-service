import { useNavigate } from 'react-router-dom';

export default function MinimalNavbar() {
    const navigate = useNavigate();

    return (
        <header className="relative z-50 border-b border-black/50 dark:border-white/50 bg-inherit text-inherit">
            <nav className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-3 outline-none"
                >
                    {/* Logo mark */}
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
                        CAREERHUB
                    </span>
                </button>
            </nav>
        </header>
    );
}
