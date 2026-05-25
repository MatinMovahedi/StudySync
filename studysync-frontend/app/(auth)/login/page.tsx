'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { GradientText } from '../../../components/shared/GradientText';
import { login } from '../../../lib/api/auth';
import { useAuthStore } from '../../../lib/store/authStore';
import { getMe } from '../../../lib/api/auth';
import { fadeInUp, staggerContainer, staggerItem } from '../../../lib/utils/animations';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      const user = await getMe();
      setUser(user);
      toast.success(`Welcome back, ${user.first_name}!`);
      router.push(user.is_onboarded ? '/dashboard' : '/onboarding');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error?.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full">
      <motion.div variants={staggerItem} className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold"><GradientText>StudySync</GradientText></span>
        </Link>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome back</h1>
        <p className="text-text-secondary text-sm">Sign in to your account</p>
      </motion.div>

      <motion.div variants={staggerItem} className="glass gradient-border rounded-2xl p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="University email"
            type="email"
            placeholder="you@university.edu"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />

          <Button type="submit" loading={loading} className="w-full group mt-1">
            Sign in
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-text-muted">
            Demo: <span className="text-brand-light font-mono">alex@university.edu</span> / <span className="text-brand-light font-mono">StudySync2024!</span>
          </p>
        </div>
      </motion.div>

      <motion.p variants={staggerItem} className="text-center text-sm text-text-muted mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-brand-light hover:text-brand transition-colors font-medium">
          Sign up free
        </Link>
      </motion.p>
    </motion.div>
  );
}
