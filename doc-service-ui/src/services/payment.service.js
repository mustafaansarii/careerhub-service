import axios from 'axios';

// Switch to 'production' once you're live with production Cashfree keys (must match CASHFREE_ENV on the backend).
export const CASHFREE_MODE = 'sandbox';

export const PLANS = [
    { code: 'BASIC', price: 99, title: 'Starter', perk: 'Download 1 resume', highlight: false, level: 1 },
    { code: 'STANDARD', price: 199, title: 'Pro', perk: 'Download up to 5 resumes', highlight: true, level: 2 },
    { code: 'UNLIMITED', price: 399, title: 'Unlimited', perk: 'Unlimited resumes & downloads', highlight: false, level: 3 },
];

export const PLAN_LEVEL = { BASIC: 1, STANDARD: 2, UNLIMITED: 3 };

export const PLAN_CREDITS = { BASIC: 1, STANDARD: 5, UNLIMITED: Infinity };

export function currentPlanLevel(entitlement) {
    return entitlement?.active ? (PLAN_LEVEL[entitlement.plan] || 0) : 0;
}

const api = axios.create({
    baseURL: '/careerhub/api/',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

class PaymentService {
    async getEntitlement() {
        const res = await api.get('me/entitlement');
        return res.data;
    }

    async createOrder(planId, customerPhone) {
        const res = await api.post('payments/create-order', { planId, customerPhone });
        return res.data; // { orderId, paymentSessionId, ... }
    }

    async verify(orderId) {
        const res = await api.post('payments/verify', { orderId });
        return res.data; // { orderStatus, ... }
    }

    /** Unlocks (spends a credit) and returns the clean PDF blob; throws 402 if no credit/expired. */
    async unlockDoc(id) {
        const res = await api.post(`user-docs/${id}/unlock`, {}, { responseType: 'blob' });
        return res.data;
    }
}

export default new PaymentService();

/** Loads the Cashfree v3 SDK once and returns a checkout instance. */
let sdkPromise = null;
export function loadCashfree() {
    if (window.Cashfree) return Promise.resolve(window.Cashfree({ mode: CASHFREE_MODE }));
    if (!sdkPromise) {
        sdkPromise = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
            s.onload = resolve;
            s.onerror = () => reject(new Error('Failed to load Cashfree'));
            document.head.appendChild(s);
        });
    }
    return sdkPromise.then(() => window.Cashfree({ mode: CASHFREE_MODE }));
}
