import { Link } from 'react-router-dom';

function PageHero({ title, description, breadcrumb }) {
    return (
        <div className="mx-auto max-w-7xl px-4 pt-2 pb-12 sm:px-6 lg:px-8 sm:pb-16">

            <div className="text-left pl-3">
                <Link to="/" className="text-xs font-medium hover:text-teal-600 text-slate-400">
                    Home
                </Link>
                <span className="mx-1 text-xs text-slate-100">/</span>
                <span className="text-xs font-medium text-slate-100">{breadcrumb}</span>
            </div>

            <div className="mx-auto mt-6 max-w-2xl text-center">

                <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-teal-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
                    {breadcrumb}
                </span>
                <h2 className="mt-2 text-4xl font-bold sm:text-5xl">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-slate-100">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default PageHero;
