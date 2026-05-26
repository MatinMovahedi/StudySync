import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { StatsSection } from '../components/landing/StatsSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { CTASection } from '../components/landing/CTASection';
import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />

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
            <a href="#features" className="hover:text-text-secondary transition-colors">Features</a>
          </div>
          <p className="text-xs text-text-muted">© 2024 StudySync. Built for students.</p>
        </div>
      </footer>
    </div>
  );
}
