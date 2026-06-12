import { useState } from 'react';
import { Link } from 'react-router-dom';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 399,
    period: 'month',
    tagline: 'Perfect for beginners ready to kickstart their career journey.',
    badge: 'Value for money',
    cta: 'Get Started',
    ctaTo: '/signup',
    features: [
      'Resume Builder (3 templates)',
      'ATS Score Checker',
      'DSA Sheet Access',
      '10 Mock Interview Credits',
      'Community Forum Access',
      'Email Support',
    ],
    excluded: [
      'Peer Mock Interviews',
      'AI Career Roadmap',
      'Priority Support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    period: 'month',
    tagline: 'For serious learners who want structured, guided growth.',
    badge: 'Most Popular',
    cta: 'Start Pro',
    ctaTo: '/signup?plan=pro',
    features: [
      'Resume Builder (All templates)',
      'ATS Score Checker + Suggestions',
      'DSA Sheet + Video Explanations',
      '30 Mock Interview Credits',
      'Peer Mock Interviews',
      'AI Career Roadmap',
      'Curated Learning Paths',
      'Priority Email Support',
    ],
    excluded: ['Dedicated Mentor Sessions'],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 999,
    period: 'month',
    tagline: 'End-to-end career acceleration with 1-on-1 expert guidance.',
    badge: 'Best Value',
    cta: 'Go Elite',
    ctaTo: '/signup?plan=elite',
    features: [
      'Everything in Pro',
      'Unlimited Mock Interview Credits',
      '3× Dedicated Mentor Sessions / mo',
      'Resume Review by Industry Expert',
      'LinkedIn Profile Audit',
      'Referral Network Access',
      'Job Placement Assistance',
      'Whatsapp + Priority Support',
    ],
    excluded: [],
  },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 shrink-0 text-teal-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 opacity-25">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PricingCard({ plan, isPopular }) {
  return (
    <div className="relative flex flex-col h-full">

      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/50 dark:border-white/50 bg-white dark:bg-black px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
            {plan.badge}
          </span>
        </div>
      )}

      <div className="px-7 pt-10 pb-6">
        <p className={`text-[11px] font-bold uppercase tracking-widest ${isPopular ? 'text-teal-500' : 'text-slate-400 dark:text-slate-500'}`}>
          {plan.name}
        </p>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 mb-2">₹</span>
          <span className={`text-6xl font-black tracking-tighter leading-none ${isPopular ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>
            {plan.price}
          </span>
          <span className="text-sm text-slate-400 dark:text-slate-500 mb-2">/{plan.period}</span>
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {plan.tagline}
        </p>
      </div>

      <ul className="flex-1 px-7 py-6 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
            <CheckIcon />
            <span>{f}</span>
          </li>
        ))}
        {plan.excluded.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-slate-400 dark:text-slate-600 line-through">
            <CrossIcon />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="px-7 py-6">
        <Link
          to={plan.ctaTo}
          className={[
            'flex w-full items-center justify-center gap-2 border px-4 py-3 text-sm font-semibold transition-all duration-200',
            isPopular
              ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black hover:opacity-80'
              : 'border-black/30 dark:border-white/30 text-slate-800 dark:text-white hover:border-black dark:hover:border-white',
          ].join(' ')}
        >
          {plan.cta}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M3 12h18" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function PricingFeature() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <section className="w-full">

      <div className="flex items-center justify-center gap-3 py-10 px-4">
        {['monthly', 'yearly'].map((cycle) => (
          <button
            key={cycle}
            onClick={() => setBillingCycle(cycle)}
            className={[
              'rounded-full border px-5 py-1.5 text-xs font-semibold capitalize transition-all',
              billingCycle === cycle
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-black/20 dark:border-white/20 text-slate-400 hover:border-black/50 dark:hover:border-white/50',
            ].join(' ')}
          >
            {cycle}
            {cycle === 'yearly' && <span className="ml-1.5 text-teal-500">–20%</span>}
          </button>
        ))}
      </div>

      <div className="w-full h-px bg-black/50 dark:bg-white/50" />

      <div className="relative mx-auto max-w-5xl">

        <div className="pointer-events-none absolute left-0   top-0 bottom-0 w-px bg-black/50 dark:bg-white/50 hidden md:block" />
        <div className="pointer-events-none absolute left-1/3 top-0 bottom-0 w-px bg-black/50 dark:bg-white/50 hidden md:block" />
        <div className="pointer-events-none absolute left-2/3 top-0 bottom-0 w-px bg-black/50 dark:bg-white/50 hidden md:block" />
        <div className="pointer-events-none absolute right-0  top-0 bottom-0 w-px bg-black/50 dark:bg-white/50 hidden md:block" />

        <div className="grid grid-cols-1 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={billingCycle === 'yearly'
                ? { ...plan, price: Math.round(plan.price * 0.8) }
                : plan}
              isPopular={plan.badge === 'Most Popular'}
            />
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-black/50 dark:bg-white/50" />

      <div className="py-8 text-center px-4">
        <p className="text-xs text-slate-400 dark:text-slate-600">
          All plans include a{' '}
          <span className="font-semibold text-slate-600 dark:text-slate-400">7-day free trial</span>
          . No credit card required.
        </p>
      </div>
    </section>
  );
}