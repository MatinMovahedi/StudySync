import { AnimatedBackground } from '../../components/shared/AnimatedBackground';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md px-6">
        {children}
      </div>
    </div>
  );
}
