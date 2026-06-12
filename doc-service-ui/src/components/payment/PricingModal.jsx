import { useState } from 'react';
import toast from 'react-hot-toast';
import paymentService, { PLANS, loadCashfree } from '../../services/payment.service';


export default function PricingModal({ open, onClose, onSuccess, title = 'Upgrade to download' }) {
    const [busy, setBusy] = useState(null);

    if (!open) return null;

    const buy = async (plan) => {
        setBusy(plan.code);
        try {
            const order = await paymentService.createOrder(plan.code);
            const cashfree = await loadCashfree();
            const result = await cashfree.checkout({ paymentSessionId: order.paymentSessionId, redirectTarget: '_modal' });
            if (result?.error) {
                toast.error(result.error.message || 'Payment was cancelled');
                return;
            }
            const verification = await paymentService.verify(order.orderId);
            if (String(verification?.orderStatus).toUpperCase() === 'PAID') {
                toast.success('Payment successful — you\'re upgraded!');
                onSuccess?.();
                onClose?.();
            } else {
                toast('Payment not completed yet. If you were charged, it will reflect shortly.');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || 'Could not start the payment');
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-2xl rounded-3xl bg-white p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">Pay once — valid for 1 year. Cancel anytime before paying.</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {PLANS.map((plan) => (
                        <div key={plan.code} className={`relative flex flex-col rounded-2xl border p-5 ${plan.highlight ? 'border-teal-400 ring-2 ring-teal-400/30' : 'border-slate-200'}`}>
                            {plan.highlight && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-teal-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Popular</span>}
                            <p className="text-sm font-bold text-slate-800">{plan.title}</p>
                            <p className="mt-1 text-2xl font-extrabold text-slate-900">₹{plan.price}</p>
                            <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-500">{plan.perk}</p>
                            <button
                                onClick={() => buy(plan)}
                                disabled={busy !== null}
                                className={`mt-4 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${plan.highlight ? 'bg-teal-500 text-white hover:bg-teal-400' : 'border border-slate-300 text-slate-800 hover:bg-slate-50'}`}
                            >
                                {busy === plan.code ? 'Starting…' : 'Choose'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
