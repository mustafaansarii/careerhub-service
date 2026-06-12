import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';
import ProfileDetailsForm from '../components/profile/ProfileDetailsForm';
import userService from '../services/user.service';

function initialsOf(profile) {
    const base = (profile?.fullName || profile?.email || '?').trim();
    const parts = base.split(/[\s@.]+/).filter(Boolean);
    return (parts[0]?.[0] || '?').concat(parts[1]?.[0] || '').toUpperCase();
}

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

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

    const saveDetails = async (data) => {
        try {
            const updated = await userService.updateProfile(data);
            setProfile(updated);
            setEditing(false);
            toast.success('Details saved');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save details');
        }
    };

    const roles = Array.isArray(profile?.roles) ? profile.roles : (Array.isArray(profile?.role) ? profile.role : []);
    const details = profile?.profileData || null;

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
                    description="Manage your account and the resume details we reuse to pre-fill the builder."
                />
            </div>

            <div className="min-h-screen">
            <main className="mx-auto -mt-12 max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="space-y-6">
                        <div className="h-44 animate-pulse rounded-3xl bg-slate-200/70" />
                        <div className="h-72 animate-pulse rounded-3xl bg-slate-200/70" />
                    </div>
                ) : profile ? (
                    <div className="space-y-6">

                        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
                            <div className="h-28 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-400" />
                            <div className="px-6 pb-6 sm:px-8">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                                        <div className="-mt-14 flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-slate-800 to-slate-600 text-2xl font-bold text-white shadow-lg">
                                            {initialsOf(profile)}
                                        </div>
                                        <div className="min-w-0">
                                            <h1 className="truncate text-2xl font-bold text-slate-900">{profile.fullName || 'Your name'}</h1>
                                            <p className="truncate text-sm text-slate-500">{profile.email || '—'}</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${profile.verified ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${profile.verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                    {profile.verified ? 'Verified' : 'Unverified'}
                                                </span>
                                                {roles.map((r) => (
                                                    <span key={r} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{r}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <Link to="/resume-builder" className="inline-flex items-center gap-1.5 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-400">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-6 4h4m3 4H8a2 2 0 01-2-2V5a2 2 0 012-2h6l4 4v12a2 2 0 01-2 2z" /></svg>
                                            Open Resume Builder
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Resume details</h2>
                                    <p className="mt-0.5 text-sm text-slate-500">Saved to your account and used to pre-fill the resume builder.</p>
                                </div>
                                {!editing && (
                                    <button onClick={() => setEditing(true)} className="shrink-0 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                                        {details ? 'Edit details' : 'Add details'}
                                    </button>
                                )}
                            </div>

                            {editing ? (
                                <ProfileDetailsForm initial={details} onCancel={() => setEditing(false)} onSave={saveDetails} />
                            ) : details && Object.keys(details).length ? (
                                <DetailsSummary d={details} />
                            ) : (
                                <EmptyDetails onAdd={() => setEditing(true)} />
                            )}
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Quick links</h2>
                            <div className="grid gap-2.5 sm:grid-cols-3">
                                {[
                                    { to: '/my-templates', label: 'My Documents' },
                                    { to: '/templates', label: 'Browse Templates' },
                                    { to: '/settings', label: 'Settings' },
                                ].map((l) => (
                                    <Link key={l.to} to={l.to} className="group flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50/50">
                                        {l.label}
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                        Unable to load your profile. Please refresh the page.
                    </div>
                )}
            </main>
            </div>
        </>
    );
}

function EmptyDetails({ onAdd }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-6 4h4m3 4H8a2 2 0 01-2-2V5a2 2 0 012-2h6l4 4v12a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-sm text-slate-500">No resume details yet — add your experience, education and skills once and reuse them everywhere.</p>
            <button onClick={onAdd} className="rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-400">Add details</button>
        </div>
    );
}

function SubSection({ title, count, children }) {
    if (!count) return null;
    return (
        <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{title}</h3>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function EntryRow({ primary, secondary, meta }) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-2.5">
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{primary || '—'}</p>
                {secondary && <p className="truncate text-xs text-slate-500">{secondary}</p>}
            </div>
            {meta && <span className="shrink-0 text-xs text-slate-400">{meta}</span>}
        </div>
    );
}

function DetailsSummary({ d }) {
    const contact = [
        ['Location', d.location], ['Phone', d.phone], ['Email', d.email],
        ['LinkedIn', d.linkedin || d.linkedinUrl], ['GitHub', d.github || d.githubUrl],
    ].filter(([, v]) => v);

    return (
        <div className="space-y-7">
            {contact.length > 0 && (
                <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                    {contact.map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3 border-b border-slate-100 py-1.5 text-sm">
                            <span className="text-slate-500">{k}</span>
                            <span className="truncate text-right font-medium text-slate-800">{v}</span>
                        </div>
                    ))}
                </div>
            )}

            {d.summary && (
                <SubSection title="Summary" count={1}>
                    <p className="text-sm leading-relaxed text-slate-600">{d.summary}</p>
                </SubSection>
            )}

            <SubSection title="Experience" count={d.experience?.length}>
                {(d.experience || []).map((e, i) => <EntryRow key={i} primary={e.company} secondary={e.role} meta={e.period} />)}
            </SubSection>

            <SubSection title="Projects" count={d.projects?.length}>
                {(d.projects || []).map((p, i) => <EntryRow key={i} primary={p.name} secondary={p.tech} />)}
            </SubSection>

            <SubSection title="Education" count={d.education?.length}>
                {(d.education || []).map((e, i) => <EntryRow key={i} primary={e.school} secondary={e.degree} meta={e.period} />)}
            </SubSection>

            <SubSection title="Skills" count={d.skills?.length}>
                {(d.skills || []).map((s, i) => (
                    <p key={i} className="text-sm text-slate-700"><span className="font-semibold text-slate-800">{s.label}:</span> {s.value}</p>
                ))}
            </SubSection>

            <SubSection title="Achievements" count={d.achievements?.length}>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {(d.achievements || []).map((a, i) => <li key={i}>{typeof a === 'string' ? a : a.text}</li>)}
                </ul>
            </SubSection>
        </div>
    );
}

