import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';

function Clause({ children }) {
    return (
        <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
            <span>{children}</span>
        </li>
    );
}

export default function RefundPolicyPage() {
    return (
        <>
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}
            >
                <Navbar />
                <PageHero
                    breadcrumb="Legal"
                    title="Cancellation & Refund Policy"
                    description="How cancellations and refunds work for purchases on CareerHub."
                />
            </div>

            <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <p className="text-sm text-slate-400">Last updated on 13 June 2026</p>

                <p className="mt-6 text-sm leading-relaxed text-slate-700">
                    CareerHub provides a digital resume- and document-building service. Plans are one-time
                    purchases that unlock resume downloads and are valid for one year. Because the service is
                    digital and delivered instantly, the following cancellation and refund terms apply:
                </p>

                <ul className="mt-5 space-y-4 text-sm leading-relaxed text-slate-700">
                    <Clause>
                        <strong>Cancellations.</strong> A plan can be cancelled before any download credit has
                        been used. Once you have used a credit to unlock or download a resume, that purchase is
                        considered fulfilled and is non-refundable.
                    </Clause>
                    <Clause>
                        <strong>Payment charged but plan not activated.</strong> If your payment succeeded but
                        your plan or credits were not applied to your account, contact us and we will restore your
                        access or issue a full refund.
                    </Clause>
                    <Clause>
                        <strong>Duplicate or accidental charges.</strong> If you were charged more than once for
                        the same purchase, the extra charge will be refunded in full after verification.
                    </Clause>
                    <Clause>
                        <strong>Processing time.</strong> Approved refunds are returned to your original payment
                        method within 5–7 business days, depending on your bank or payment provider.
                    </Clause>
                    <Clause>
                        <strong>How to request.</strong> For any billing issue or refund request, reach us through
                        the <a href="/contact-us" className="font-semibold text-teal-600 hover:underline">Contact Us</a> page.
                        We aim to respond within 2 business days.
                    </Clause>
                </ul>
            </main>
        </>
    );
}
