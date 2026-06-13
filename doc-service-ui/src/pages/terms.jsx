import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';

function Section({ title, children }) {
    return (
        <section className="mt-7">
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">{children}</div>
        </section>
    );
}

export default function TermsPage() {
    return (
        <>
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}
            >
                <Navbar />
                <PageHero
                    breadcrumb="Legal"
                    title="Terms & Conditions"
                    description="The terms that govern your use of CareerHub."
                />
            </div>

            <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <p className="text-sm text-slate-400">Last updated on 13-06-2026</p>

                <p className="mt-6 text-sm leading-relaxed text-slate-700">
                    These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of CareerHub
                    (the &ldquo;Service&rdquo;), operated by CareerHub (&ldquo;we&rdquo;,
                    &ldquo;us&rdquo;, &ldquo;our&rdquo;). By creating an account or using the Service, you agree
                    to these Terms. If you do not agree, please do not use the Service.
                </p>

                <Section title="1. Eligibility & Accounts">
                    <p>
                        You must be at least 18 years old (or have the consent of a parent/guardian) to use the
                        Service. You are responsible for the activity under your account and for keeping your
                        login credentials confidential.
                    </p>
                </Section>

                <Section title="2. The Service">
                    <p>
                        CareerHub lets you build, edit and download resumes and related documents. You retain
                        ownership of the content you enter. We do not claim ownership of your resume data.
                    </p>
                </Section>

                <Section title="3. Plans & Payments">
                    <p>
                        Paid plans are <strong>one-time purchases</strong> (not subscriptions) and do not
                        auto-renew. A purchase grants a fixed number of resume downloads (or unlimited, depending
                        on the plan) and is valid for <strong>1 year</strong> from the date of purchase. Prices
                        are shown in INR on the Pricing page.
                    </p>
                    <p>
                        Payments are processed securely by our payment partner, Cashfree Payments. We do not store
                        your card or banking details.
                    </p>
                </Section>

                <Section title="4. Cancellations & Refunds">
                    <p>
                        Cancellations and refunds are governed by our Cancellation &amp; Refund Policy, available
                        on this website.
                    </p>
                </Section>

                <Section title="5. Acceptable Use">
                    <p>
                        You agree not to misuse the Service, including attempting to bypass payment or access
                        controls, uploading unlawful content, or disrupting the Service or other users.
                    </p>
                </Section>

                <Section title="6. Intellectual Property">
                    <p>
                        The Service, including its templates, design and software, is owned by us and protected by
                        applicable laws. You may use the outputs (your resumes) for your personal job-seeking
                        purposes.
                    </p>
                </Section>

                <Section title="7. Disclaimers & Limitation of Liability">
                    <p>
                        The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not
                        guarantee employment outcomes. To the maximum extent permitted by law, we are not liable
                        for any indirect or consequential damages arising from your use of the Service.
                    </p>
                </Section>

                <Section title="8. Termination">
                    <p>
                        We may suspend or terminate access if these Terms are violated. You may stop using the
                        Service and delete your account at any time.
                    </p>
                </Section>

                <Section title="9. Governing Law">
                    <p>These Terms are governed by the laws of India, and disputes are subject to the courts there.</p>
                </Section>

                <Section title="10. Changes & Contact">
                    <p>
                        We may update these Terms from time to time; continued use means you accept the updated
                        Terms. For any questions, reach us via the Contact Us page.
                    </p>
                </Section>
            </main>
        </>
    );
}
