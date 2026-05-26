'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Zap, X } from 'lucide-react';
import { Navbar } from '../../components/landing/Navbar';
import { Button } from '../../components/ui/button';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const plans = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Everything you need to get started studying smarter.',
    cta: 'Get started free',
    href: '/signup',
    highlight: false,
    features: [
      { text: 'Up to 3 study groups', included: true },
      { text: 'Pomodoro timer', included: true },
      { text: 'Basic analytics', included: true },
      { text: '10 AI messages / month', included: true },
      { text: 'Campus study spots', included: true },
      { text: 'Unlimited flashcards', included: false },
      { text: 'Priority support', included: false },
      { text: 'Custom AI personas', included: false },
    ],
  },
  {
    name: 'Pro',
    monthlyPrice: 9,
    yearlyPrice: 7,
    description: 'For students who are serious about their academic goals.',
    cta: 'Start Pro trial',
    href: '/signup?plan=pro',
    highlight: true,
    badge: 'Most popular',
    features: [
      { text: 'Unlimited study groups', included: true },
      { text: 'Pomodoro timer', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Unlimited AI messages', included: true },
      { text: 'Campus study spots', included: true },
      { text: 'Unlimited flashcards', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom AI personas', included: false },
    ],
  },
  {
    name: 'Team',
    monthlyPrice: 19,
    yearlyPrice: 15,
    description: 'For study groups and student organizations collaborating at scale.',
    cta: 'Start Team trial',
    href: '/signup?plan=team',
    highlight: false,
    features: [
      { text: 'Unlimited study groups', included: true },
      { text: 'Pomodoro timer', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Unlimited AI messages', included: true },
      { text: 'Campus study spots', included: true },
      { text: 'Unlimited flashcards', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom AI personas', included: true },
    ],
  },
];

const faqs = [
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. Upgrades take effect immediately; downgrades apply at the next billing cycle. No lock-in.',
  },
  {
    q: 'Is there a student discount?',
    a: 'All plans are already priced with students in mind. Reach out with your .edu email for an extra 20% off Pro.',
  },
  {
    q: 'What happens when my free AI messages run out?',
    a: 'You can still use all other features. Upgrade to Pro for unlimited AI access anytime.',
  },
  {
    q: 'Do I need a credit card to sign up free?',
    a: 'No credit card required for the Free plan. You only enter payment details when upgrading.',
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/20 bg-brand/5 text-xs text-brand mb-6">
            <Zap className="w-3 h-3" />
            Simple, transparent pricing
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight mb-4">
            Invest in your{' '}
            <span className="text-brand">academic success</span>
          </motion.h1>

          <motion.p variants={fadeUp}
            className="text-lg text-text-muted max-w-xl mx-auto mb-10">
            Start free. Upgrade when you're ready. Cancel any time.
          </motion.p>

          {/* Billing toggle */}
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-3 bg-surface-card border border-surface-border rounded-full px-2 py-1.5">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                !annual
                  ? 'bg-surface-elevated text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                annual
                  ? 'bg-surface-elevated text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Annual
              <span className="text-xs text-brand font-semibold">–20%</span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Plans */}
      <section className="pb-20 px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className={`relative rounded-2xl border p-7 flex flex-col ${
                plan.highlight
                  ? 'border-brand/40 bg-surface-card shadow-[0_0_40px_-8px_rgba(16,185,129,0.15)]'
                  : 'border-surface-border bg-surface-card'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-brand text-white text-xs font-semibold tracking-wide">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-bold text-text-primary">
                    ${annual ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-text-muted text-sm mb-1">/mo</span>
                  )}
                </div>
                {annual && plan.monthlyPrice > 0 && (
                  <p className="text-xs text-brand">
                    Billed ${plan.yearlyPrice * 12}/year
                  </p>
                )}
                <p className="text-sm text-text-muted mt-3">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm">
                    {f.included ? (
                      <Check className="w-4 h-4 text-brand flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-text-muted/40 flex-shrink-0" />
                    )}
                    <span className={f.included ? 'text-text-secondary' : 'text-text-muted/50'}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href} className="block">
                <Button
                  className={`w-full ${plan.highlight ? '' : 'variant-ghost'}`}
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 border-t border-white/5">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="max-w-2xl mx-auto"
        >
          <motion.h2 variants={fadeUp}
            className="text-2xl font-bold text-text-primary text-center mb-12">
            Frequently asked questions
          </motion.h2>

          <div className="space-y-6">
            {faqs.map((faq) => (
              <motion.div key={faq.q} variants={fadeUp}
                className="border border-surface-border rounded-xl p-6 bg-surface-card">
                <p className="font-semibold text-text-primary mb-2">{faq.q}</p>
                <p className="text-sm text-text-muted leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto text-center"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-3">
            Ready to study smarter?
          </h2>
          <p className="text-text-muted mb-8">
            Join thousands of students already using StudySync. Free forever, no card required.
          </p>
          <Link href="/signup">
            <Button size="lg" className="px-10">Get started free</Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-text-primary">StudySync</span>
          </div>
          <div className="flex gap-8 text-sm text-text-muted">
            <Link href="/login" className="hover:text-text-secondary transition-colors">Log in</Link>
            <Link href="/signup" className="hover:text-text-secondary transition-colors">Sign up</Link>
            <Link href="/pricing" className="hover:text-text-secondary transition-colors">Pricing</Link>
            <a href="/#features" className="hover:text-text-secondary transition-colors">Features</a>
          </div>
          <p className="text-xs text-text-muted">© 2024 StudySync. Built for students.</p>
        </div>
      </footer>
    </div>
  );
}
