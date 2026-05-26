# StudySync

AI-powered study group platform. Full-stack: Django 6 + Channels (backend) · Next.js 16 + Tailwind v4 (frontend).

---

## Features

**Groups & Chat**
- Create and join study groups with course codes, categories, and privacy settings
- Real-time WebSocket group chat with typing indicators and emoji reactions
- Members sidebar, role badges (admin / member), and leave confirmation

**AI Study Tools**
- Streaming AI chat with a typewriter effect (mock by default, OpenAI when configured)
- Quiz generator — topic + difficulty, multiple-choice with explanations
- Flashcard generator with 3D flip animation
- Note summarizer and concept explainer

**Analytics & Pomodoro**
- Study streak, longest streak, total hours, and daily study log
- 7-day area chart and 30-day bar chart of study minutes
- Subject breakdown pie chart (populated from Pomodoro sessions)
- Circular SVG Pomodoro timer with work / short break / long break phase switching

**Other**
- Campus study spots directory with ratings, amenities, noise levels, and hours
- Notifications — real-time push via WebSocket + DB fallback for offline users
- User onboarding flow (university, program, study style tags, courses)
- Settings — notification toggles, password change, account danger zone
- Dark / light mode with zero flash (anti-flash inline script + CSS variable tokens)
- Fully responsive — collapsible sidebar on desktop, bottom tab bar on mobile
- Pricing page at `/pricing` with monthly/annual toggle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 |
| State | Zustand (client) · React Query (server cache) |
| Animations | Framer Motion |
| Backend | Django 6 · Django REST Framework 3.17 · Django Channels 4 |
| Auth | JWT (simplejwt) · localStorage · Axios interceptors with auto-refresh |
| Real-time | Daphne ASGI · WebSocket · InMemoryChannelLayer (dev) / Redis (prod) |
| Database | PostgreSQL |
| AI | Mocked SSE streaming by default — set `USE_MOCK_AI = False` + `OPENAI_API_KEY` for real OpenAI |

---

## Project Structure

```
410Project/
├── studysync-backend/
│   ├── apps/
│   │   ├── users/          # Custom User, UserProfile, auth endpoints
│   │   ├── groups/         # StudyGroup, GroupMembership
│   │   ├── chat/           # Message, GroupChatConsumer (WebSocket)
│   │   ├── sessions_app/   # StudySession, PomodoroSession
│   │   ├── ai_assistant/   # AIConversation, FlashCard, streaming endpoints
│   │   ├── analytics/      # StudyStreak, DailyStudyLog
│   │   ├── campus/         # StudySpot
│   │   └── notifications/  # Notification, NotificationConsumer (WebSocket)
│   ├── config/             # Django settings, ASGI, URL root
│   ├── fixtures/           # Seed data
│   └── requirements.txt
│
└── studysync-frontend/
    ├── app/
    │   ├── (auth)/         # login, signup — AnimatedBackground layout
    │   ├── (dashboard)/    # dashboard, groups, ai, pomodoro, analytics,
    │   │                   # profile, settings, spots
    │   ├── onboarding/
    │   ├── pricing/
    │   └── not-found.tsx
    ├── components/
    │   ├── landing/        # Navbar, Hero, Features, HowItWorks, Testimonials, CTA
    │   ├── layout/         # Sidebar, Topbar, MobileNav
    │   ├── shared/         # GlassCard, AnimatedBackground, GradientText
    │   └── ui/             # Button, Avatar, Badge, Input, Skeleton, ThemeToggle
    ├── hooks/              # usePomodoro, useChat, useWebSocket
    ├── lib/
    │   ├── api/            # Axios client + per-domain API modules
    │   ├── store/          # Zustand stores (auth, ui, pomodoro, notifications)
    │   └── utils/          # cn, format, animations
    └── public/
```

---

## Running Locally

### Prerequisites

- Python 3.11+
- Node.js 20+
- [Postgres.app](https://postgresapp.com) (or any PostgreSQL instance)

### 1 — Database

```bash
# Start Postgres.app, then create the database
psql -c "CREATE DATABASE studysync;"
```

### 2 — Backend

```bash
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"

python -m venv venv
source venv/bin/activate
pip install -r studysync-backend/requirements.txt

cd studysync-backend
python manage.py migrate
python manage.py loaddata fixtures/*.json   # optional seed data

# Run (HTTP + WebSocket on one port via Daphne)
daphne -p 8000 config.asgi:application
```

### 3 — Frontend

```bash
cd studysync-frontend
npm install
npm run dev          # http://localhost:3000
```

### Demo credentials

```
Email:    alex@university.edu
Password: StudySync2024!
```

---

## Environment Variables

### Backend (`studysync-backend/config/settings.py`)

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | insecure dev key | Django secret key |
| `DEBUG` | `True` | Debug mode |
| `USE_MOCK_AI` | `True` | Use mock SSE responses instead of OpenAI |
| `OPENAI_API_KEY` | — | Required when `USE_MOCK_AI = False` |

### Frontend

No `.env` required for local dev. The Axios client points to `http://localhost:8000` by default.

---

## API Overview

All endpoints are under `/api/`. JWT access token required in `Authorization: Bearer <token>` header unless noted.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register/` | Sign up |
| POST | `/api/auth/login/` | Log in → `{access, refresh}` |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/users/me/` | Current user profile |
| PATCH | `/api/users/profile/` | Update profile |
| PATCH | `/api/users/change-password/` | Change password |
| GET/POST | `/api/groups/` | List / create study groups |
| POST | `/api/groups/:id/join/` | Join a group |
| POST | `/api/groups/:id/leave/` | Leave a group |
| GET | `/api/chat/:id/messages/` | Fetch message history |
| POST | `/api/ai/chat/` | Streaming AI chat (SSE) |
| POST | `/api/ai/quiz/` | Generate quiz |
| POST | `/api/ai/flashcards/` | Generate flashcards |
| POST | `/api/ai/summarize/` | Summarize notes |
| POST | `/api/ai/explain/` | Explain a concept |
| GET | `/api/analytics/streak/` | Study streak |
| GET | `/api/analytics/hours/` | Daily study hours |
| GET | `/api/analytics/subjects/` | Subject breakdown |
| GET | `/api/campus/spots/` | Study spots |
| GET | `/api/notifications/` | Notification list |
| PATCH | `/api/notifications/:id/read/` | Mark as read |

**WebSocket endpoints**

| Path | Description |
|---|---|
| `ws://localhost:8000/ws/chat/:id/?token=<jwt>` | Group chat |
| `ws://localhost:8000/ws/notifications/?token=<jwt>` | Live notifications |

---

## UML & Architecture Diagrams

### Entity-Relationship Diagram

```mermaid
erDiagram
    USER {
        int     id PK
        string  email UK
        string  username
        string  first_name
        string  last_name
        bool    is_onboarded
        datetime created_at
    }

    USER_PROFILE {
        int     id PK
        int     user_id FK
        string  university
        string  program
        int     year_of_study
        json    courses
        json    study_style_tags
        string  availability
        float   total_study_hours
        int     total_sessions
    }

    STUDY_GROUP {
        int     id PK
        string  name
        string  course_code
        string  category
        bool    is_private
        int     max_members
        string  invite_code UK
        int     created_by_id FK
        string  avatar_color
        datetime created_at
    }

    GROUP_MEMBERSHIP {
        int     id PK
        int     user_id FK
        int     group_id FK
        string  role
        datetime joined_at
    }

    MESSAGE {
        int     id PK
        int     group_id FK
        int     sender_id FK
        int     reply_to_id FK
        string  message_type
        text    content
        json    reactions
        bool    is_edited
        datetime created_at
    }

    STUDY_SESSION {
        int     id PK
        int     group_id FK
        int     created_by_id FK
        string  title
        datetime scheduled_at
        int     duration_minutes
        bool    is_online
        string  join_link
    }

    POMODORO_SESSION {
        int     id PK
        int     user_id FK
        int     duration_minutes
        bool    is_completed
        datetime started_at
        datetime completed_at
        string  subject
    }

    AI_CONVERSATION {
        int     id PK
        int     user_id FK
        string  title
        json    messages
        datetime updated_at
    }

    FLASH_CARD {
        int     id PK
        int     user_id FK
        string  deck_name
        text    front
        text    back
        bool    ai_generated
        float   ease_factor
        int     interval_days
        datetime next_review
    }

    STUDY_STREAK {
        int     id PK
        int     user_id FK
        int     current_streak
        int     longest_streak
        date    last_study_date
        int     total_study_days
    }

    DAILY_STUDY_LOG {
        int     id PK
        int     user_id FK
        date    date
        int     minutes_studied
        int     sessions_completed
        json    subjects
    }

    NOTIFICATION {
        int     id PK
        int     user_id FK
        string  notification_type
        string  title
        text    body
        bool    is_read
        int     related_object_id
        datetime created_at
    }

    USER             ||--||  USER_PROFILE      : "has profile"
    USER             ||--o{  GROUP_MEMBERSHIP  : "joins via"
    USER             ||--o{  MESSAGE           : "sends"
    USER             ||--o{  POMODORO_SESSION  : "runs"
    USER             ||--o{  AI_CONVERSATION   : "holds"
    USER             ||--o{  FLASH_CARD        : "owns"
    USER             ||--||  STUDY_STREAK      : "has streak"
    USER             ||--o{  DAILY_STUDY_LOG   : "logs"
    USER             ||--o{  NOTIFICATION      : "receives"
    USER             ||--o{  STUDY_GROUP       : "created_by"
    USER             ||--o{  STUDY_SESSION     : "created_by"

    STUDY_GROUP      ||--o{  GROUP_MEMBERSHIP  : "has members"
    STUDY_GROUP      ||--o{  MESSAGE           : "contains"
    STUDY_GROUP      ||--o{  STUDY_SESSION     : "schedules"

    MESSAGE          ||--o{  MESSAGE           : "reply_to"
```

---

### System Architecture

```mermaid
graph TB
    subgraph Browser["Browser — Next.js 16"]
        UI["React Pages & Components"]
        ZS["Zustand Stores\nauth · chat · ui · pomodoro"]
        RQ["React Query\nserver state cache"]
        AX["Axios Client\nJWT interceptors"]
        WS_C["WebSocket Client\nuseWebSocket hook"]
    end

    subgraph Daphne["Daphne ASGI :8000"]
        HTTP["HTTP Router\nDjango URLs"]
        WS_R["WebSocket Router\nChannels URLRouter"]
    end

    subgraph Django["Django 6 Application"]
        DRF["DRF ViewSets"]
        JWT["simplejwt Auth"]
        CHAT_C["GroupChatConsumer"]
        NOTIF_C["NotificationConsumer"]
        SIGNALS["Django Signals\nauto-notifications"]
        AI["AI Client\nstreaming SSE"]
    end

    subgraph Storage["Storage"]
        PG[("PostgreSQL")]
        CL["InMemoryChannelLayer\ndev  /  Redis prod"]
    end

    UI --> ZS
    UI --> RQ
    RQ --> AX
    AX -->|"REST + JWT"| HTTP
    WS_C -->|"ws://chat/id/?token=..."| WS_R
    WS_C -->|"ws://notifications/?token=..."| WS_R

    HTTP --> JWT
    HTTP --> DRF
    DRF --> PG
    DRF --> AI
    AI -->|"SSE chunks"| AX

    WS_R --> CHAT_C
    WS_R --> NOTIF_C
    CHAT_C --> CL
    NOTIF_C --> CL
    CHAT_C --> PG
    SIGNALS -->|"post_save Message\npost_save StudySession"| NOTIF_C
    NOTIF_C -->|"push to user channel"| WS_C
```

---

### WebSocket Message Flow

```mermaid
sequenceDiagram
    actor Alice
    participant FE_A as Alice's Browser
    participant BE as GroupChatConsumer
    participant CL as ChannelLayer
    participant FE_B as Bob's Browser
    actor Bob

    Alice->>FE_A: types message, presses Enter
    FE_A->>BE: WS send {type:"message", content:"..."}
    BE->>BE: authenticate JWT from query string
    BE->>BE: check GroupMembership
    BE->>BE: save Message to PostgreSQL
    BE->>CL: group_send("chat_1", {type:"chat_message",...})
    CL->>FE_A: chat_message (echo back to Alice)
    CL->>FE_B: chat_message (broadcast to Bob)
    FE_A->>Alice: append message to chat
    FE_B->>Bob: append message to chat

    Note over FE_A,BE: Typing indicator — not persisted
    Alice->>FE_A: keydown (not Enter)
    FE_A->>BE: WS send {type:"typing", is_typing:true}
    BE->>CL: group_send("chat_1", typing_indicator)
    CL->>FE_B: typing_indicator event
    FE_B->>Bob: show "Alice is typing…"
```

---

### Auth & JWT Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Next.js Frontend
    participant AX as Axios Interceptor
    participant BE as Django Backend

    User->>FE: submit {email, password}
    FE->>BE: POST /api/auth/login/
    BE-->>FE: {access, refresh}
    FE->>FE: localStorage.setItem(access + refresh)
    FE->>FE: authStore.setUser(user)
    FE->>FE: router.push("/dashboard")

    Note over FE,BE: Every subsequent API request
    FE->>AX: outgoing request
    AX->>AX: attach Authorization: Bearer access
    AX->>BE: HTTP request
    BE-->>AX: 401 token expired
    AX->>BE: POST /api/auth/refresh/ {refresh}
    BE-->>AX: {access: "new-token"}
    AX->>AX: update localStorage
    AX->>BE: retry original request
    BE-->>FE: 200 OK

    Note over FE,BE: WebSocket auth — headers not supported by browser WS API
    FE->>BE: ws://...?token=access_token
    BE->>BE: AccessToken(token).payload user_id
    BE->>BE: verify GroupMembership
    BE-->>FE: 101 Switching Protocols
```

---

### AI Streaming Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as React AIChat
    participant BE as AIChatStreamView
    participant AI as AIClient

    User->>FE: submit prompt
    FE->>BE: fetch() POST /api/ai/chat/ streaming=true
    BE->>AI: chat_completion_stream(message)
    loop Every word ~40ms
        AI-->>BE: yield "word "
        BE-->>FE: data: {"chunk":"word "}\n\n
        FE->>FE: append chunk to state
        FE->>User: typewriter cursor advances
    end
    BE-->>FE: data: {"done":true}\n\n
    FE->>FE: hide cursor, mark complete
```

---

### Notification Signal Flow

```mermaid
flowchart TD
    A[Message.save] --> B{post_save signal}
    B --> C[on_message_created]
    C --> D{for each group member\nexcluding sender}
    D --> E[Notification.objects.create]
    E --> F[push_notification]
    F --> G[get_channel_layer]
    G --> H[group_send notifications_user_id]
    H --> I{user connected\nto WS?}
    I -->|yes| J[NotificationConsumer\nsends to browser]
    I -->|no| K[Notification sits in DB\nfetched on next login]
    J --> L[bell badge updates\nin real time]
```

---

### Frontend Component Tree

```mermaid
graph TD
    Root["app/layout.tsx\nQueryClientProvider · Toaster · theme-init script"]
    Auth["(auth)/layout.tsx\nAnimatedBackground"]
    Dash["(dashboard)/layout.tsx\nauth guard · notifications"]
    Land["app/page.tsx\nLanding page"]
    Price["app/pricing/page.tsx"]

    Root --> Auth
    Root --> Dash
    Root --> Land
    Root --> Price

    Auth --> Login["login/page.tsx"]
    Auth --> Signup["signup/page.tsx"]

    Land --> LNav["Navbar"]
    Land --> LHero["HeroSection"]
    Land --> LFeat["FeaturesSection"]
    Land --> LHow["HowItWorksSection"]
    Land --> LTest["TestimonialsSection"]
    Land --> LCTA["CTASection"]

    Dash --> Sidebar["Sidebar\ncollapsible · logout"]
    Dash --> Topbar["Topbar\nsearch · notifications · theme · avatar→profile"]
    Dash --> MobileNav["MobileNav\nbottom tab bar md:hidden"]

    Dash --> DB["dashboard/page.tsx\ngreeting · streak · stats · groups · sessions"]
    Dash --> Groups["groups/page.tsx\nsearch · filter · join · create modal"]
    Dash --> GD["groups/[id]/page.tsx\nmembers · sessions · leave"]
    Dash --> Chat["groups/[id]/chat/page.tsx\nuseChat · WS · emoji · members panel"]
    Dash --> AI["ai/page.tsx\nchat · quiz · flashcards · summarize · explain"]
    Dash --> Pomo["pomodoro/page.tsx\nSVG ring · phase switching · subject input"]
    Dash --> Analy["analytics/page.tsx\nAreaChart · PieChart · BarChart"]
    Dash --> Prof["profile/page.tsx\nedit bio · stats · courses · study style"]
    Dash --> ProfU["profile/[userId]/page.tsx\npublic view"]
    Dash --> Sett["settings/page.tsx\ntoggles · password change · logout"]
    Dash --> Spots["spots/page.tsx\nstudy spots · ratings · amenities"]
```
