import { Link } from 'react-router-dom';
import BrandLogo from '../shared/BrandLogo';

export default function Footer() {
    const links = {
        product: [
            { name: 'Resume Templates', url: '/templates' },
            { name: 'My Templates', url: '/my-templates' },
            { name: 'Pricing', url: '/pricing' },
        ],
        account: [
            { name: 'My Profile', url: '/profile' },
            { name: 'Settings', url: '/settings' },
        ],
        company: [
            { name: 'Contact Us', url: '/contact-us' },
            { name: 'Terms & Conditions', url: '/terms' },
            { name: 'Cancellation & Refund', url: '/refund-policy' },
        ],
    };

    return (
        <footer className="border-t border-white/50">
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-white/50"
                style={{
                    backgroundImage: "url('/assest/home_page.png')",
                }}
            >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="space-y-3 col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center">
                            <BrandLogo height={34} />
                        </Link>
                    <p className="text-sm sm:text-slate-300 text-slate-900 max-w-xs">
                            Build ATS-friendly resumes and documents in minutes.
                        </p>
                        <p className="hidden text-sm text-slate-400 md:block">
                            © {new Date().getFullYear()} MyCV. All rights reserved.
                        </p>
                    </div>

                    {[
                        { heading: 'Product', items: links.product },
                        { heading: 'Account', items: links.account },
                        { heading: 'Company', items: links.company },
                    ].map(({ heading, items }) => (
                        <div key={heading} className="space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-widest sm:text-slate-900 text-white">{heading}</h4>
                            <ul className="space-y-2">
                                {items.map(link => (
                                    <li key={link.url}>
                                        <Link
                                            to={link.url}
                                            className="text-sm text-black dark:text-black sm:text-white sm:dark:text-slate-100 transition hover:text-teal-600"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <p className="mt-4 -mb-8 text-center text-sm text-slate-400 md:hidden">
                    © {new Date().getFullYear()} MyCV. All rights reserved.
                </p>
            </div>
            </div>
        </footer>
    );
}
