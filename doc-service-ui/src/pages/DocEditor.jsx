import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import docService from '../services/doc.service';
import paymentService from '../services/payment.service';
import ResumeUploadButton from '../components/profile/ResumeUploadButton';
import PricingModal from '../components/payment/PricingModal';

export default function DocEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const prefetched = location.state?.doc ?? null;

    const [doc, setDoc] = useState(prefetched);
    const [loadingDoc, setLoadingDoc] = useState(!prefetched);
    const [code, setCode] = useState(prefetched?.latexCode || '');
    const [pdfUrl, setPdfUrl] = useState(prefetched?.pdfUrl || '');
    const [compiling, setCompiling] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const [pricingOpen, setPricingOpen] = useState(false);
    const [locked, setLocked] = useState(true);
    const blobUrlRef = useRef(null);
    const handleCompileRef = useRef(null);

    useEffect(() => {
        if (prefetched) {
            setLocked(!prefetched.unlocked);
            return;
        }
        docService.getUserDoc(id)
            .then((data) => {
                setDoc(data);
                setCode(data.latexCode || '');
                setPdfUrl(data.pdfUrl || '');
                setLocked(!data.unlocked);
            })
            .catch(() => toast.error('Failed to load document'))
            .finally(() => setLoadingDoc(false));
    }, [id]);

    useEffect(() => {
        return () => {
            if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        };
    }, []);

    const editorContainerRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleCompileRef.current?.();
            }
        };
        document.addEventListener('keydown', handler, true);
        return () => document.removeEventListener('keydown', handler, true);
    }, []);

    const handleCompile = async () => {
        if (compiling) return;
        setCompiling(true);
        try {
            const data = await docService.compile(id, code);

            if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);

            const blob = new Blob([data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            blobUrlRef.current = url;
            setPdfUrl(url);
            toast.success('Compiled');
        } catch (err) {
            let msg = 'Compilation failed';
            if (err?.response?.data instanceof Blob) {
                try {
                    const parsed = JSON.parse(await err.response.data.text());
                    msg = parsed?.message || msg;
                } catch {}
            } else {
                msg = err?.response?.data?.message || msg;
            }
            toast.error(msg);
        } finally {
            setCompiling(false);
        }
    };

    handleCompileRef.current = handleCompile;

    const handleUnlock = async () => {
        if (unlocking) return;
        setUnlocking(true);
        try {
            await docService.claim(id);
            setLocked(false);
            toast.success('Resume unlocked — you can download it now');
            handleCompileRef.current?.();
        } catch (err) {
            if (err?.response?.status === 402) {
                setPricingOpen(true);
            } else {
                toast.error(err?.response?.data?.message || 'Could not unlock this resume');
            }
        } finally {
            setUnlocking(false);
        }
    };

    const handleDownload = async () => {
        if (downloading) return;
        setDownloading(true);
        try {
            const blob = await paymentService.unlockDoc(id);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${doc?.name ?? 'document'}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            setLocked(false);
            toast.success('Downloaded');
        } catch (err) {
            if (err?.response?.status === 402) {
                setPricingOpen(true);
            } else {
                toast.error(err?.response?.data?.message || 'Download failed');
            }
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="flex flex-col bg-slate-950 h-screen">

            <div className="editor-header-bg grid h-12 shrink-0 grid-cols-3 items-center border-b border-slate-200 px-4">

                <div className="flex items-center gap-2">
                    <Link
                        to="/templates?type=CV_AND_RESUME&page=1&size=10"
                        className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-slate-600 transition hover:bg-white/50 hover:text-slate-900"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Templates
                    </Link>
                    <div className="h-3.5 w-px bg-slate-300" />
                    <span className="truncate text-xs font-medium text-slate-600">
                        {loadingDoc ? 'Loading…' : (doc?.name ?? 'Document Editor')}
                    </span>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleCompile}
                        disabled={compiling || loadingDoc}
                        title="Compile (Ctrl + Enter)"
                        className="group relative flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {compiling ? (
                            <>
                                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                                </svg>
                                Compiling…
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                                Compile
                                <span className="absolute -right-1 -top-2 flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1 py-px opacity-0 transition-opacity group-hover:opacity-100 shadow-sm">
                                    <kbd className="text-[9px] font-normal text-slate-400">Ctrl</kbd>
                                    <span className="text-[9px] text-slate-300">+</span>
                                    <kbd className="text-[9px] font-normal text-slate-400">↵</kbd>
                                </span>
                            </>
                        )}
                    </button>
                </div>

                <div className="flex items-center justify-end gap-1">
                    <ResumeUploadButton
                        label="Upload CV"
                        confirm="Import a resume and rewrite this document with the new details?"
                        className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-slate-500 transition hover:bg-white/50 hover:text-slate-900 disabled:opacity-40"
                        onDone={async () => {
                            try {
                                const updated = await docService.refreshDoc(id);
                                setCode(updated.latexCode || '');
                                toast.success('Document updated with your new details');
                            } catch (err) {
                                toast.error(err?.response?.data?.message || 'Could not refresh the document');
                            }
                        }}
                    />
                    {locked ? (
                        <button
                            onClick={handleUnlock}
                            disabled={unlocking || loadingDoc}
                            title="Unlock this resume (uses one credit)"
                            className="flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {unlocking ? (
                                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 10V7a4 4 0 00-8 0v3M6 10h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1z" />
                                </svg>
                            )}
                            {unlocking ? 'Unlocking…' : 'Unlock'}
                        </button>
                    ) : (
                        <button
                            onClick={handleDownload}
                            disabled={downloading || loadingDoc}
                            title="Download PDF"
                            className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {downloading ? (
                                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                                </svg>
                            )}
                            Download
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">

                <div ref={editorContainerRef} className="flex w-1/2 flex-col border-r border-slate-700">
                    {loadingDoc ? (
                        <div className="flex flex-1 items-center justify-center bg-slate-950">
                            <svg className="h-6 w-6 animate-spin text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                            </svg>
                        </div>
                    ) : (
                        <Editor
                            height="100%"
                            language="javascript"
                            value={code}
                            onChange={(val) => setCode(val ?? '')}
                            theme="vs-dark"
                            beforeMount={(monaco) => {
                                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                                    noSemanticValidation: true,
                                    noSyntaxValidation: true,
                                    noSuggestionDiagnostics: true,
                                });
                            }}
                            onMount={(editor, monaco) => {
                                editor.addCommand(
                                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                                    () => handleCompileRef.current()
                                );
                            }}
                            options={{
                                fontSize: 14,
                                lineHeight: 22,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                padding: { top: 12, bottom: 12 },
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                renderValidationDecorations: 'off',
                            }}
                        />
                    )}
                </div>

                <div className="flex w-1/2 flex-col bg-slate-800">
                    {locked && pdfUrl && (
                        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-50 px-4 py-2">
                            <p className="text-xs text-amber-800">
                                <span className="font-semibold">Free preview</span> — only the top of page 1 is shown. Unlock to view &amp; download the full resume.
                            </p>
                            <button
                                onClick={handleUnlock}
                                disabled={unlocking}
                                className="shrink-0 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-amber-400 disabled:opacity-60"
                            >
                                {unlocking ? 'Unlocking…' : 'Unlock'}
                            </button>
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                        {pdfUrl ? (
                            <iframe
                                key={pdfUrl}
                                src={pdfUrl}
                                title="PDF Preview"
                                className="h-full w-full border-none"
                            />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10 opacity-40">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-sm text-slate-400">Hit <span className="font-semibold text-teal-400">Compile</span> to generate a PDF preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <PricingModal
                open={pricingOpen}
                onClose={() => setPricingOpen(false)}
                onSuccess={() => { setPricingOpen(false); handleUnlock(); }}
                title="Upgrade to download this resume"
            />
        </div>
    );
}
