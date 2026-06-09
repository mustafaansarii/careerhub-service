import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service';
import OAuthButtons from './OAuthButtons';

const inputClass =
    'w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20';

export default function AuthLoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await authService.signin(email, password);
            toast.success('Signed in successfully');
            navigate('/');
        } catch (err) {
            const message =
                err?.response?.data?.message || err?.message || 'Unable to sign in. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm">
            <h2 className="mb-1 text-xl font-semibold text-slate-900 dark:text-white">Sign in</h2>
            <p className="mb-6 text-xs text-slate-500 dark:text-slate-400">
                Use your email and password to continue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <input id="email" type="email" required autoComplete="email" value={email}
                        onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="you@example.com" />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <input id="password" type="password" required autoComplete="current-password" value={password}
                        onChange={(event) => setPassword(event.target.value)} className={inputClass} placeholder="Enter your password" />
                </div>

                <button type="submit" disabled={loading}
                    className="flex w-full items-center justify-center rounded-xl bg-slate-900 dark:bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
                    {loading ? 'Signing you in…' : 'Sign in'}
                </button>
            </form>

            <OAuthButtons />

            <p className="mt-5 text-center text-[11px] text-slate-500 dark:text-slate-400">
                New to DocService?{' '}
                <button type="button" className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700" onClick={() => navigate('/signup')}>
                    Create an account
                </button>
            </p>
        </div>
    );
}
