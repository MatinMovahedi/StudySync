'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { GradientText } from '../shared/GradientText';

export function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-50" />
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
          <Zap className="w-4 h-4 text-brand-light" />
          <span className="text-sm text-text-secondary">Free forever for students</span>
        </div>
        <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Ready to ace your <GradientText>next exam?</GradientText>
        </h2>
        <p className="text-xl text-text-secondary mb-10 max-w-xl mx-auto">
          Join 10,000+ students already using StudySync. Set up your profile and find your first study group in under 2 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="group px-8">
              Get started — it&apos;s free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="glass" size="lg" className="px-8">Already have an account?</Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
