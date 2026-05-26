# StudySync — Frontend

Next.js 16 frontend for StudySync. See the [root README](../README.md) for full project documentation, architecture diagrams, and setup instructions.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Requires the backend running on `http://localhost:8000`. See [../README.md](../README.md).

## Stack

- **Next.js 16** App Router with Turbopack
- **React 19** with `'use client'` components
- **Tailwind CSS v4** — `@theme` tokens, runtime CSS variable switching
- **Framer Motion** — page and stagger animations
- **Zustand** — auth, UI, Pomodoro, notification stores
- **React Query** — server state, caching, background refetch
- **Axios** — JWT interceptor with auto-refresh

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/pricing` | Pricing tiers |
| `/login` | Sign in |
| `/signup` | Create account |
| `/onboarding` | First-run profile setup |
| `/dashboard` | Home — streak, stats, groups, sessions |
| `/groups` | Browse / create / join study groups |
| `/groups/[id]` | Group detail — members, upcoming sessions |
| `/groups/[id]/chat` | Real-time WebSocket chat |
| `/ai` | AI tools — chat, quiz, flashcards, summarize, explain |
| `/pomodoro` | Circular Pomodoro timer |
| `/analytics` | Study hours charts, streaks, subject breakdown |
| `/profile` | Own profile — edit bio, stats, courses |
| `/profile/[userId]` | Public profile view |
| `/settings` | Notifications, password, appearance, danger zone |
| `/spots` | Campus study spots directory |
