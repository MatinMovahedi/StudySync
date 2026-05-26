'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Menu, X, Zap } from 'lucide-react';

const navLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#testimonials', label: 'Reviews' },
  { href: '/pricing', label: 'Pricing' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-surface/80 backdrop-blur-md border-b border-surface-border' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary">StudySynch</span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map(link => (
            <a key={link.href} href={link.href}
               className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="shadow-[0_0_14px_-3px_rgba(16,185,129,0.45)] hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.6)] transition-shadow">
              Get started
            </Button>
          </Link>
        </div>

        <button type="button" className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-card border-t border-surface-border px-6 py-4 flex flex-col gap-4"
          >
            {navLinks.map(link => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                 className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-surface-border">
              <Link href="/login"><Button variant="ghost" size="sm" className="w-full">Log in</Button></Link>
              <Link href="/signup"><Button size="sm" className="w-full">Get started</Button></Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
