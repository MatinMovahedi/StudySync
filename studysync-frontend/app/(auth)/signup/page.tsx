'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { GradientText } from '../../../components/shared/GradientText';
import { register as registerUser } from '../../../lib/api/auth';
import { useAuthStore } from '../../../lib/store/authStore';
import { getMe } from '../../../lib/api/auth';
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
      toast.success('Account created! Let\'s set up your profile.');
      router.push('/onboarding');
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string[]> } };
      const msg = error?.response?.data ? Object.values(error.response.data).flat()[0] : 'Registration failed';
      toast.error(msg);
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
        <h1 className="text-3xl font-bold text-text-primary mb-2">Create your account</h1>
        <p className="text-text-secondary text-sm">Join thousands of students already studying smarter</p>
      </motion.div>

      <motion.div variants={staggerItem} className="glass gradient-border rounded-2xl p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" placeholder="Alex" icon={<User className="w-4 h-4" />}
              error={errors.first_name?.message}
              {...register('first_name', { required: 'Required' })} />
            <Input label="Last name" placeholder="Chen"
              error={errors.last_name?.message}
              {...register('last_name', { required: 'Required' })} />
          </div>
          <Input label="Email" type="email" placeholder="you@university.edu" icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email', { required: 'Required' })} />
          <Input label="Username" placeholder="alexchen" icon={<User className="w-4 h-4" />}
            error={errors.username?.message}
            {...register('username', { required: 'Required', minLength: { value: 3, message: 'At least 3 characters' } })} />
          <Input label="Password" type="password" placeholder="Min 8 characters" icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password', { required: 'Required', minLength: { value: 8, message: 'At least 8 characters' } })} />
          <Input label="Confirm password" type="password" placeholder="••••••••" icon={<Lock className="w-4 h-4" />}
            error={errors.password_confirm?.message}
            {...register('password_confirm', {
              required: 'Required',
              validate: v => v === watch('password') || 'Passwords do not match',
            })} />
          <Button type="submit" loading={loading} className="w-full group mt-1">
            Create account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>
      </motion.div>

      <motion.p variants={staggerItem} className="text-center text-sm text-text-muted mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-light hover:text-brand transition-colors font-medium">Sign in</Link>
      </motion.p>
    </motion.div>
  );
}
