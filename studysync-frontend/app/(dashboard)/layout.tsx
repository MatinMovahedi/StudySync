'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';
import { useAuthStore } from '../../lib/store/authStore';
import { useNotificationStore } from '../../lib/store/notificationStore';
import { getNotifications } from '../../lib/api/notifications';
import { getMe } from '../../lib/api/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, setUser } = useAuthStore();
  const { setNotifications } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/login'); return; }
    if (!user) {
      getMe().then(setUser).catch(() => router.push('/login'));
    }
    getNotifications().then(data => setNotifications(data)).catch(() => {});
  }, []);

  return (
    <div className="h-screen flex bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mesh-bg min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
