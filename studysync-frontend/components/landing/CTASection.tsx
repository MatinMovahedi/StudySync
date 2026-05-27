'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';

export function CTASection() {
  return (
    <section className="py-24 bg-surface-card border-t border-surface-border">
      <motion.div
        className="max-w-3xl mx-auto px-6 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 border border-surface-border rounded-md px-3 py-1.5 mb-8">
          <div className="w-5 h-5 overflow-hidden rounded flex-shrink-0">
            <Image src="/logo-icon.png" alt="StudySynch" width={20} height={20} className="w-full h-full object-cover object-top" />
          </div>
          <span className="text-sm text-text-secondary">Free forever for students</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-5 leading-tight tracking-tight">
          Ready to ace your next exam?
        </h2>
        <p className="text-lg text-text-secondary mb-9 max-w-lg mx-auto">
          Join 10,000+ students already using StudySynch. Set up your profile and find your first study group in under 2 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup">
            <Button size="lg">Get started — it&apos;s free</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">Already have an account?</Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
