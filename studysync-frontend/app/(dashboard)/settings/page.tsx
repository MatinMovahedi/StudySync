'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, User, Palette, LogOut, Trash2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { GlassCard } from '../../../components/shared/GlassCard';
import { GradientText } from '../../../components/shared/GradientText';
import { Button } from '../../../components/ui/button';
import { useAuthStore } from '../../../lib/store/authStore';
import { logout } from '../../../lib/api/auth';
import { staggerContainer, staggerItem } from '../../../lib/utils/animations';

const SECTIONS = [
  {
    title: 'Account', icon: User, items: [
      { label: 'Email address', sub: 'Change your login email', action: 'Change' },
      { label: 'Password', sub: 'Update your password', action: 'Update' },
    ]
  },
  {
    title: 'Notifications', icon: Bell, items: [
      { label: 'New messages', sub: 'Get notified when someone messages in your groups', toggle: true, default: true },
      { label: 'Session reminders', sub: 'Remind me 30 minutes before sessions', toggle: true, default: true },
      { label: 'Group invites', sub: 'When someone invites me to a group', toggle: true, default: true },
      { label: 'Streak alerts', sub: 'Remind me to study to keep my streak', toggle: true, default: false },
    ]
  },
  {
    title: 'Appearance', icon: Palette, items: [
      { label: 'Theme', sub: 'Dark mode (default)', action: 'Dark' },
    ]
  },
  {
    title: 'Privacy', icon: Shield, items: [
      { label: 'Profile visibility', sub: 'Who can see your profile', action: 'Public' },
      { label: 'Study stats', sub: 'Share your study stats', toggle: true, default: true },
    ]
  },
];

export default function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const { logout: logoutStore } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    logoutStore();
    router.push('/login');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem} className="mb-8">
          <h1 className="text-3xl font-bold"><GradientText>Settings</GradientText></h1>
          <p className="text-text-secondary text-sm mt-1">Manage your account and preferences</p>
        </motion.div>

        <div className="space-y-6">
          {SECTIONS.map((section, si) => (
            <motion.div key={si} variants={staggerItem}>
              <div className="flex items-center gap-2 mb-3">
                <section.icon className="w-4 h-4 text-text-muted" />
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">{section.title}</h2>
              </div>
              <GlassCard hover={false} className="p-0 overflow-hidden">
                {section.items.map((item, ii) => (
                  <div key={ii} className={`flex items-center justify-between px-5 py-4 ${ii < section.items.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/[0.02] transition-colors`}>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{item.label}</div>
                      <div className="text-xs text-text-muted mt-0.5">{item.sub}</div>
                    </div>
                    {'toggle' in item ? (
                      <button
                        onClick={() => setToggles(t => ({...t, [item.label]: !(t[item.label] ?? item.default)}))}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${(toggles[item.label] ?? item.default) ? 'bg-brand' : 'bg-surface-elevated'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${(toggles[item.label] ?? item.default) ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    ) : (
                      <button className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors">
                        {'action' in item && item.action}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </GlassCard>
            </motion.div>
          ))}

          {/* Danger zone */}
          <motion.div variants={staggerItem}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-accent-rose uppercase tracking-wider">Danger zone</h2>
            </div>
            <GlassCard hover={false} className="border-accent-rose/20">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="ghost" onClick={handleLogout} className="flex-1 gap-2 text-text-secondary hover:text-text-primary justify-center">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
                <Button variant="danger" className="flex-1 gap-2 justify-center" onClick={() => toast.error('Account deletion requires email confirmation')}>
                  <Trash2 className="w-4 h-4" />
                  Delete account
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
