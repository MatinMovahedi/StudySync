'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { register as registerUser, getMe } from '../../../lib/api/auth';
import { useAuthStore } from '../../../lib/store/authStore';
import { staggerContainer, staggerItem } from '../../../lib/utils/animations';

interface SignupForm {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  password_confirm: string;
}

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupForm>();

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      await registerUser(data);
      const user = await getMe();
      setUser(user);
      toast.success("Account created! Let's set up your profile.");
      router.push('/onboarding');
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string[]> } };
      const msg = error?.response?.data
        ? Object.values(error.response.data).flat()[0]
        : 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full">
      <motion.div variants={staggerItem} className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">Create account</h1>
        <p className="text-text-muted text-sm">Join thousands of students already studying smarter</p>
      </motion.div>

      <motion.form variants={staggerItem} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="First name"
            placeholder="Alex"
            icon={<User className="w-4 h-4" />}
            error={errors.first_name?.message}
            className="h-10"
            {...register('first_name', { required: 'Required' })}
          />
          <Input
            label="Last name"
            placeholder="Chen"
            error={errors.last_name?.message}
            className="h-10"
            {...register('last_name', { required: 'Required' })}
          />
        </div>

        <Input
          label="University email"
          type="email"
          placeholder="you@university.edu"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          className="h-10"
          {...register('email', { required: 'Required' })}
        />

        <Input
          label="Username"
          placeholder="alexchen"
          icon={<User className="w-4 h-4" />}
          error={errors.username?.message}
          className="h-10"
          {...register('username', {
            required: 'Required',
            minLength: { value: 3, message: 'At least 3 characters' },
          })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Min 8 characters"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          className="h-10"
          {...register('password', {
            required: 'Required',
            minLength: { value: 8, message: 'At least 8 characters' },
          })}
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password_confirm?.message}
          className="h-10"
          {...register('password_confirm', {
            required: 'Required',
            validate: v => v === watch('password') || 'Passwords do not match',
          })}
        />

        <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
          Create account
        </Button>

        <p className="text-center text-[11px] text-text-muted leading-relaxed">
          By signing up you agree to our{' '}
          <span className="text-text-secondary cursor-default">Terms of Service</span>
          {' '}and{' '}
          <span className="text-text-secondary cursor-default">Privacy Policy</span>
        </p>
      </motion.form>

      <motion.p variants={staggerItem} className="text-center text-sm text-text-muted mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-brand hover:text-brand-dark transition-colors font-medium">
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  );
}
