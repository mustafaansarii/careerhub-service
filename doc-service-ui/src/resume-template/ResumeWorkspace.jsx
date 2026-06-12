import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    PAGE_W, PAGE, GAP, STRIDE, MARGIN,
    SECTION_CATALOG, META, blankItem, profileToResume, resumeToProfile,
    AddButton, RemoveButton,
} from './shared';
import userService from '../services/user.service';

const ITEM_MARGIN = { exp: 'mb-4', edu: 'mb-3', courses: 'mb-1.5', pair: 'mb-1', simple: 'mb-1' };

export default function ResumeWorkspace({ design, initialProfile = null, authed = false }) {
    const [resume, setResume] = useState(() => profileToResume(initialProfile));
    const [order, setOrder] = useState(() => resume._order || ['summary', 'experience', 'skills', 'courses', 'education']);
    const [pageCount, setPageCount] = useState(1);
    const [dragType, setDragType] = useState(null);
    const [overType, setOverType] = useState(null);
    const [toolbar, setToolbar] = useState(null);
    const [adding, setAdding] = useState(false);
    const [saving, setSaving] = useState(false);
    const sheetRef = useRef(null);
    const scheduleRef = useRef(() => {});

    const setField = (key, value) => setResume((r) => ({ ...r, [key]: value }));
    const updateItem = (type, id, changes) => setResume((r) => ({ ...r, [type]: r[type].map((it) => (it.id === id ? { ...it, ...changes } : it)) }));
    const addItem = (type) => setResume((r) => ({ ...r, [type]: [...(r[type] || []), blankItem(META[type].kind)] }));
    const removeItem = (type, id) => setResume((r) => { const arr = (r[type] || []).filter((it) => it.id !== id); return { ...r, [type]: arr.length ? arr : [blankItem(META[type].kind)] }; });
    const updateBullet = (type, id, bid, text) => setResume((r) => ({ ...r, [type]: r[type].map((it) => (it.id === id ? { ...it, bullets: it.bullets.map((b) => (b.id === bid ? { ...b, text } : b)) } : it)) }));
    const addBullet = (type, id) => setResume((r) => ({ ...r, [type]: r[type].map((it) => (it.id === id ? { ...it, bullets: [...(it.bullets || []), blankItem('simple')] } : it)) }));
    const removeBullet = (type, id, bid) => setResume((r) => ({ ...r, [type]: r[type].map((it) => (it.id === id ? { ...it, bullets: it.bullets.filter((b) => b.id !== bid) } : it)) }));

    const moveSection = (from, to) => {
        if (!from || from === to) return;
        setOrder((prev) => { const arr = prev.filter((t) => t !== from); const idx = to ? arr.indexOf(to) : arr.length; arr.splice(idx < 0 ? arr.length : idx, 0, from); return arr; });
    };
    const removeSection = (type) => setOrder((prev) => prev.filter((t) => t !== type));
    const addSection = (type) => {
        setOrder((prev) => (prev.includes(type) ? prev : [...prev, type]));
        if (META[type].kind !== 'text') setResume((r) => (r[type] && r[type].length ? r : { ...r, [type]: [blankItem(META[type].kind)] }));
        setAdding(false);
    };

    useEffect(() => {
        const sheet = sheetRef.current;
        if (!sheet) return;
        let raf = 0;
        let ro;
        const measureApply = () => {
            const blocks = Array.from(sheet.querySelectorAll('[data-block]'));
            blocks.forEach((b) => { b.style.marginTop = ''; });
            const sheetTop = sheet.getBoundingClientRect().top;
            const data = blocks.map((b) => { const r = b.getBoundingClientRect(); return { el: b, top: r.top - sheetTop, h: r.height }; });
            const usable = PAGE - 2 * MARGIN;
            let page = 0, push = 0;
            for (const d of data) {
                const curTop = d.top + push;
                const pageBottom = page * STRIDE + (PAGE - MARGIN);
                if (d.h <= usable && curTop + d.h > pageBottom + 1) { page += 1; const delta = page * STRIDE + MARGIN - curTop; d.el.style.marginTop = `${delta}px`; push += delta; }
            }
            setPageCount(page + 1);
        };
        const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (ro) ro.disconnect(); measureApply(); raf = requestAnimationFrame(() => { if (ro) ro.observe(sheet); }); }); };
        scheduleRef.current = schedule;
        const clearPushes = () => sheet.querySelectorAll('[data-block]').forEach((b) => { b.style.marginTop = ''; });
        schedule();
        ro = new ResizeObserver(schedule);
        ro.observe(sheet);
        sheet.addEventListener('input', schedule);
        window.addEventListener('beforeprint', clearPushes);
        window.addEventListener('afterprint', schedule);
        return () => { cancelAnimationFrame(raf); if (ro) ro.disconnect(); sheet.removeEventListener('input', schedule); window.removeEventListener('beforeprint', clearPushes); window.removeEventListener('afterprint', schedule); };
    }, [design]);

    useEffect(() => { scheduleRef.current(); }, [order, resume, design]);

    useEffect(() => {
        const onSelect = () => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed || sel.rangeCount === 0) { setToolbar(null); return; }
            const node = sel.anchorNode;
            const el = node && (node.nodeType === 3 ? node.parentElement : node);
            const sheet = sheetRef.current;
            if (!el || !sheet || !sheet.contains(el) || !el.closest('.editable')) { setToolbar(null); return; }
            const rect = sel.getRangeAt(0).getBoundingClientRect();
            if (!rect || (rect.width === 0 && rect.height === 0)) { setToolbar(null); return; }
            setToolbar({ top: rect.top - 46, left: rect.left + rect.width / 2 });
        };
        document.addEventListener('selectionchange', onSelect);
        return () => document.removeEventListener('selectionchange', onSelect);
    }, []);
    const format = (cmd) => document.execCommand(cmd, false, null);
    const addLink = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
        const range = sel.getRangeAt(0).cloneRange();
        const inp = window.prompt('Enter the URL to link to:', 'https://');
        if (!inp) return;
        let href = inp.trim();
        if (!/^(https?:\/\/|mailto:|tel:)/i.test(href)) href = `https://${href}`;
        sel.removeAllRanges(); sel.addRange(range);
        document.execCommand('createLink', false, href);
        sheetRef.current?.querySelectorAll('a:not([target])').forEach((a) => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
    };

    const download = async () => {
        if (authed) {
            setSaving(true);
            try { await userService.updateProfile(resumeToProfile(resume)); }
            catch { /* keep going to print even if save fails */ }
            finally { setSaving(false); }
        }
        window.print();
    };

    const renderBody = (type) => {
        const meta = META[type];
        if (meta.kind === 'text') {
            return <div data-block>{design.renderText(resume[type] || '', (v) => setField(type, v), meta.ph)}</div>;
        }
        const items = resume[type] || [];
        return (
            <>
                {items.map((it) => (
                    <div key={it.id} data-block className={`group/item relative ${ITEM_MARGIN[meta.kind] || 'mb-2'}`}>
                        <RemoveButton onClick={() => removeItem(type, it.id)} />
                        {design.renderItem(meta.kind, {
                            item: it,
                            update: (changes) => updateItem(type, it.id, changes),
                            bullets: {
                                list: it.bullets || [],
                                update: (bid, text) => updateBullet(type, it.id, bid, text),
                                add: () => addBullet(type, it.id),
                                remove: (bid) => removeBullet(type, it.id, bid),
                            },
                            primaryPh: meta.primaryPh,
                            secondaryPh: meta.secondaryPh,
                            ph: meta.ph,
                        })}
                    </div>
                ))}
                <AddButton onClick={() => addItem(type)}>Add {meta.addLabel || 'item'}</AddButton>
            </>
        );
    };

    const available = SECTION_CATALOG.filter((s) => !order.includes(s.type));
    const stackHeight = pageCount * PAGE + (pageCount - 1) * GAP;

    return (
        <div id="rb-root" className="min-h-screen bg-slate-200/70">
            <style>{`
        .editable { outline: none; cursor: text; min-width: 1ch; border-radius: 3px; }
        .editable:hover { box-shadow: 0 0 0 2px rgba(13,148,136,0.12); }
        .editable:focus { box-shadow: 0 0 0 2px rgba(13,148,136,0.5); }
        .editable:empty::before { content: attr(data-ph); color: #9ca3af; }
        .editable a { color: #2563eb; text-decoration: underline; cursor: pointer; }
        @page { size: letter; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
          #rb-root { background: #fff !important; min-height: 0 !important; }
          #rb-canvas { padding: 0 !important; display: block !important; }
          #rb-stack { position: static !important; width: auto !important; height: auto !important; }
          #resume-sheet { position: static !important; box-shadow: none !important; margin: 0 !important; width: 8.5in !important; max-width: none !important; padding: 0.5in !important; font-size: 10.5pt !important; }
          #resume-sheet [data-block] { break-inside: avoid; margin-top: 0 !important; }
          .editable:hover, .editable:focus { box-shadow: none !important; }
          .editable:empty::before { content: "" !important; }
          .period-ph { display: none !important; }
          #resume-sheet button { padding: 0 !important; }
        }
      `}</style>

            {/* Toolbar */}
            <div className="no-print sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2 text-slate-500 transition hover:text-slate-900">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        <span className="text-sm font-medium">Home</span>
                    </Link>
                    <span className="hidden text-sm font-semibold text-slate-800 sm:inline">Resume Builder</span>
                    {design?.name && <span className="hidden rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 sm:inline">{design.name}</span>}
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden text-xs text-slate-400 md:inline">{authed ? 'Your details are pre-filled · edits save on download' : 'Click to edit · no account needed'}</span>
                    <button onClick={download} disabled={saving} className="inline-flex items-center gap-1.5 rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-400 disabled:opacity-60">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" /></svg>
                        {saving ? 'Saving…' : 'Download PDF'}
                    </button>
                </div>
            </div>

            {/* Format toolbar */}
            {toolbar && (
                <div className="no-print fixed z-[100000] flex -translate-x-1/2 gap-0.5 rounded-lg bg-slate-900 px-1 py-1 shadow-lg" style={{ top: toolbar.top, left: toolbar.left }} onMouseDown={(e) => e.preventDefault()}>
                    <button onClick={() => format('bold')} title="Bold" className="h-7 w-7 rounded text-sm font-bold text-white transition hover:bg-white/15">B</button>
                    <button onClick={() => format('italic')} title="Italic" className="h-7 w-7 rounded text-sm italic text-white transition hover:bg-white/15">I</button>
                    <button onClick={() => format('underline')} title="Underline" className="h-7 w-7 rounded text-sm text-white underline transition hover:bg-white/15">U</button>
                    <span className="my-1 w-px bg-white/20" />
                    <button onClick={addLink} title="Add link" className="flex h-7 w-7 items-center justify-center rounded text-white transition hover:bg-white/15">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                    </button>
                </div>
            )}

            {/* Page stack */}
            <div id="rb-canvas" className="flex justify-center px-4 py-8">
                <div id="rb-stack" className="relative max-w-full" style={{ width: PAGE_W, height: stackHeight }}>
                    {Array.from({ length: pageCount }).map((_, p) => (
                        <div key={p} className="no-print absolute inset-x-0 rounded-sm bg-white shadow-xl" style={{ top: p * STRIDE, height: PAGE }} />
                    ))}

                    <div id="resume-sheet" ref={sheetRef} className={`relative z-10 ${design.sheetClass}`} style={{ padding: MARGIN }}>
                        <header data-block>{design.renderHeader(resume, setField)}</header>

                        {order.map((type) => (
                            <div
                                key={type}
                                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOverType(type); }}
                                onDrop={(e) => { e.preventDefault(); moveSection(dragType, type); setDragType(null); setOverType(null); }}
                                className={`group/sec relative transition-opacity ${dragType === type ? 'opacity-40' : ''}`}
                            >
                                {overType === type && dragType && dragType !== type && (
                                    <div className="no-print pointer-events-none absolute -top-2 left-0 right-0 z-20 h-0.5 rounded bg-teal-500" />
                                )}
                                <div
                                    data-block draggable
                                    onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', type); setDragType(type); }}
                                    onDragEnd={() => { setDragType(null); setOverType(null); }}
                                    title="Drag this heading to move the whole section"
                                    className="relative mt-6 cursor-grab select-none rounded-md transition active:cursor-grabbing group-hover/sec:bg-teal-50/40"
                                >
                                    <span className="no-print absolute left-1 top-1 z-10 text-slate-300 opacity-0 transition group-hover/sec:opacity-100">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" /></svg>
                                    </span>
                                    {design.renderTitle(META[type].title)}
                                </div>
                                <button onMouseDown={(e) => e.preventDefault()} onClick={() => removeSection(type)} title="Remove this section" className="no-print absolute -right-9 top-6 hidden h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500 group-hover/sec:flex group-focus-within/sec:flex">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                {renderBody(type)}
                            </div>
                        ))}

                        <div className="no-print mt-8">
                            {!adding ? (
                                <button onClick={() => setAdding(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 transition hover:border-teal-400 hover:bg-teal-50/40 hover:text-teal-600">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
                                    Add section
                                </button>
                            ) : (
                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-700">Add a section</p>
                                        <button onClick={() => setAdding(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    {available.length ? (
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {available.map((s) => (
                                                <button key={s.type} onClick={() => addSection(s.type)} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-teal-400 hover:bg-teal-50">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 shrink-0 text-teal-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
                                                    {s.title}
                                                </button>
                                            ))}
                                        </div>
                                    ) : <p className="text-sm text-slate-400">All available sections have been added.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
