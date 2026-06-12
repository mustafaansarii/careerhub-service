import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import userService from '../../services/user.service';

/**
 * Upload a PDF/DOCX resume → backend extracts + AI-normalises it into profile data (overrides
 * existing). Calls onDone(profileData) on success. Pass `confirm` to ask before replacing.
 */
export default function ResumeUploadButton({ label = 'Upload resume / CV', confirm, onDone, className }) {
    const inputRef = useRef(null);
    const [busy, setBusy] = useState(false);

    const pick = () => {
        if (confirm && !window.confirm(confirm)) return;
        inputRef.current?.click();
    };

    const onChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setBusy(true);
        const id = toast.loading('Reading your resume…');
        try {
            const profile = await userService.importResume(file);
            toast.success('Resume imported', { id });
            onDone?.(profile);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to import resume', { id });
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={onChange} />
            <button
                type="button"
                onClick={pick}
                disabled={busy}
                className={className || 'inline-flex items-center gap-1.5 rounded-full border border-teal-300 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 disabled:opacity-60'}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
                {busy ? 'Reading…' : label}
            </button>
        </>
    );
}
