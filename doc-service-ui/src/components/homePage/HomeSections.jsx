import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MotionDiv = motion.div;

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};
const viewport = { once: true, amount: 0.2 };

const TRUST_LOGOS = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Stripe'];

const STATS = [
    { value: '500K+', label: 'documents created', tint: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300' },
    { value: '40+', label: 'professional templates', tint: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' },
    { value: '6 years', label: 'helping job seekers', tint: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
    { value: '98%', label: 'pass ATS checks', tint: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
];

const FEATURES = [
    { title: 'AI-assisted writing', desc: 'Turn rough notes into polished, recruiter-ready bullet points in seconds.', path: 'M9.5 3a1 1 0 011 1 4 4 0 004 4 1 1 0 010 2 4 4 0 00-4 4 1 1 0 01-2 0 4 4 0 00-4-4 1 1 0 010-2 4 4 0 004-4 1 1 0 011-1z' },
    { title: 'ATS-friendly', desc: 'Clean, parsable layouts that sail through applicant tracking systems.', path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Live PDF preview', desc: 'Edit on the left, watch your compiled PDF update live on the right.', path: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.5 12C3.7 7.9 7.5 5 12 5s8.3 2.9 9.5 7c-1.2 4.1-5 7-9.5 7s-8.3-2.9-9.5-7z' },
    { title: 'Designer templates', desc: 'Dozens of professionally crafted templates for every document type.', path: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v4H4V5zm0 6h7v9H5a1 1 0 01-1-1v-8zm9 0h7v8a1 1 0 01-1 1h-6v-9z' },
];

const ATS_PILLS = [
    { title: 'Readable contact information', path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { title: 'Full experience parsing', path: 'M9 17v-6h13M9 7h13M5 7h.01M5 12h.01M5 17h.01' },
    { title: 'Optimized skills section', path: 'M13 10V3L4 14h7v7l9-11h-7z' },
];

const STEPS = [
    { n: '01', title: 'Pick a template', desc: 'Choose from polished, ATS-ready designs for resumes, cover letters and more.' },
    { n: '02', title: 'Make it yours', desc: 'Edit content in the live editor — the PDF preview updates as you type.' },
    { n: '03', title: 'Download & apply', desc: 'Export a pixel-perfect PDF and save it to your account for later edits.' },
];

const TEMPLATES = [
    { src: 'https://i.ibb.co/v4dWrK1j/Vishnu-Singh.jpg', name: 'Modern Tech', tag: 'Resume', to: '/templates?type=CV_AND_RESUME' },
    { src: 'http://raw.githubusercontent.com/jakegut/resume/refs/heads/master/resume.png', name: 'Classic Professional', tag: 'Resume', to: '/templates?type=CV_AND_RESUME' },
    { src: 'https://i.ibb.co/7HgSdbL/William-Lucas.jpg', name: 'Engineering Pro', tag: 'Resume', to: '/templates?type=CV_AND_RESUME' },
    { src: 'https://cdn.enhancv.com/images/1098/i/aHR0cHM6Ly9jZG4uZW5oYW5jdi5jb20vcHJlZGVmaW5lZC1leGFtcGxlcy9vU0ZjUElJdk1rVUhzT2xQQ0gwU3NLRUF0aVprd0N6Q2xPTFRFUFJmL2ltYWdlLnBuZw~~.png', name: 'Enhancv Style', tag: 'Resume', to: '/templates?type=CV_AND_RESUME' },
];

const REVIEWS = [
    { name: 'Khushboo S.', when: '22 hours ago', stars: 5, text: 'The best CV building tool — tailored output for every job description, and the look and feel is truly dynamic.' },
    { name: 'Virgil', when: '1 day ago', stars: 5, text: 'Very easy to draft a CV with lots of templates to choose from.' },
    { name: 'Collins', when: '2 days ago', stars: 5, text: 'It aids in generating a good, outstanding, comprehensive resume.' },
    { name: 'Aisha K.', when: '3 days ago', stars: 5, text: 'Rebuilt my resume in 20 minutes and started getting callbacks the same week.' },
    { name: 'Roseline', when: '4 days ago', stars: 5, text: 'Nicely surprised by the professional level of the templates.' },
    { name: 'Daniel R.', when: '5 days ago', stars: 4, text: 'Finally a builder that does not fight me on formatting. Genuinely professional.' },
];

const FAQS = [
    { q: 'Is NextCV free to use?', a: 'Yes. You can build a resume, fill in your details, and download a PDF for free — no payment required to get a finished, recruiter-ready document.' },
    { q: 'Do I need an account to build a resume?', a: 'No. You can open the resume builder and download a PDF without signing in. Creating an account simply lets us save your details and reuse them next time.' },
    { q: 'What is the difference between the form editor and the LaTeX editor?', a: 'The form editor is the default — you fill in structured fields and see a live preview, no coding needed. The LaTeX editor is for advanced users who want to tweak the raw LaTeX of the same template. Use the ⋯ menu on any template to switch.' },
    { q: 'Are NextCV resumes ATS-friendly?', a: 'Yes. Every template uses clean, single-column-friendly layouts with standard section headings and readable fonts, so applicant tracking systems can parse your name, experience, and skills without dropping content.' },
    { q: 'How do I download my resume as a PDF?', a: 'Click “Download PDF” in the builder. It produces a crisp, multi-page US-Letter PDF with proper margins — page breaks fall between sections so nothing gets cut in half.' },
    { q: 'Can I edit my resume after I have started?', a: 'Of course. Edit any field inline, drag headings to reorder sections, add or remove sections, and re-download anytime. If you are signed in, your edits are saved back to your account on download.' },
    { q: 'Will my saved details pre-fill the builder?', a: 'Yes. Once you add your details under Profile → Resume details, every template you open is automatically pre-filled with your information. If you have not added anything yet, the form shows example content you can replace.' },
    { q: 'Can I switch templates without re-typing everything?', a: 'Yes. Your information lives in one place and flows into whichever template you pick, so changing the design never means re-entering your experience, education, or skills.' },
    { q: 'How do I sign in or create an account?', a: 'Use your email and password, or continue with Google or GitHub. If you sign in with a social account for the first time, an account is created for you automatically.' },
    { q: 'Can I add sections like Projects, Certifications, or Awards?', a: 'Yes. Use “Add section” at the bottom of the builder to add Projects, Certifications, Achievements, Awards, Languages, Volunteering, Publications, and more — then reorder them by dragging the headings.' }
];

function FaqItem({ item, isOpen, onToggle }) {
    return (
        <div className="rounded-2xl border border-black/10 bg-white transition hover:border-teal-300 dark:border-white/10 dark:bg-white/5">
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
            >
                <span className="text-sm font-semibold sm:text-base">{item.q}</span>
                <svg
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className={`h-5 w-5 shrink-0 text-teal-600 transition-transform duration-300 dark:text-teal-400 ${isOpen ? 'rotate-180' : ''}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`grid overflow-hidden px-5 transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{item.a}</p>
                </div>
            </div>
        </div>
    );
}

function FaqSection() {
    const [open, setOpen] = useState(0);
    return (
        <section className="border-t border-black/10 dark:border-white/10">
            <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
                <MotionDiv variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport} className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
                    <p className="mt-4 text-base text-slate-500 dark:text-slate-400">Everything you need to know about building documents with NextCV.</p>
                </MotionDiv>
                <div className="mt-12 space-y-3">
                    {FAQS.map((item, i) => (
                        <FaqItem key={item.q} item={item} isOpen={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeatureIcon({ path }) {
    return (
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d={path} />
            </svg>
        </div>
    );
}

function Stars({ count = 5 }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`flex h-5 w-5 items-center justify-center rounded ${i < count ? 'bg-teal-500' : 'bg-slate-200 dark:bg-white/10'}`}>
                    <svg viewBox="0 0 20 20" fill="white" className="h-3 w-3">
                        <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.77l-5.2 2.75.99-5.8L1.58 7.62l5.82-.85L10 1.5z" />
                    </svg>
                </span>
            ))}
        </div>
    );
}

export default function HomeSections() {
    return (
        <div className="text-slate-900">
            {/* Trust bar */}
            <section className="border-b border-black/10 dark:border-white/10">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Trusted by job seekers hired at
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                        {TRUST_LOGOS.map((logo) => (
                            <span key={logo} className="text-lg font-bold tracking-tight text-slate-400/80 dark:text-slate-500">{logo}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Chosen by — staggered stat cards + intro copy */}
            <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div className="grid grid-cols-2 gap-5">
                        {STATS.map((s, i) => (
                            <MotionDiv
                                key={s.label}
                                custom={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="show"
                                viewport={viewport}
                                className={`rounded-3xl p-7 ${s.tint} ${i % 2 === 1 ? 'mt-8' : ''}`}
                            >
                                <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">{s.value}</p>
                                <p className="mt-2 text-sm font-medium opacity-80">{s.label}</p>
                            </MotionDiv>
                        ))}
                    </div>

                    <MotionDiv variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}>
                        <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                            Chosen by <span className="text-teal-600 dark:text-teal-400">thousands</span> of job applicants worldwide
                        </h2>
                        <p className="mt-5 text-base leading-relaxed text-slate-500 dark:text-slate-400">
                            NextCV is a document builder that helps you create applications with impact and professionalism — trusted at every step of the job hunt to emphasize your experience, value, and skills.
                        </p>
                        <p className="mt-4 text-base leading-relaxed text-slate-500 dark:text-slate-400">
                            We pair flexible, ATS-friendly templates with an intuitive editor and a live PDF preview, so you can present a complete, polished application in minutes.
                        </p>
                        <Link to="/templates" className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400">
                            Explore templates
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M3 12h18" /></svg>
                        </Link>
                    </MotionDiv>
                </div>
            </section>

            {/* Features */}
            <section className="border-y border-black/10 dark:border-white/10">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to get hired</h2>
                        <p className="mt-4 text-base text-slate-500 dark:text-slate-400">The builder handles design and formatting, so you can focus on the words that land the job.</p>
                    </div>
                    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map((f, i) => (
                            <MotionDiv key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
                                className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5">
                                <FeatureIcon path={f.path} />
                                <h3 className="text-base font-semibold">{f.title}</h3>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
                            </MotionDiv>
                        ))}
                    </div>
                </div>
            </section>

            {/* ATS gradient panel with floating pills */}
            <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-indigo-900 to-teal-800 px-6 py-14 sm:px-12 lg:py-20">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
                    <div className="relative grid items-center gap-12 lg:grid-cols-2">
                        <MotionDiv variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}>
                            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                                Resumes optimized for Applicant Tracking Systems
                            </h2>
                            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300">
                                Every template is tested against top ATS software for full compatibility — clean layouts, readable fonts, and standard section titles, so nothing gets lost.
                            </p>
                            <Link to="/templates?type=CV_AND_RESUME" className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-teal-400">
                                Build an ATS-friendly resume
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M3 12h18" /></svg>
                            </Link>
                        </MotionDiv>

                        <div className="space-y-4">
                            {ATS_PILLS.map((p, i) => (
                                <MotionDiv key={p.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
                                    className={`flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm ${i === 1 ? 'lg:ml-12' : i === 2 ? 'lg:ml-6' : ''}`}>
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d={p.path} /></svg>
                                    </span>
                                    <span className="text-sm font-semibold text-white">{p.title}</span>
                                </MotionDiv>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From blank page to PDF in 3 steps</h2>
                </div>
                <div className="mt-14 grid gap-8 md:grid-cols-3">
                    {STEPS.map((s, i) => (
                        <MotionDiv key={s.n} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}>
                            <span className="text-5xl font-extrabold text-teal-500/25 dark:text-teal-400/25">{s.n}</span>
                            <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
                        </MotionDiv>
                    ))}
                </div>
            </section>

            {/* Templates showcase */}
            <section className="relative overflow-hidden mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                <div className="pointer-events-none absolute left-1/2 top-32 -z-10 h-72 w-[60%] -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl" />
                <div className="flex flex-col items-end justify-between gap-6 sm:flex-row">
                    <div className="max-w-xl">
                        <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                            Templates
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Templates that recruiters love</h2>
                        <p className="mt-4 text-base text-slate-500 dark:text-slate-400">Field-tested, ATS-safe, and fully editable. Pick one and make it yours.</p>
                    </div>
                    <Link to="/templates" className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-teal-500/40 px-5 py-2.5 text-sm font-semibold text-teal-600 transition hover:bg-teal-500 hover:text-white dark:text-teal-400">
                        Browse all templates
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 transition-transform group-hover:translate-x-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M3 12h18" /></svg>
                    </Link>
                </div>

                <div className="mx-auto mt-14 grid max-w-8xl grid-cols-2 gap-6 sm:grid-cols-4">
                    {TEMPLATES.map((t, i) => (
                        <MotionDiv key={t.name} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}>
                            <div className="overflow-hidden bg-white shadow-md ring-1 ring-black/5" style={{ aspectRatio: '3/4' }}>
                                <img
                                    src={t.src}
                                    alt=""
                                    className="h-full w-full object-cover object-top"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x800?text=Template'; }}
                                />
                            </div>
                        </MotionDiv>
                    ))}
                </div>
            </section>

            {/* Testimonials on a vivid multi-color gradient-blob background */}
            <section className="relative overflow-hidden border-y border-black/10 dark:border-white/10">
                {/* Big organic colour blob */}
                <div
                    className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-[45%] blur-[90px] opacity-70 dark:opacity-40"
                    style={{ background: 'conic-gradient(from 140deg at 50% 50%, #fcd34d, #fb7185, #e879f9, #a78bfa, #818cf8, #38bdf8, #5eead4, #fcd34d)' }}
                />
                {/* Accent corners for depth */}
                <div className="pointer-events-none absolute -left-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl dark:bg-sky-500/20" />
                <div className="pointer-events-none absolute -right-20 top-10 -z-10 h-72 w-72 rounded-full bg-rose-300/40 blur-3xl dark:bg-rose-500/20" />
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                    <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.4fr]">
                        <div className="lg:sticky lg:top-24">
                            <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Trusted by executives &amp; senior professionals</h2>
                            <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-white/80 px-5 py-4 shadow-sm backdrop-blur dark:bg-white/10">
                                <Stars count={5} />
                                <div>
                                    <p className="text-lg font-bold">4.8 / 5</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">5,270+ happy customers</p>
                                </div>
                            </div>
                        </div>

                        <div className="columns-1 gap-5 sm:columns-2 [&>*]:mb-5">
                            {REVIEWS.map((r, i) => (
                                <MotionDiv key={r.name} custom={i % 3} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
                                    className="break-inside-avoid rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                                    <Stars count={r.stars} />
                                    <p className="mt-2 text-xs text-slate-400">{r.when}</p>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{r.text}</p>
                                    <p className="mt-4 text-sm font-semibold">— {r.name}</p>
                                </MotionDiv>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <FaqSection />
        </div>
    );
}
