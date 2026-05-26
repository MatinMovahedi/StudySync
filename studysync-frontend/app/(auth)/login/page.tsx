'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { login, getMe, verify2FA } from '../../../lib/api/auth';
import { useAuthStore } from '../../../lib/store/authStore';
import { staggerContainer, staggerItem, slideInRight } from '../../../lib/utils/animations';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const { setUser } = useAuthStore();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.requires_2fa) {
        setTempToken(result.temp_token);
        setRequires2FA(true);
        setLoading(false);
        return;
      }
      const user = await getMe();
      setUser(user);
      toast.success(`Welcome back, ${user.first_name}!`);
      router.push(user.is_onboarded ? '/dashboard' : '/onboarding');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string; error?: string } } };
      toast.error(error?.response?.data?.detail || error?.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const onVerify2FA = async () => {
    if (twoFACode.length !== 6) return;
    setLoading(true);
    try {
      await verify2FA(tempToken, twoFACode);
      const user = await getMe();
      setUser(user);
      toast.success(`Welcome back, ${user.first_name}!`);
      router.push(user.is_onboarded ? '/dashboard' : '/onboarding');
    } catch {
      toast.error('Invalid code — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {requires2FA ? (
          <motion.div
            key="2fa-view"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            <motion.div variants={staggerItem} className="mb-8">
              <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                <ShieldCheck className="w-5 h-5 text-brand" />
              </div>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">Verify identity</h1>
              <p className="text-text-muted text-sm">Enter the 6-digit code from your authenticator app.</p>
            </motion.div>

            <motion.div variants={staggerItem} className="flex flex-col gap-4">
              <input
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-4 py-3.5 text-xl text-text-primary placeholder:text-text-muted outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/15 text-center tracking-[0.5em] font-mono transition-all"
                placeholder="000000"
                maxLength={6}
                value={twoFACode}
                onChange={e => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
              <Button
                type="button"
                loading={loading}
                disabled={twoFACode.length !== 6}
                onClick={onVerify2FA}
                size="lg"
                className="w-full"
              >
                Verify &amp; sign in
              </Button>
              <button
                type="button"
                onClick={() => { setRequires2FA(false); setTwoFACode(''); }}
                className="text-xs text-text-muted hover:text-text-secondary transition-colors text-center py-1"
              >
                ← Back to login
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="login-view"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            <motion.div variants={staggerItem} className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">Welcome back</h1>
              <p className="text-text-muted text-sm">Sign in to your StudySync account</p>
            </motion.div>

            <motion.form
              key="login-form"
              variants={staggerItem}
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Input
                label="University email"
                type="email"
                placeholder="you@university.edu"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                className="h-10"
                {...register('email', { required: 'Email is required' })}
              />
              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  className="h-10"
                  {...register('password', { required: 'Password is required' })}
                />
                <div className="flex justify-end mt-1.5">
                  <span className="text-xs text-text-muted hover:text-brand cursor-default transition-colors select-none">
                    Forgot password?
                  </span>
                </div>
              </div>
              <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
                Sign in
              </Button>
            </motion.form>

            <motion.div variants={staggerItem} className="mt-7">
              <div className="relative flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-surface-border" />
                <span className="text-[11px] text-text-muted uppercase tracking-wider">demo account</span>
                <div className="flex-1 h-px bg-surface-border" />
              </div>
              <div className="bg-surface-card border border-surface-border rounded-lg px-4 py-3 text-center">
                <p className="text-xs text-text-muted leading-5">
                  <code className="font-mono text-text-secondary">alex@university.edu</code>
                  <span className="mx-2 text-surface-border">·</span>
                  <code className="font-mono text-text-secondary">StudySync2024!</code>
                </p>
              </div>
            </motion.div>

            <motion.p variants={staggerItem} className="text-center text-sm text-text-muted mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-brand hover:text-brand-dark transition-colors font-medium">
                Sign up free
              </Link>
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
