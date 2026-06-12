import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import docService from '../../services/doc.service';
import authService from '../../services/auth.service';
import { DEFAULT_CODE } from '../../resume-template/registry';

const designCodeFor = (doc) => doc?.templateCode || DEFAULT_CODE;

const CATEGORIES = [
    { key: 'CV_AND_RESUME', label: 'CV & Resume' },
    { key: 'COVER_LETTER', label: 'Cover Letter' },
    { key: 'JOURNAL_ARTICLES', label: 'Journal Articles' },
    { key: 'BIBLIOGRAPHIES', label: 'Bibliographies' },
    { key: 'BOOKS', label: 'Books' },
    { key: 'CALENDARS', label: 'Calendars' },
    { key: 'FORMAL_LETTERS', label: 'Formal Letters' },
    { key: 'ASSIGNMENTS', label: 'Assignments' },
    { key: 'NEWSLETTERS', label: 'Newsletters' },
    { key: 'POSTERS', label: 'Posters' },
    { key: 'PRESENTATIONS', label: 'Presentations' },
    { key: 'REPORTS', label: 'Reports' },
    { key: 'THESIS', label: 'Thesis' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;

const STATUS_BADGE = {
    READY: 'bg-emerald-50 text-emerald-600',
    PENDING: 'bg-amber-50 text-amber-600',
    COMPILING: 'bg-amber-50 text-amber-600',
    FAILED: 'bg-red-50 text-red-600',
};

function TemplateCard({ doc, actionLabel, onAction, isBusy }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const choose = (m) => { setMenuOpen(false); onAction(doc, m); };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100" style={{ aspectRatio: '3/4' }}>
                {doc.imageUrl ? (
                    <img
                        src={doc.imageUrl}
                        alt={doc.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : doc.pdfUrl ? (
                    <iframe src={`${doc.pdfUrl}#toolbar=0&navpanes=0`} title={doc.name} className="pointer-events-none h-full w-full" />
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-12 w-12 text-slate-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                )}
                {doc.status && doc.status !== 'READY' && (
                    <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[doc.status] || 'bg-slate-100 text-slate-500'}`}>
                        {doc.status}
                    </span>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                        onClick={() => choose('form')}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 rounded-full bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isBusy ? 'Opening…' : actionLabel}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <p className="truncate text-sm font-medium text-slate-800" title={doc.name}>{doc.name}</p>

                <div ref={menuRef} className="relative shrink-0">
                    <button
                        onClick={() => setMenuOpen((v) => !v)}
                        title="More options"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-teal-400 hover:text-teal-600"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>
                    </button>
                    {menuOpen && (
                        <div className="absolute bottom-9 right-0 z-20 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                            <button onClick={() => choose('form')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">✏️ Edit with form</button>
                            <button onClick={() => choose('latex')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">{'</>'} Edit with LaTeX editor</button>
                            {doc.pdfUrl && (
                                <a href={doc.pdfUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">⬇️ Download PDF</a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white animate-pulse">
            <div className="bg-slate-100" style={{ aspectRatio: '3/4' }} />
            <div className="flex items-center justify-between px-3 py-2.5">
                <div className="h-3 w-28 rounded bg-slate-200" />
                <div className="h-7 w-7 rounded-full bg-slate-200" />
            </div>
        </div>
    );
}

function Pagination({ page, totalPages, pageSize, onPageChange, onPageSizeChange }) {
    const safeTotal = Math.max(totalPages, 1);
    const buildPages = () => {
        const pages = [];
        const range = [];
        for (let i = Math.max(2, page - 1); i <= Math.min(safeTotal - 1, page + 1); i++) range.push(i);
        if (page - 1 > 2) range.unshift('...');
        if (page + 1 < safeTotal - 1) range.push('...');
        if (safeTotal > 1) {
            pages.push(1);
            range.forEach((r) => pages.push(r));
            pages.push(safeTotal);
        } else {
            pages.push(1);
        }
        return pages;
    };

    return (
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Rows per page:</span>
                <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 focus:border-teal-400 focus:outline-none">
                    {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="flex items-center gap-1.5">
                <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-400 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                {buildPages().map((p, idx) =>
                    p === '...' ? (
                        <span key={`e-${idx}`} className="flex h-8 w-8 items-center justify-center text-sm text-slate-400">…</span>
                    ) : (
                        <button key={p} onClick={() => onPageChange(p)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition ${p === page ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600'}`}>
                            {p}
                        </button>
                    )
                )}
                <button onClick={() => onPageChange(page + 1)} disabled={page >= safeTotal}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-400 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            <p className="text-sm text-slate-500">
                Page <span className="font-medium text-slate-700">{page}</span> of <span className="font-medium text-slate-700">{safeTotal}</span>
            </p>
        </div>
    );
}

export default function Templates({ mode = 'templates' }) {
    const isUserDocs = mode === 'user-docs';
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const activeCategory = searchParams.get('type') || CATEGORIES[0].key;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE;
    const keyword = searchParams.get('keyword') || '';

    const [inputValue, setInputValue] = useState(keyword);
    const debounceRef = useRef(null);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const handleAction = async (doc, action = 'form') => {

        if (action === 'form') {
            navigate(`/resume-builder/${designCodeFor(doc)}`);
            return;
        }

        if (busyId) return;
        setBusyId(doc.id);
        try {
            if (isUserDocs) {
                const full = await docService.getUserDoc(doc.id);
                navigate(`/doc-editor/${doc.id}`, { state: { doc: full } });
            } else {
                if (!authService.isAuthenticated()) {
                    toast('Sign in to edit LaTeX');
                    navigate('/login');
                    return;
                }
                const saved = await docService.saveTemplateToAccount(doc.id);
                navigate(`/doc-editor/${saved.id}`, { state: { doc: saved } });
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to open the editor');
            setBusyId(null);
        }
    };

    useEffect(() => {
        if (!searchParams.has('type')) {
            setSearchParams({ type: CATEGORIES[0].key, page: 1, size: DEFAULT_PAGE_SIZE }, { replace: true });
        }

    }, []);

    useEffect(() => { setInputValue(keyword); }, [keyword]);

    useEffect(() => {
        setLoading(true);
        setError(null);
        setData(null);
        const fetcher = isUserDocs ? docService.listUserDocs : docService.listTemplates;
        fetcher.call(docService, { type: activeCategory, keyword, page: page - 1, size: pageSize })
            .then(setData)
            .catch((err) => setError(err?.response?.data?.message || 'Failed to load templates'))
            .finally(() => setLoading(false));
    }, [isUserDocs, activeCategory, page, pageSize, keyword]);

    const buildParams = (overrides) => {
        const base = { type: activeCategory, page, size: pageSize };
        if (keyword) base.keyword = keyword;
        return { ...base, ...overrides };
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const next = { type: activeCategory, page: 1, size: pageSize };
            if (val.trim()) next.keyword = val.trim();
            setSearchParams(next);
        }, 400);
    };

    const handleCategoryChange = (key) => {
        setInputValue('');
        setSearchParams({ type: key, page: 1, size: pageSize });
    };

    const templates = data?.content ?? [];
    const totalPages = data?.totalPages ?? 1;
    const totalElements = data?.totalElements ?? 0;

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-l border-r border-black/50 dark:border-white/50">
                <div className="mb-8 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-2 pb-1 sm:flex-wrap">
                        {CATEGORIES.map((cat) => (
                            <button key={cat.key} onClick={() => handleCategoryChange(cat.key)}
                                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${activeCategory === cat.key ? 'bg-teal-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-700'}`}>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <div className="mx-auto w-full max-w-md">
                        <div className="relative">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
                                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                            </svg>
                            <input type="text" value={inputValue} onChange={handleSearchChange}
                                placeholder={isUserDocs ? 'Search my documents…' : 'Search templates…'}
                                className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20" />
                        </div>
                    </div>
                </div>

                {data && !loading && (
                    <p className="mb-5 text-sm text-slate-500">
                        {totalElements} {isUserDocs ? 'document' : 'template'}{totalElements !== 1 ? 's' : ''} in{' '}
                        <span className="font-medium text-slate-700">{CATEGORIES.find((c) => c.key === activeCategory)?.label}</span>
                    </p>
                )}

                {error && (
                    <div className="flex flex-col items-center gap-3 py-24 text-center">
                        <p className="text-sm text-slate-500">{error}</p>
                        <button onClick={() => setSearchParams(buildParams({ page: 1 }))}
                            className="mt-1 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Retry</button>
                    </div>
                )}

                {!loading && !error && templates.length === 0 && (
                    <div className="py-24 text-center text-slate-400">
                        {isUserDocs ? 'You have not saved any documents yet.' : 'No templates available in this category yet.'}
                    </div>
                )}

                {!error && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {loading
                            ? Array.from({ length: pageSize }).map((_, i) => <SkeletonCard key={i} />)
                            : templates.map((doc) => (
                                <TemplateCard key={doc.id} doc={doc} isBusy={busyId === doc.id}
                                    actionLabel={isUserDocs ? 'Open' : 'Start Editing'} onAction={handleAction} />
                            ))}
                    </div>
                )}

                {!loading && !error && totalElements > 0 && (
                    <Pagination page={page} totalPages={totalPages} pageSize={pageSize}
                        onPageChange={(p) => setSearchParams(buildParams({ page: p }))}
                        onPageSizeChange={(s) => setSearchParams(buildParams({ page: 1, size: s }))} />
                )}
            </div>
        </div>
    );
}
