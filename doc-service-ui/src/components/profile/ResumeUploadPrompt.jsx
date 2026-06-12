import { useEffect, useState } from 'react';
import authService from '../../services/auth.service';
import userService from '../../services/user.service';
import ResumeUploadButton from './ResumeUploadButton';

const DISMISS_KEY = 'resumePromptDismissed';

/**
 * After login, if the user has no saved profile details, offer a (closable) prompt to upload
 * their resume/CV. Dismissed for the rest of the session once closed.
 */
export default function ResumeUploadPrompt() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!authService.isAuthenticated() || sessionStorage.getItem(DISMISS_KEY)) return;
        let alive = true;
        (async () => {
            try {
                const me = await userService.getProfile();
                const empty = !me?.profileData || Object.keys(me.profileData).length === 0;
                if (alive && empty) setOpen(true);
            } catch { /* not logged in / failed — skip */ }
        })();
        return () => { alive = false; };
    }, []);

    const dismiss = () => {
        sessionStorage.setItem(DISMISS_KEY, '1');
        setOpen(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-900/40 p-4" onClick={dismiss}>
            <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button onClick={dismiss} className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
                </div>

                <h2 className="text-lg font-bold text-slate-900">Import your resume to get started</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    Upload your existing resume or CV (PDF or DOCX) and we'll extract your details with AI — so every
                    template comes pre-filled. You can edit everything afterward.
                </p>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button onClick={dismiss} className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100">
                        Maybe later
                    </button>
                    <ResumeUploadButton
                        label="Upload resume / CV"
                        onDone={dismiss}
                        className="inline-flex items-center gap-1.5 rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-400 disabled:opacity-60"
                    />
                </div>
            </div>
        </div>
    );
}
