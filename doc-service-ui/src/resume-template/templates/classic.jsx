import { Field, PeriodField } from '../shared';

function Bullets({ bullets }) {
    return (
        <ul className="mt-1 list-disc pl-5 text-slate-700">
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

const classic = {
    code: 'classic',
    name: 'Classic',
    sheetClass: 'font-serif text-[14px] leading-relaxed text-slate-900',

    renderHeader: (r, set) => (
        <div className="text-center">
            <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className="block text-3xl font-bold uppercase tracking-[0.15em]" />
            <Field value={r.title} onChange={(v) => set('title', v)} ph="The role you are applying for?" className="mt-1 block text-lg text-slate-400" />
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-500">
                <Field value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" /><span className="text-slate-300">•</span>
                <Field value={r.email} onChange={(v) => set('email', v)} ph="Email" /><span className="text-slate-300">•</span>
                <Field value={r.linkedin} onChange={(v) => set('linkedin', v)} ph="LinkedIn/Portfolio" /><span className="text-slate-300">•</span>
                <Field value={r.location} onChange={(v) => set('location', v)} ph="Location" />
            </div>
        </div>
    ),

    renderTitle: (title) => (
        <>
            <h2 className="text-center text-lg font-bold uppercase tracking-wide">{title}</h2>
            <div className="mb-3 mt-1 border-t border-slate-900" />
        </>
    ),

    renderText: (value, onChange, ph) => <Field as="p" value={value} onChange={onChange} ph={ph} className="text-slate-700" />,

    renderItem: (kind, ctx) => {
        const { item, update, bullets, primaryPh, secondaryPh, ph } = ctx;
        if (kind === 'exp') {
            return (
                <>
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className="block text-slate-500" />
                            <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="block font-semibold" />
                        </div>
                        <div className="shrink-0 text-right">
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
                        <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" className="block font-semibold" />
                        <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className="block text-slate-600" />
                    </div>
                    <div className="shrink-0 text-right">
                        <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" className="block" />
                        <PeriodField value={item.period} onChange={(v) => update({ period: v })} />
                    </div>
                </div>
            );
        }
        if (kind === 'courses') {
            return (
                <p>
                    <Field value={item.title} onChange={(v) => update({ title: v })} ph={primaryPh} className="text-slate-500" />
                    <span className="px-1.5 text-slate-400">—</span>
                    <Field value={item.issuer} onChange={(v) => update({ issuer: v })} ph={secondaryPh} />
                </p>
            );
        }
        if (kind === 'pair') {
            return (
                <p>
                    <Field value={item.label} onChange={(v) => update({ label: v })} ph="Category" className="font-semibold" />
                    <span className="px-1.5 text-slate-400">:</span>
                    <Field value={item.value} onChange={(v) => update({ value: v })} ph="e.g. Java, Python, SQL" />
                </p>
            );
        }
        // simple
        return <Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} className="block" />;
    },
};

export default classic;
