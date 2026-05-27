'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Check, X, ChevronDown, Star, Sparkles, Users, Zap } from 'lucide-react';
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
    description: 'Everything you need to start studying smarter, forever free.',
    cta: 'Get started free',
    href: '/signup',
    highlight: false,
    accent: 'gray',
    badge: null,
    keyStat: '3 study groups',
    keyStatLabel: 'included',
    icon: Zap,
    features: [
      { text: 'Up to 3 study groups', included: true },
      { text: '20 members per group', included: true },
      { text: 'Pomodoro timer', included: true },
      { text: 'Basic analytics', included: true },
      { text: '10 AI messages / month', included: true },
      { text: '50 flashcards / month', included: true },
      { text: 'Campus study spots map', included: true },
      { text: 'Priority support', included: false },
      { text: 'Unlimited AI messages', included: false },
      { text: 'Advanced analytics', included: false },
    ],
  },
  {
    name: 'Pro',
    monthlyPrice: 9,
    yearlyPrice: 7,
    description: 'For students serious about their academic goals and performance.',
    cta: 'Start Pro trial',
    href: '/signup?plan=pro',
    highlight: true,
    accent: 'violet',
    badge: 'Most Popular',
    keyStat: 'Unlimited AI',
    keyStatLabel: '& study groups',
    icon: Sparkles,
    features: [
      { text: 'Unlimited study groups', included: true },
      { text: '50 members per group', included: true },
      { text: 'Pomodoro timer', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Unlimited AI messages', included: true },
      { text: 'Unlimited flashcards', included: true },
      { text: 'Campus study spots map', included: true },
      { text: 'Priority support', included: true },
      { text: 'Whiteboard snapshots (unlimited)', included: true },
      { text: 'Custom AI personas', included: false },
    ],
  },
  {
    name: 'Team',
    monthlyPrice: 19,
    yearlyPrice: 15,
    description: 'For study organizations and departments collaborating at scale.',
    cta: 'Start Team trial',
    href: '/signup?plan=team',
    highlight: false,
    accent: 'amber',
    badge: 'For Organizations',
    keyStat: '100 members',
    keyStatLabel: 'per group',
    icon: Users,
    features: [
      { text: 'Unlimited study groups', included: true },
      { text: '100 members per group', included: true },
      { text: 'Pomodoro timer', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Unlimited AI messages', included: true },
      { text: 'Unlimited flashcards', included: true },
      { text: 'Campus study spots map', included: true },
      { text: 'Priority support', included: true },
      { text: 'Whiteboard snapshots (unlimited)', included: true },
      { text: 'Custom AI personas', included: true },
    ],
  },
];

const comparisonSections = [
  {
    label: 'Core',
    rows: [
      { feature: 'Study Groups', free: '3', pro: 'Unlimited', team: 'Unlimited' },
      { feature: 'Members per group', free: '20', pro: '50', team: '100' },
      { feature: 'Whiteboard snapshots', free: '3', pro: 'Unlimited', team: 'Unlimited' },
      { feature: 'Resource library', free: true, pro: true, team: true },
    ],
  },
  {
    label: 'AI Tools',
    rows: [
      { feature: 'AI messages / month', free: '10', pro: 'Unlimited', team: 'Unlimited' },
      { feature: 'Flashcards / month', free: '50', pro: 'Unlimited', team: 'Unlimited' },
      { feature: 'AI quiz generator', free: true, pro: true, team: true },
      { feature: 'AI study planner', free: false, pro: true, team: true },
      { feature: 'Custom AI personas', free: false, pro: false, team: true },
    ],
  },
  {
    label: 'Productivity',
    rows: [
      { feature: 'Pomodoro timer', free: true, pro: true, team: true },
      { feature: 'Analytics dashboard', free: 'Basic', pro: 'Advanced', team: 'Advanced' },
      { feature: 'Grade tracker', free: true, pro: true, team: true },
      { feature: 'Study session scheduler', free: true, pro: true, team: true },
      { feature: 'Campus study map', free: true, pro: true, team: true },
    ],
  },
  {
    label: 'Community & Support',
    rows: [
      { feature: 'Campus communities', free: true, pro: true, team: true },
      { feature: 'Peer tutoring', free: true, pro: true, team: true },
      { feature: 'Priority support', free: false, pro: true, team: true },
      { feature: 'Team management dashboard', free: false, pro: false, team: true },
      { feature: 'Custom invite links', free: false, pro: true, team: true },
    ],
  },
];

const faqs = [
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. Upgrades take effect immediately; downgrades apply at the next billing cycle. No lock-in, no cancellation fees.',
  },
  {
    q: 'Is there a student discount?',
    a: 'All plans are already priced with students in mind. Reach out with your .edu email for an extra 20% off Pro.',
  },
  {
    q: 'What happens when I hit the free AI message limit?',
    a: "You'll keep access to all other features. Upgrade to Pro for unlimited AI messages anytime — no waiting until the next month.",
  },
  {
    q: 'What are the limits on study group members?',
    a: 'Free groups hold up to 20 members, Pro holds 50, and Team holds 100. Groups are soft-capped — admins can request increases.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. Cancel from Settings → Plan & Billing. Your Pro or Team features stay active until the end of the paid period.',
  },
  {
    q: 'How is payment information stored?',
    a: 'Payments are processed by Stripe. StudySynch never stores your card details on our servers.',
  },
];

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-4 h-4 text-brand mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-text-muted/40 mx-auto" />;
  return <span className="text-sm text-text-secondary">{value}</span>;
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs text-violet-400 mb-6"
          >
            <Sparkles className="w-3 h-3" />
            Plans built for students
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight mb-4"
          >
            Invest in your{' '}
            <span className="bg-gradient-to-r from-violet-400 to-brand bg-clip-text text-transparent">
              academic success
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-text-muted max-w-xl mx-auto mb-10">
            Start free. Upgrade when you're ready. Cancel any time — no surprises.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-1 bg-surface-card border border-surface-border rounded-full px-1.5 py-1.5"
          >
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                !annual
                  ? 'bg-surface-elevated text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                annual
                  ? 'bg-surface-elevated text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Annual
              <span className="text-xs text-brand font-bold bg-brand/10 px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Plan Cards */}
      <section className="pb-24 px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
        >
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isViolet = plan.accent === 'violet';
            const isAmber = plan.accent === 'amber';

            return (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`relative rounded-2xl border p-7 flex flex-col transition-all duration-300 ${
                  isViolet
                    ? 'border-violet-500/30 bg-surface-card ring-2 ring-violet-500/20 shadow-[0_0_60px_-12px_rgba(139,92,246,0.25)] scale-[1.02]'
                    : isAmber
                    ? 'border-amber-500/20 bg-surface-card'
                    : 'border-surface-border bg-surface-card'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                        isViolet
                          ? 'bg-violet-500 text-white'
                          : isAmber
                          ? 'bg-amber-500 text-white'
                          : 'bg-surface-elevated text-text-secondary'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isViolet
                          ? 'bg-violet-500/20'
                          : isAmber
                          ? 'bg-amber-500/20'
                          : 'bg-surface-elevated'
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isViolet
                            ? 'text-violet-400'
                            : isAmber
                            ? 'text-amber-400'
                            : 'text-text-muted'
                        }`}
                      />
                    </div>
                    <p
                      className={`text-sm font-bold uppercase tracking-widest ${
                        isViolet
                          ? 'text-violet-400'
                          : isAmber
                          ? 'text-amber-400'
                          : 'text-text-secondary'
                      }`}
                    >
                      {plan.name}
                    </p>
                  </div>

                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-bold text-text-primary">
                      ${annual ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-text-muted text-sm mb-1">/mo</span>
                    )}
                  </div>
                  {annual && plan.monthlyPrice > 0 && (
                    <p className="text-xs text-brand mb-2">
                      Billed ${plan.yearlyPrice * 12}/year — save ${(plan.monthlyPrice - plan.yearlyPrice) * 12}
                    </p>
                  )}
                  {plan.monthlyPrice === 0 && (
                    <p className="text-xs text-text-muted mb-2">Free forever</p>
                  )}

                  {/* Key stat */}
                  <div
                    className={`mt-3 mb-3 rounded-lg px-3 py-2.5 ${
                      isViolet
                        ? 'bg-violet-500/10 border border-violet-500/20'
                        : isAmber
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : 'bg-surface-elevated border border-surface-border'
                    }`}
                  >
                    <p
                      className={`text-lg font-bold ${
                        isViolet
                          ? 'text-violet-300'
                          : isAmber
                          ? 'text-amber-300'
                          : 'text-text-primary'
                      }`}
                    >
                      {plan.keyStat}
                    </p>
                    <p className="text-xs text-text-muted">{plan.keyStatLabel}</p>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5 text-sm">
                      {f.included ? (
                        <Check
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            isViolet
                              ? 'text-violet-400'
                              : isAmber
                              ? 'text-amber-400'
                              : 'text-brand'
                          }`}
                        />
                      ) : (
                        <X className="w-4 h-4 text-text-muted/30 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={f.included ? 'text-text-secondary' : 'text-text-muted/50'}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} className="block">
                  <Button
                    className={`w-full ${
                      isViolet
                        ? 'bg-violet-500 hover:bg-violet-400 text-white border-0'
                        : isAmber
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : ''
                    }`}
                    variant={isViolet ? 'primary' : 'secondary'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Social proof strip */}
      <section className="py-8 px-6 border-y border-surface-border bg-surface-card/30">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {['bg-violet-500', 'bg-brand', 'bg-amber-500', 'bg-cyan-500'].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-surface`} />
              ))}
            </div>
            <span className="text-sm text-text-muted">Trusted by <strong className="text-text-primary">2,000+</strong> students</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
            <span className="text-sm text-text-muted ml-1"><strong className="text-text-primary">4.9</strong> / 5 rating</span>
          </div>
          <p className="text-sm text-text-muted">"The best study tool I've used in university."</p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-text-primary text-center mb-2"
          >
            Compare all features
          </motion.h2>
          <p className="text-text-muted text-center text-sm mb-10">
            Every detail, side by side.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-surface-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left px-5 py-4 text-sm font-semibold text-text-muted w-1/2">
                    Feature
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-text-secondary">
                    Free
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-violet-400 bg-violet-500/5">
                    Pro
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-amber-400">
                    Team
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonSections.map((section) => (
                  <>
                    <tr key={`h-${section.label}`} className="bg-surface-elevated/50">
                      <td
                        colSpan={4}
                        className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-text-muted"
                      >
                        {section.label}
                      </td>
                    </tr>
                    {section.rows.map((row, ri) => (
                      <tr
                        key={row.feature}
                        className={`border-t border-surface-border/50 ${
                          ri % 2 === 0 ? 'bg-surface/20' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5 text-sm text-text-secondary">{row.feature}</td>
                        <td className="px-4 py-3.5 text-center">
                          <CellValue value={row.free} />
                        </td>
                        <td className="px-4 py-3.5 text-center bg-violet-500/5">
                          <CellValue value={row.pro} />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <CellValue value={row.team} />
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 border-t border-surface-border">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="max-w-2xl mx-auto"
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl font-bold text-text-primary text-center mb-2"
          >
            Frequently asked questions
          </motion.h2>
          <motion.p variants={fadeUp} className="text-text-muted text-center text-sm mb-10">
            Still have questions? Email us at hello@studysynch.org
          </motion.p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.q}
                variants={fadeUp}
                className="border border-surface-border rounded-xl bg-surface-card overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-text-primary text-sm">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-text-muted leading-relaxed border-t border-surface-border/50 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
          className="max-w-2xl mx-auto text-center rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/5 to-surface-card p-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs text-violet-400 mb-5">
            <Sparkles className="w-3 h-3" />
            Start free, no card required
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-3">
            Ready to study smarter?
          </h2>
          <p className="text-text-muted mb-8 max-w-md mx-auto">
            Join 2,000+ students already using StudySynch. Free forever — upgrade only when you need more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 bg-violet-500 hover:bg-violet-400 border-0 text-white">
                Get started free
              </Button>
            </Link>
            <Link href="/signup?plan=pro">
              <Button size="lg" variant="secondary" className="px-8">
                Try Pro free
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-text-primary">StudySynch</span>
          </div>
          <div className="flex gap-8 text-sm text-text-muted">
            <Link href="/login" className="hover:text-text-secondary transition-colors">Log in</Link>
            <Link href="/signup" className="hover:text-text-secondary transition-colors">Sign up</Link>
            <Link href="/pricing" className="hover:text-text-secondary transition-colors">Pricing</Link>
            <a href="/#features" className="hover:text-text-secondary transition-colors">Features</a>
          </div>
          <p className="text-xs text-text-muted">© 2025 StudySynch. Built for students.</p>
        </div>
      </footer>
    </div>
  );
}
