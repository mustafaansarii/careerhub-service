import { Field, PeriodField } from '../shared';

function Bullets({ bullets }) {
    return (
        <ul className="mt-1 list-disc pl-5 text-slate-600">
            {bullets.list.map((b) => (
                <li key={b.id} className="group/b relative">
                    <Field value={b.text} onChange={(v) => bullets.update(b.id, v)} ph="Highlight your accomplishments, using numbers if possible." />
                    {bullets.list.length > 1 && (
                        <button onMouseDown={(e) => e.preventDefault()} onClick={() => bullets.remove(b.id)} title="Remove highlight" className="no-print absolute -left-5 top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-50 text-[10px] text-red-500 hover:bg-red-100 group-hover/b:flex">×</button>
                    )}
                </li>
            ))}
            <li className="no-print list-none">
                <button onClick={bullets.add} className="text-xs font-semibold text-teal-600 hover:text-teal-700">+ highlight</button>
            </li>
        </ul>
    );
}

const Dot = () => <span className="px-1.5 text-slate-300">|</span>;

const modern = {
    code: 'modern',
    name: 'Modern',
    accent: '#0f766e',
    sheetClass: 'font-sans text-slate-800',

    renderHeader: (r, set) => (
        <div>
            <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className="block text-[2.4em] font-extrabold leading-tight tracking-tight text-slate-900" />
            <Field value={r.title} onChange={(v) => set('title', v)} ph="The role you are applying for?" className="mt-0.5 block text-[1.05em] font-semibold text-[color:var(--rb-accent)]" />
            <div className="mt-2 flex flex-wrap items-center gap-y-1 text-[0.82em] text-slate-500">
                <Field value={r.location} onChange={(v) => set('location', v)} ph="Location" /><Dot />
                <Field value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" /><Dot />
                <Field value={r.email} onChange={(v) => set('email', v)} ph="Email" /><Dot />
                <Field value={r.linkedin} onChange={(v) => set('linkedin', v)} ph="LinkedIn" /><Dot />
                <Field value={r.github} onChange={(v) => set('github', v)} ph="GitHub" />
            </div>
        </div>
    ),

    renderTitle: (title) => (
        <>
            <h2 className="text-[0.95em] font-bold uppercase tracking-wider text-[color:var(--rb-accent)]">{title}</h2>
            <div className="mb-2 mt-0.5 border-t-2 border-[color:var(--rb-accent)]" />
        </>
    ),

    renderText: (value, onChange, ph) => <Field as="p" value={value} onChange={onChange} ph={ph} className="text-slate-600" />,

    renderItem: (kind, ctx) => {
        const { item, update, bullets, primaryPh, secondaryPh, ph } = ctx;
        if (kind === 'exp') {
            return (
                <>
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="block font-bold text-slate-900" />
                            <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className="block text-[color:var(--rb-accent)]" />
                        </div>
                        <div className="shrink-0 text-right text-xs text-slate-500">
                            <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" className="block" />
                            <PeriodField value={item.period} onChange={(v) => update({ period: v })} />
                        </div>
                    </div>
                    <Bullets bullets={bullets} />
                </>
            );
        }
        if (kind === 'edu') {
            return (
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" className="block font-bold text-slate-900" />
                        <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className="block text-slate-600" />
                    </div>
                    <div className="shrink-0 text-right text-xs text-slate-500">
                        <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" className="block" />
                        <PeriodField value={item.period} onChange={(v) => update({ period: v })} />
                    </div>
                </div>
            );
        }
        if (kind === 'courses') {
            return (
                <p>
                    <Field value={item.title} onChange={(v) => update({ title: v })} ph={primaryPh} className="font-semibold text-slate-800" />
                    <span className="px-1.5 text-slate-400">—</span>
                    <Field value={item.issuer} onChange={(v) => update({ issuer: v })} ph={secondaryPh} className="text-slate-600" />
                </p>
            );
        }
        if (kind === 'pair') {
            return (
                <p>
                    <Field value={item.label} onChange={(v) => update({ label: v })} ph="Category" className="font-bold text-[color:var(--rb-accent)]" />
                    <span className="px-1.5 text-slate-400">:</span>
                    <Field value={item.value} onChange={(v) => update({ value: v })} ph="e.g. Java, Python, SQL" className="text-slate-700" />
                </p>
            );
        }
        return <Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} className="block text-slate-600" />;
    },
};

export default modern;
