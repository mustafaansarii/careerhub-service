import { useEffect, useRef, useState } from 'react';

/*
 * Shared engine for the form-based resume builder.
 *
 * The builder is driven by a structured `resume` MODEL (so it can be prefilled from the user's
 * saved profile and serialized back on download). Text fields are caret-safe: `Field` seeds the
 * contentEditable from the model once on mount and reports edits via onChange, but never rewrites
 * the DOM while typing. Designs only supply visual slots (see templates/*.jsx).
 */

/* ── Page geometry (US Letter @96dpi) ────────────────────────────────── */
export const PAGE_W = 816;
export const PAGE = 1056;
export const GAP = 40;
export const STRIDE = PAGE + GAP;
export const MARGIN = 48;

let _id = 0;
export const nextId = () => ++_id;

/* ── Section catalog ─────────────────────────────────────────────────── */
export const SECTION_CATALOG = [
    { type: 'summary', title: 'Summary', kind: 'text', ph: "Briefly explain why you're a great fit for the role." },
    { type: 'experience', title: 'Experience', kind: 'exp', primaryPh: 'Company Name', secondaryPh: 'Title', addLabel: 'experience' },
    { type: 'education', title: 'Education', kind: 'edu', addLabel: 'education' },
    { type: 'skills', title: 'Skills', kind: 'pair', addLabel: 'skill group' },
    { type: 'projects', title: 'Projects', kind: 'exp', primaryPh: 'Project Name', secondaryPh: 'Tech / Role', addLabel: 'project' },
    { type: 'courses', title: 'Training / Courses', kind: 'courses', primaryPh: 'Course Title', secondaryPh: 'Which institution provided the course?', addLabel: 'course' },
    { type: 'certifications', title: 'Certifications', kind: 'courses', primaryPh: 'Certification', secondaryPh: 'Issuing organization', addLabel: 'certification' },
    { type: 'achievements', title: 'Key Achievements', kind: 'simple', ph: 'Describe a key achievement', addLabel: 'achievement' },
    { type: 'awards', title: 'Awards', kind: 'simple', ph: 'Award or honor', addLabel: 'award' },
    { type: 'languages', title: 'Languages', kind: 'simple', ph: 'Language — proficiency', addLabel: 'language' },
    { type: 'volunteer', title: 'Volunteering', kind: 'exp', primaryPh: 'Organization', secondaryPh: 'Role', addLabel: 'entry' },
    { type: 'publications', title: 'Publications', kind: 'simple', ph: 'Publication, journal, year', addLabel: 'publication' },
    { type: 'interests', title: 'Interests', kind: 'simple', ph: 'Interest', addLabel: 'interest' },
    { type: 'references', title: 'References', kind: 'text', ph: 'Available upon request.' },
];
export const META = Object.fromEntries(SECTION_CATALOG.map((s) => [s.type, s]));
export const TEXT_FIELDS = ['name', 'title', 'location', 'phone', 'email', 'linkedin', 'linkedinUrl', 'github', 'githubUrl', 'summary', 'references'];
const LIST_TYPES = SECTION_CATALOG.filter((s) => s.kind !== 'text').map((s) => s.type);
const DEFAULT_ORDER = ['summary', 'experience', 'skills', 'courses', 'education'];
const FULL_ORDER = ['summary', 'experience', 'projects', 'skills', 'education', 'courses', 'certifications', 'achievements', 'awards', 'languages', 'volunteer', 'publications', 'interests', 'references'];

/* ── Model helpers ───────────────────────────────────────────────────── */
export function blankItem(kind) {
    switch (kind) {
        case 'exp': return { id: nextId(), primary: '', secondary: '', location: '', period: '', bullets: [{ id: nextId(), text: '' }] };
        case 'edu': return { id: nextId(), school: '', degree: '', location: '', period: '' };
        case 'pair': return { id: nextId(), label: '', value: '' };
        case 'courses': return { id: nextId(), title: '', issuer: '' };
        default: return { id: nextId(), text: '' };
    }
}

/** Build the editable model from a saved profile object (or empty → starter sections). */
export function profileToResume(profile) {
    const p = profile || {};
    const resume = {};
    TEXT_FIELDS.forEach((k) => { resume[k] = p[k] || ''; });

    const expFrom = (arr, keys) => (arr || []).map((it) => ({
        id: nextId(),
        primary: it[keys[0]] || '',
        secondary: it[keys[1]] || '',
        location: it.location || '',
        period: it.period || '',
        bullets: (Array.isArray(it.bullets) ? it.bullets : []).map((t) => ({ id: nextId(), text: t })),
    }));

    resume.experience = expFrom(p.experience, ['company', 'role']);
    resume.projects = expFrom(p.projects, ['name', 'tech']);
    resume.volunteer = expFrom(p.volunteer, ['company', 'role']);
    resume.education = (p.education || []).map((it) => ({ id: nextId(), school: it.school || '', degree: it.degree || '', location: it.location || '', period: it.period || '' }));
    resume.skills = (p.skills || []).map((it) => ({ id: nextId(), label: it.label || '', value: it.value || '' }));
    resume.courses = (p.courses || []).map((it) => ({ id: nextId(), title: it.title || '', issuer: it.issuer || '' }));
    resume.certifications = (p.certifications || []).map((it) => ({ id: nextId(), title: it.title || '', issuer: it.issuer || '' }));
    ['achievements', 'awards', 'languages', 'publications', 'interests'].forEach((t) => {
        resume[t] = (p[t] || []).map((s) => ({ id: nextId(), text: typeof s === 'string' ? s : (s.text || '') }));
    });

    // Section order: if the profile has content, show every section that has data (+ summary);
    // otherwise the default starter set.
    const has = (t) => (META[t].kind === 'text' ? !!resume[t] : (resume[t] && resume[t].length));
    const anyData = TEXT_FIELDS.some((k) => resume[k]) || LIST_TYPES.some((t) => resume[t] && resume[t].length);
    let order = anyData ? FULL_ORDER.filter((t) => t === 'summary' || has(t)) : DEFAULT_ORDER;
    if (!order.includes('summary')) order = ['summary', ...order];

    // ensure list sections in the order have at least one blank item to edit
    order.forEach((t) => {
        if (META[t].kind !== 'text' && (!resume[t] || resume[t].length === 0)) resume[t] = [blankItem(META[t].kind)];
    });
    resume._order = order;
    return resume;
}

/** Serialize the model back to a plain profile object for PATCH /api/auth/profile. */
export function resumeToProfile(resume) {
    const out = {};
    TEXT_FIELDS.forEach((k) => { if (resume[k]) out[k] = resume[k]; });
    const exp = (arr, keys) => (arr || []).map((it) => ({
        [keys[0]]: it.primary, [keys[1]]: it.secondary, location: it.location, period: it.period,
        bullets: (it.bullets || []).map((b) => b.text).filter(Boolean),
    }));
    if (resume.experience?.length) out.experience = exp(resume.experience, ['company', 'role']);
    if (resume.projects?.length) out.projects = exp(resume.projects, ['name', 'tech']);
    if (resume.volunteer?.length) out.volunteer = exp(resume.volunteer, ['company', 'role']);
    if (resume.education?.length) out.education = resume.education.map((it) => ({ school: it.school, degree: it.degree, location: it.location, period: it.period }));
    if (resume.skills?.length) out.skills = resume.skills.map((it) => ({ label: it.label, value: it.value }));
    if (resume.courses?.length) out.courses = resume.courses.map((it) => ({ title: it.title, issuer: it.issuer }));
    if (resume.certifications?.length) out.certifications = resume.certifications.map((it) => ({ title: it.title, issuer: it.issuer }));
    ['achievements', 'awards', 'languages', 'publications', 'interests'].forEach((t) => {
        if (resume[t]?.length) out[t] = resume[t].map((it) => it.text).filter(Boolean);
    });
    return out;
}

/* ── Caret-safe editable field (seed from model once; report edits) ──── */
export function Field({ as: Tag = 'span', value, onChange, ph, className = '' }) {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current && value != null && value !== '' && ref.current.textContent !== value) {
            ref.current.textContent = value;
        }
        // seed once — intentionally not depending on `value` so typing never moves the caret
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <Tag
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            data-ph={ph}
            onInput={(e) => onChange(e.currentTarget.textContent)}
            className={`editable ${className}`}
        />
    );
}

/* ── Month/Year period picker (controlled by a "Mon YYYY - …" string) ── */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = (() => { const now = new Date().getFullYear(); const a = []; for (let y = now + 6; y >= 1980; y--) a.push(y); return a; })();
const selectCls = 'flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-teal-400 focus:outline-none disabled:opacity-40';

function parsePeriod(str) {
    const out = { sm: '', sy: '', em: '', ey: '', present: false };
    if (!str) return out;
    const [a = '', b = ''] = String(str).split(/\s*[-–]\s*/);
    const m1 = a.trim().split(/\s+/);
    if (m1.length === 2) { out.sm = m1[0]; out.sy = m1[1]; } else if (/^\d{4}$/.test(m1[0])) { out.sy = m1[0]; }
    if (/^present$/i.test(b.trim())) out.present = true;
    else { const m2 = b.trim().split(/\s+/); if (m2.length === 2) { out.em = m2[0]; out.ey = m2[1]; } else if (/^\d{4}$/.test(m2[0])) { out.ey = m2[0]; } }
    return out;
}
const fmtMY = (m, y) => (y ? (m ? `${m} ${y}` : `${y}`) : '');
const labelOf = (v) => { const s = fmtMY(v.sm, v.sy); const e = v.present ? 'Present' : fmtMY(v.em, v.ey); return [s, e].filter(Boolean).join(' - '); };

function PeriodRow({ label, m, y, onM, onY, disabled }) {
    return (
        <div className="mb-2.5">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <div className="flex gap-2">
                <select value={m} onChange={(e) => onM(e.target.value)} disabled={disabled} className={selectCls}>
                    <option value="">Month</option>{MONTHS.map((mm) => <option key={mm} value={mm}>{mm}</option>)}
                </select>
                <select value={y} onChange={(e) => onY(e.target.value)} disabled={disabled} className={selectCls}>
                    <option value="">Year</option>{YEARS.map((yy) => <option key={yy} value={yy}>{yy}</option>)}
                </select>
            </div>
        </div>
    );
}

export function PeriodField({ value = '', onChange, className = 'block w-full rounded px-1 text-right text-slate-500 transition hover:bg-teal-50' }) {
    const [open, setOpen] = useState(false);
    const [v, setV] = useState(() => parsePeriod(value));
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    const upd = (k, val) => { const nv = { ...v, [k]: val }; setV(nv); onChange && onChange(labelOf(nv)); };
    const label = labelOf(v);
    return (
        <span ref={ref} className="relative block">
            <button type="button" onClick={() => setOpen((o) => !o)} className={className}>
                {label ? label : <span className="period-ph text-slate-400">Date period</span>}
            </button>
            {open && (
                <div className="no-print absolute right-0 z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xl">
                    <PeriodRow label="Start" m={v.sm} y={v.sy} onM={(x) => upd('sm', x)} onY={(x) => upd('sy', x)} />
                    <PeriodRow label="End" m={v.em} y={v.ey} onM={(x) => upd('em', x)} onY={(x) => upd('ey', x)} disabled={v.present} />
                    <label className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-600">
                        <input type="checkbox" checked={v.present} onChange={(e) => upd('present', e.target.checked)} className="h-3.5 w-3.5 accent-teal-500" />
                        I currently work / study here
                    </label>
                </div>
            )}
        </span>
    );
}

/* ── Add / Remove controls ───────────────────────────────────────────── */
export function AddButton({ onClick, children }) {
    return (
        <button onClick={onClick} className="no-print mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-teal-600 transition hover:bg-teal-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
            {children}
        </button>
    );
}

export function RemoveButton({ onClick }) {
    return (
        <button onMouseDown={(e) => e.preventDefault()} onClick={onClick} title="Remove" className="no-print absolute -left-6 top-0 hidden h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 group-hover/item:flex group-focus-within/item:flex">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
    );
}
