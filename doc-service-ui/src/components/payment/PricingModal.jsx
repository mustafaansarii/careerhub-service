import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import paymentService, { loadCashfree } from '../../services/payment.service';
import { PlanGrid } from '../pricing/planCards';

export default function PricingModal({ open, onClose, onSuccess, title = 'Upgrade to download' }) {
    const [busy, setBusy] = useState(null);
    const [entitlement, setEntitlement] = useState(null);

    useEffect(() => {
        if (!open) return;
        paymentService.getEntitlement().then(setEntitlement).catch(() => setEntitlement(null));
    }, [open]);

    if (!open) return null;

    const buy = async (code) => {
        setBusy(code);
        try {
            const order = await paymentService.createOrder(code);
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
        <div className="fixed inset-0 z-[100000] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4" onClick={onClose}>
            <div className="relative my-8 w-full max-w-5xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute right-4 top-4 z-20 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="px-6 pt-9 pb-5 text-center">
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    <p className="mt-1 text-sm text-slate-500">One-time payment · valid for 1 year · you can only upgrade to a higher plan.</p>
                </div>

                <div className="h-px w-full bg-black/50" />

                <PlanGrid entitlement={entitlement} busy={busy} onBuy={buy} />

                <div className="h-px w-full bg-black/50" />

                <p className="px-6 py-5 text-center text-xs text-slate-400">
                    Secure checkout via Cashfree. Payment unlocks watermark-free downloads.
                </p>
            </div>
        </div>
    );
}
