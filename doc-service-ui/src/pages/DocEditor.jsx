import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import docService from '../services/doc.service';

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
    const blobUrlRef = useRef(null);
    const handleCompileRef = useRef(null);

    useEffect(() => {
        if (prefetched) return;
        docService.getUserDoc(id)
            .then((data) => {
                setDoc(data);
                setCode(data.latexCode || '');
                setPdfUrl(data.pdfUrl || '');
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

    return (
        <div className="flex flex-col bg-slate-950 h-screen">

            <div className="grid h-12 shrink-0 grid-cols-3 items-center border-b border-slate-200 bg-white px-4">

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <div className="h-3.5 w-px bg-slate-200" />
                    <span className="truncate text-xs font-medium text-slate-500">
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

                <div className="flex justify-end">
                    {pdfUrl && (
                        <a
                            href={pdfUrl}
                            download={`${doc?.name ?? 'document'}.pdf`}
                            className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                            </svg>
                            Download
                        </a>
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
        </div>
    );
}
