import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import paymentService, { loadCashfree } from '../../services/payment.service';
import authService from '../../services/auth.service';
import { PlanGrid } from './planCards';

export default function PricingFeature() {
  const navigate = useNavigate();
  const authed = authService.isAuthenticated();
  const [busy, setBusy] = useState(null);
  const [entitlement, setEntitlement] = useState(null);

  const refreshEntitlement = () => {
    if (!authed) return;
    paymentService.getEntitlement().then(setEntitlement).catch(() => {});
  };

  useEffect(refreshEntitlement, [authed]);

  const buy = async (code) => {
    if (!authed) {
      toast('Sign in to upgrade');
      navigate('/login');
      return;
    }
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
        refreshEntitlement();
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
    <section className="w-full">

      <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
        <p className="text-sm font-semibold text-slate-700">One-time payment · valid for 1 year · no auto-renewal</p>
        {entitlement?.active && (
          <p className="text-xs text-teal-600">
            You're on the <span className="font-bold">{entitlement.unlimited ? 'Unlimited' : entitlement.plan}</span> plan
            {!entitlement.unlimited && typeof entitlement.creditsRemaining === 'number' && entitlement.creditsRemaining >= 0
              ? ` — ${entitlement.creditsRemaining} download${entitlement.creditsRemaining === 1 ? '' : 's'} left`
              : ''}
          </p>
        )}
      </div>

      <div className="w-full h-px bg-black/50" />

      <PlanGrid entitlement={entitlement} busy={busy} onBuy={buy} />

      <div className="w-full h-px bg-black/50" />

      <div className="py-8 text-center px-4">
        <p className="text-xs text-slate-400">
          Secure checkout via Cashfree. Free users can build and preview resumes — payment unlocks watermark-free downloads.
        </p>
      </div>
    </section>
  );
}
