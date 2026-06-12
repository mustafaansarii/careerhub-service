import { useState } from 'react';

const EMPTY = {
    name: '', location: '', phone: '', email: '',
    linkedin: '', linkedinUrl: '', github: '', githubUrl: '',
    experience: [], education: [], projects: [], skills: [], achievements: [],
};

const input = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20';
const label = 'mb-1 block text-xs font-medium text-slate-600';

function Field({ label: l, value, onChange, placeholder, full }) {
    return (
        <div className={full ? 'sm:col-span-2' : ''}>
            <label className={label}>{l}</label>
            <input className={input} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        </div>
    );
}

function Area({ label: l, value, onChange, placeholder }) {
    return (
        <div className="sm:col-span-2">
            <label className={label}>{l}</label>
            <textarea className={`${input} h-20 resize-y`} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        </div>
    );
}

function ListSection({ title, items, onAdd, onRemove, addLabel, renderRow }) {
    return (
        <section>
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">{title}</h3>
                <button type="button" onClick={onAdd} className="text-xs font-semibold text-teal-600 hover:text-teal-700">+ {addLabel}</button>
            </div>
            <div className="space-y-4">
                {items.length === 0 && <p className="text-xs text-slate-400">None added yet.</p>}
                {items.map((it, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 p-4">
                        <div className="mb-2 flex justify-end">
                            <button type="button" onClick={() => onRemove(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{renderRow(it, i)}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function ProfileDetailsForm({ initial, onCancel, onSave }) {
    const [data, setData] = useState(() => ({ ...EMPTY, ...(initial || {}) }));
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
    const updateList = (key, i, changes) => setData((d) => ({ ...d, [key]: d[key].map((it, idx) => (idx === i ? { ...it, ...changes } : it)) }));
    const addItem = (key, blank) => setData((d) => ({ ...d, [key]: [...d[key], blank] }));
    const removeItem = (key, i) => setData((d) => ({ ...d, [key]: d[key].filter((_, idx) => idx !== i) }));
    const bullets = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');
    const toBullets = (text) => text.split('\n').map((s) => s.trim()).filter(Boolean);

    const submit = async () => {
        setSaving(true);
        try {
            await onSave(data);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">

            <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Basic details</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Full name" value={data.name} onChange={(v) => set('name', v)} full />
                    <Field label="Location" value={data.location} onChange={(v) => set('location', v)} />
                    <Field label="Phone" value={data.phone} onChange={(v) => set('phone', v)} />
                    <Field label="Email" value={data.email} onChange={(v) => set('email', v)} />
                    <Field label="LinkedIn (label)" value={data.linkedin} onChange={(v) => set('linkedin', v)} placeholder="linkedin/yourname" />
                    <Field label="LinkedIn URL" value={data.linkedinUrl} onChange={(v) => set('linkedinUrl', v)} placeholder="https://linkedin.com/in/…" />
                    <Field label="GitHub (label)" value={data.github} onChange={(v) => set('github', v)} placeholder="github/yourname" />
                    <Field label="GitHub URL" value={data.githubUrl} onChange={(v) => set('githubUrl', v)} placeholder="https://github.com/…" />
                </div>
            </section>

            <ListSection
                title="Experience" items={data.experience} addLabel="Add experience"
                onAdd={() => addItem('experience', { company: '', role: '', location: '', period: '', bullets: [] })}
                onRemove={(i) => removeItem('experience', i)}
                renderRow={(it, i) => (
                    <>
                        <Field label="Company" value={it.company} onChange={(v) => updateList('experience', i, { company: v })} />
                        <Field label="Role / Title" value={it.role} onChange={(v) => updateList('experience', i, { role: v })} />
                        <Field label="Location" value={it.location} onChange={(v) => updateList('experience', i, { location: v })} />
                        <Field label="Period" value={it.period} onChange={(v) => updateList('experience', i, { period: v })} placeholder="Jan 2020 - Present" />
                        <Area label="Highlights (one per line)" value={bullets(it.bullets)} onChange={(v) => updateList('experience', i, { bullets: toBullets(v) })} />
                    </>
                )}
            />

            <ListSection
                title="Projects" items={data.projects} addLabel="Add project"
                onAdd={() => addItem('projects', { name: '', tech: '', githubUrl: '', liveUrl: '', bullets: [] })}
                onRemove={(i) => removeItem('projects', i)}
                renderRow={(it, i) => (
                    <>
                        <Field label="Project name" value={it.name} onChange={(v) => updateList('projects', i, { name: v })} />
                        <Field label="Tech / Stack" value={it.tech} onChange={(v) => updateList('projects', i, { tech: v })} />
                        <Field label="GitHub URL" value={it.githubUrl} onChange={(v) => updateList('projects', i, { githubUrl: v })} />
                        <Field label="Live URL" value={it.liveUrl} onChange={(v) => updateList('projects', i, { liveUrl: v })} />
                        <Area label="Highlights (one per line)" value={bullets(it.bullets)} onChange={(v) => updateList('projects', i, { bullets: toBullets(v) })} />
                    </>
                )}
            />

            <ListSection
                title="Education" items={data.education} addLabel="Add education"
                onAdd={() => addItem('education', { school: '', degree: '', location: '', period: '' })}
                onRemove={(i) => removeItem('education', i)}
                renderRow={(it, i) => (
                    <>
                        <Field label="School / University" value={it.school} onChange={(v) => updateList('education', i, { school: v })} />
                        <Field label="Degree" value={it.degree} onChange={(v) => updateList('education', i, { degree: v })} />
                        <Field label="Location" value={it.location} onChange={(v) => updateList('education', i, { location: v })} />
                        <Field label="Period" value={it.period} onChange={(v) => updateList('education', i, { period: v })} />
                    </>
                )}
            />

            <ListSection
                title="Skills" items={data.skills} addLabel="Add skill group"
                onAdd={() => addItem('skills', { label: '', value: '' })}
                onRemove={(i) => removeItem('skills', i)}
                renderRow={(it, i) => (
                    <>
                        <Field label="Category" value={it.label} onChange={(v) => updateList('skills', i, { label: v })} placeholder="Languages" />
                        <Field label="Items" value={it.value} onChange={(v) => updateList('skills', i, { value: v })} placeholder="Java, Python, JavaScript" />
                    </>
                )}
            />

            <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Achievements</h3>
                <textarea
                    className={`${input} h-24 resize-y`}
                    value={bullets(data.achievements)}
                    onChange={(e) => set('achievements', toBullets(e.target.value))}
                    placeholder="One achievement per line"
                />
            </section>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button type="button" onClick={onCancel} disabled={saving} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">Cancel</button>
                <button type="button" onClick={submit} disabled={saving} className="rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-400 disabled:opacity-60">
                    {saving ? 'Saving…' : 'Save details'}
                </button>
            </div>
        </div>
    );
}
