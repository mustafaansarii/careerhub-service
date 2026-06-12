import { useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export default function MinimalNavbar() {
    const navigate = useNavigate();

    return (
        <header className="relative z-50 border-b border-black/50 dark:border-white/50 bg-inherit text-inherit">
            <nav className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-3 outline-none"
                >

                    <BrandLogo height={40} />

                    <span className="text-base text-white font-medium tracking-widest">
                        NextCV
                    </span>
                </button>
            </nav>
        </header>
    );
}
