'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';
import { MobileNav } from '../../components/layout/MobileNav';
import { useAuthStore } from '../../lib/store/authStore';
import { useNotificationStore } from '../../lib/store/notificationStore';
import { useGamificationStore } from '../../lib/store/gamificationStore';
import { getNotifications } from '../../lib/api/notifications';
import { getGamificationProfile } from '../../lib/api/gamification';
import { getMe } from '../../lib/api/auth';
import { AchievementToast } from '../../components/shared/AchievementToast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuthStore();
  const { setNotifications } = useNotificationStore();
  const { setProfile } = useGamificationStore();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/login'); return; }
    if (!user) {
      getMe().then(setUser).catch(() => router.push('/login'));
    }
    getNotifications().then(data => setNotifications(data)).catch(() => {});
    getGamificationProfile().then(setProfile).catch(() => {});
  }, []);

  return (
    <div className="h-screen flex bg-surface overflow-hidden">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full bg-surface pb-14 md:pb-0">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
      <AchievementToast />
    </div>
  );
}
