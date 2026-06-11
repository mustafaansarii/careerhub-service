import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ResumeWorkspace from '../resume-template/ResumeWorkspace';
import { getTemplate } from '../resume-template/registry';
import userService from '../services/user.service';

/*
 * Public form-based resume builder. The :code route param selects the design. If the visitor is
 * signed in, their saved profile details prefill the form (and edits save back on download).
 */
export default function ResumeBuilder() {
    const { code } = useParams();
    const design = getTemplate(code);
    const [state, setState] = useState({ loading: true, profile: null, authed: false });

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const me = await userService.getProfile();      // 401 for anonymous → caught below
                if (alive) setState({ loading: false, profile: me?.profileData || null, authed: true });
            } catch {
                if (alive) setState({ loading: false, profile: null, authed: false });
            }
        })();
        return () => { alive = false; };
    }, []);

    if (state.loading) {
        return <div className="flex min-h-screen items-center justify-center bg-slate-200/70 text-sm text-slate-500">Loading…</div>;
    }

    return <ResumeWorkspace key={`${design.code}:${state.authed}`} design={design} initialProfile={state.profile} authed={state.authed} />;
}
