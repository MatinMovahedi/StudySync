'use client';
import { Inter } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} data-scroll-behavior="smooth" data-theme="dark" suppressHydrationWarning>
      <head>
        <title>StudySynch — AI-Powered Study Groups</title>
        <meta name="description" content="Connect with classmates, collaborate in real-time, and ace your courses with AI-powered study tools." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#10b981" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://studysynch.org" />
        <meta property="og:title" content="StudySynch — AI-Powered Study Groups" />
        <meta property="og:description" content="Connect with classmates, collaborate in real-time, and ace your courses with AI-powered study tools." />
        <meta property="og:image" content="https://studysynch.org/og-image.png" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="StudySynch — AI-Powered Study Groups" />
        <meta name="twitter:description" content="Connect with classmates, collaborate in real-time, and ace your courses with AI-powered study tools." />
        <meta name="twitter:image" content="https://studysynch.org/og-image.png" />
        {/* Reads persisted theme before first paint to prevent flash */}
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `try{var s=JSON.parse(localStorage.getItem('studysynch-theme')||'{}');document.documentElement.dataset.theme=s.state&&s.state.theme?s.state.theme:'dark';}catch(e){document.documentElement.dataset.theme='dark';}` }} />
        <Script id="sw-register" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}` }} />
      </head>
      <body className="h-full bg-surface antialiased">
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#f0f0f0',
                border: '1px solid #2a2a2a',
                borderRadius: '6px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#1a1a1a' } },
              error: { iconTheme: { primary: '#f43f5e', secondary: '#1a1a1a' } },
            }}
          />
        </QueryClientProvider>
      </body>
    </html>
  );
}
