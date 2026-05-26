'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Shield, User, Palette, LogOut, Trash2, ChevronRight, Eye, EyeOff, Mail, QrCode, CheckCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { GlassCard } from '../../../components/shared/GlassCard';
import { Button } from '../../../components/ui/button';
import { useAuthStore } from '../../../lib/store/authStore';
import { logout, changePassword, setup2FA, enable2FA, disable2FA } from '../../../lib/api/auth';
import { staggerContainer, staggerItem, popIn } from '../../../lib/utils/animations';
import api from '../../../lib/api/client';

const SECTIONS = [
  {
    title: 'Account', icon: User, items: [
      { label: 'Password', sub: 'Update your password', action: 'Update', id: 'password' },
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
      { label: 'Theme', sub: 'Controlled by the toggle in the top bar', action: 'Toggle' },
    ]
  },
  {
    title: 'Privacy', icon: Shield, items: [
      { label: 'Profile visibility', sub: 'Who can see your profile', action: 'Public' },
      { label: 'Study stats', sub: 'Share your study stats', toggle: true, default: true },
    ]
  },
];

function PasswordForm({ onCancel }: { onCancel: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!current || !next || !confirm) { toast.error('All fields are required'); return; }
    if (next !== confirm) { toast.error('New passwords do not match'); return; }
    if (next.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await changePassword(current, next);
      toast.success('Password updated');
      onCancel();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      toast.error(err?.response?.data?.error || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full bg-surface-card border border-surface-border rounded-md px-3 h-9 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors pr-10';

  return (
    <div className="px-5 pb-4 pt-1 space-y-2.5 border-t border-surface-border bg-surface-elevated/30">
      {[
        { label: 'Current password', value: current, set: setCurrent, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
        { label: 'New password', value: next, set: setNext, show: showNext, toggle: () => setShowNext(v => !v) },
        { label: 'Confirm new password', value: confirm, set: setConfirm, show: showNext, toggle: () => setShowNext(v => !v) },
      ].map(f => (
        <div key={f.label}>
          <label className="text-xs font-medium text-text-secondary block mb-1">{f.label}</label>
          <div className="relative">
            <input
              type={f.show ? 'text' : 'password'}
              value={f.value}
              onChange={e => f.set(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
            <button
              type="button"
              onClick={f.toggle}
              aria-label={f.show ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            >
              {f.show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="button" size="sm" onClick={handleSave} loading={saving} className="flex-1">Save password</Button>
      </div>
    </div>
  );
}

function TwoFASetupModal({ onClose, onEnabled }: { onClose: () => void; onEnabled: () => void }) {
  const [step, setStep] = useState<'qr' | 'verify'>('qr');
  const [qrData, setQrData] = useState<{ secret: string; qr_code: string } | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchQR = async () => {
    setLoading(true);
    try {
      const data = await setup2FA();
      setQrData(data);
      setStep('qr');
    } catch { toast.error('Failed to generate QR code'); }
    finally { setLoading(false); }
  };

  useState(() => { fetchQR(); });

  const activate = async () => {
    if (!qrData || !code) return;
    setLoading(true);
    try {
      await enable2FA(qrData.secret, code);
      toast.success('2FA enabled successfully');
      onEnabled();
      onClose();
    } catch { toast.error('Invalid code — please try again'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div variants={popIn} initial="hidden" animate="visible" className="w-full max-w-sm">
        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-text-primary font-semibold">Enable Two-Factor Auth</h2>
            <button type="button" aria-label="Close" onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {qrData ? (
            <div className="space-y-4 text-center">
              <p className="text-text-muted text-sm">Scan this QR code with your authenticator app (e.g. Google Authenticator)</p>
              <div className="flex justify-center">
                <Image src={qrData.qr_code} alt="2FA QR Code" width={180} height={180} className="rounded-md" unoptimized />
              </div>
              <p className="text-text-muted text-xs">Or enter the secret manually: <code className="text-brand font-mono text-[11px]">{qrData.secret}</code></p>
              <div>
                <input
                  className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand text-center tracking-widest font-mono"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <Button type="button" onClick={activate} loading={loading} disabled={code.length !== 6} className="w-full">
                Activate 2FA
              </Button>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}

function TwoFADisableModal({ onClose, onDisabled }: { onClose: () => void; onDisabled: () => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDisable = async () => {
    setLoading(true);
    try {
      await disable2FA(code);
      toast.success('2FA disabled');
      onDisabled();
      onClose();
    } catch { toast.error('Invalid code'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div variants={popIn} initial="hidden" animate="visible" className="w-full max-w-sm">
        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-text-primary font-semibold">Disable Two-Factor Auth</h2>
            <button type="button" aria-label="Close" onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-text-muted text-sm mb-4">Enter your current authenticator code to disable 2FA.</p>
          <input
            className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand text-center tracking-widest font-mono mb-4"
            placeholder="6-digit code"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="button" variant="danger" onClick={handleDisable} loading={loading} disabled={code.length !== 6} className="flex-1">Disable 2FA</Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const { user, setUser, logout: logoutStore } = useAuthStore();
  const router = useRouter();
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.profile?.two_fa_enabled ?? false);
  const [digestEnabled, setDigestEnabled] = useState(user?.profile?.email_digest_enabled ?? true);

  const handleLogout = () => {
    logout();
    logoutStore();
    router.push('/login');
  };

  const handleDigestToggle = async () => {
    const next = !digestEnabled;
    setDigestEnabled(next);
    try {
      await api.patch('/api/users/profile/', { email_digest_enabled: next });
      if (user) setUser({ ...user, profile: { ...user.profile, email_digest_enabled: next } as typeof user.profile });
    } catch { setDigestEnabled(!next); toast.error('Failed to update setting'); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem} className="mb-8">
          <p className="text-xs text-text-muted mb-1">Account</p>
          <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
          <p className="text-text-muted text-xs mt-1">Manage your account and preferences</p>
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
                  <div key={ii}>
                    <div className={`flex items-center justify-between px-5 py-4 ${ii < section.items.length - 1 || expandedAction === ('id' in item ? item.id : null) ? 'border-b border-surface-border' : ''} hover:bg-surface-elevated transition-colors`}>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{item.label}</div>
                        <div className="text-xs text-text-muted mt-0.5">{item.sub}</div>
                      </div>
                      {'toggle' in item ? (
                        <button
                          type="button"
                          aria-label={`Toggle ${item.label}`}
                          onClick={() => setToggles(t => ({...t, [item.label]: !(t[item.label] ?? item.default)}))}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${(toggles[item.label] ?? item.default) ? 'bg-brand' : 'bg-surface-elevated'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface-card shadow-sm transition-transform duration-200 ${(toggles[item.label] ?? item.default) ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setExpandedAction(prev => prev === ('id' in item ? item.id : null) ? null : ('id' in item ? item.id : null))}
                          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
                        >
                          {'action' in item && item.action}
                          <ChevronRight className={`w-3 h-3 transition-transform ${expandedAction === ('id' in item ? item.id : null) ? 'rotate-90' : ''}`} />
                        </button>
                      )}
                    </div>
                    {'id' in item && item.id === 'password' && expandedAction === 'password' && (
                      <PasswordForm onCancel={() => setExpandedAction(null)} />
                    )}
                  </div>
                ))}
              </GlassCard>
            </motion.div>
          ))}

          {/* Email digest */}
          <motion.div variants={staggerItem}>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-text-muted" />
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Notifications</h2>
            </div>
            <GlassCard hover={false} className="p-0 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="text-sm font-medium text-text-primary">Weekly Email Digest</div>
                  <div className="text-xs text-text-muted mt-0.5">Receive a weekly summary of your study activity</div>
                </div>
                <button
                  type="button"
                  aria-label="Toggle weekly email digest"
                  onClick={handleDigestToggle}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${digestEnabled ? 'bg-brand' : 'bg-surface-elevated'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface-card shadow-sm transition-transform duration-200 ${digestEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Security / 2FA */}
          <motion.div variants={staggerItem}>
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="w-4 h-4 text-text-muted" />
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Security</h2>
            </div>
            <GlassCard hover={false} className="p-0 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="text-sm font-medium text-text-primary">Two-Factor Authentication</div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {twoFAEnabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security'}
                  </div>
                </div>
                {twoFAEnabled ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-brand text-xs font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Active
                    </div>
                    <Button type="button" variant="danger" size="sm" onClick={() => setShow2FADisable(true)}>
                      Disable
                    </Button>
                  </div>
                ) : (
                  <Button type="button" size="sm" onClick={() => setShow2FASetup(true)}>
                    Enable 2FA
                  </Button>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Danger zone */}
          <motion.div variants={staggerItem}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-rose-400 uppercase tracking-wider">Danger zone</h2>
            </div>
            <GlassCard hover={false} className="border-rose-800/50">
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

      <AnimatePresence>
        {show2FASetup && (
          <TwoFASetupModal
            onClose={() => setShow2FASetup(false)}
            onEnabled={() => setTwoFAEnabled(true)}
          />
        )}
        {show2FADisable && (
          <TwoFADisableModal
            onClose={() => setShow2FADisable(false)}
            onDisabled={() => setTwoFAEnabled(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
