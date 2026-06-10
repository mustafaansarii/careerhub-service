import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';
import userService from '../services/user.service';

function initialsOf(profile) {
    const base = (profile?.fullName || profile?.email || '?').trim();
    const parts = base.split(/[\s@.]+/).filter(Boolean);
    return (parts[0]?.[0] || '?').concat(parts[1]?.[0] || '').toUpperCase();
}

function Badge({ ok, okText, noText }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${ok ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {ok ? okText : noText}
        </span>
    );
}

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                setProfile(await userService.getProfile());
            } catch (err) {
                toast.error(err?.response?.data?.message || err?.message || 'Unable to load your profile.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const roles = Array.isArray(profile?.role) ? profile.role : [];

    return (
        <>
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50 dark:border-white/50"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}
            >
                <Navbar />
                <PageHero
                    breadcrumb="My Account"
                    title="My Profile"
                    description="Your account details, verification status, and quick links — all in one place."
                />
            </div>

            <main className="mx-auto -mt-10 max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="space-y-6">
                        <div className="h-40 animate-pulse rounded-3xl bg-slate-100" />
                        <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
                    </div>
                ) : profile ? (
                    <div className="space-y-6">
                        {/* Header card */}
                        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
                            <div className="h-24 bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400" />
                            <div className="px-6 pb-6 sm:px-8">
                                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                                    <div className="-mt-12 flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-slate-800 to-slate-600 text-2xl font-bold text-white shadow-lg">
                                        {initialsOf(profile)}
                                    </div>
                                    <div className="min-w-0 flex-1 sm:pb-1">
                                        <h1 className="truncate text-2xl font-bold text-slate-900">{profile.fullName || 'Your name'}</h1>
                                        <p className="truncate text-sm text-slate-500">{profile.email || '—'}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 sm:pb-1">
                                        <Badge ok={profile.verified} okText="Verified" noText="Unverified" />
                                        <Badge ok={profile.active} okText="Active" noText="Disabled" />
                                    </div>
                                </div>

                                {roles.length > 0 && (
                                    <div className="mt-5 flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Roles</span>
                                        {roles.map((r) => (
                                            <span key={r} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Details + quick links */}
                        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                                <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Account details</h2>
                                <dl className="divide-y divide-slate-100 text-sm">
                                    {[
                                        { label: 'Full name', value: profile.fullName || '—' },
                                        { label: 'Email address', value: profile.email || '—' },
                                        { label: 'Role', value: roles.length ? roles.join(', ') : '—' },
                                        { label: 'Email verified', value: profile.verified ? 'Yes' : 'No' },
                                        { label: 'Account status', value: profile.active ? 'Active' : 'Disabled' },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex items-center justify-between gap-4 py-3.5">
                                            <dt className="text-slate-500">{label}</dt>
                                            <dd className="truncate text-right font-medium text-slate-900">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>

                            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                                <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Quick links</h2>
                                <div className="space-y-2.5">
                                    <Link to="/my-templates" className="group flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50/50">
                                        My Documents
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    </Link>
                                    <Link to="/templates" className="group flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50/50">
                                        Browse Templates
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    </Link>
                                    <Link to="/settings" className="group flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50/50">
                                        Settings
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    </Link>
                                </div>
                            </section>
                        </div>

                        <DeleteAccountSection />
                    </div>
                ) : (
                    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                        Unable to load your profile. Please refresh the page.
                    </div>
                )}
            </main>
        </>
    );
}

function DeleteAccountSection() {
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await userService.deleteAccount();
            localStorage.removeItem('isAuthenticated');
            toast.success('Account deleted successfully.');
            window.location.href = '/login';
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to delete account. Please try again.');
            setDeleting(false);
            setConfirming(false);
        }
    };

    return (
        <section className="rounded-3xl border border-red-200 bg-red-50/50 p-6 sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-red-600">Danger zone</h2>
            <p className="mt-1 mb-5 text-sm text-slate-500">
                Permanently delete your account and all associated documents. This action cannot be undone.
            </p>

            {!confirming ? (
                <button
                    onClick={() => setConfirming(true)}
                    className="rounded-xl border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                >
                    Delete my account
                </button>
            ) : (
                <div className="rounded-2xl border border-red-200 bg-white p-5">
                    <p className="mb-4 text-sm font-semibold text-red-700">
                        Are you sure? This will permanently delete your account and documents.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                            {deleting ? 'Deleting…' : 'Yes, delete my account'}
                        </button>
                        <button
                            onClick={() => setConfirming(false)}
                            disabled={deleting}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
