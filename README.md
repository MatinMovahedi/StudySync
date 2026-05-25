# StudySync — UML Reference

AI-powered study group platform. Full-stack: Django 6 + DRF + Channels (backend) · Next.js 16 + Tailwind v4 (frontend).

---

## 1. Entity-Relationship Diagram

Core database relationships across all eight Django apps.

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

## 2. Class Diagram

Django model class hierarchy with field types and key methods.

```mermaid
classDiagram
    class AbstractUser {
        <<Django>>
    }

    class User {
        +EmailField email
        +BooleanField is_onboarded
        +DateTimeField created_at
        USERNAME_FIELD = "email"
    }

    class UserProfile {
        +OneToOneField user
        +ImageField avatar
        +CharField university
        +CharField program
        +JSONField courses
        +JSONField study_style_tags
        +FloatField total_study_hours
        +IntegerField total_sessions
    }

    class StudyGroup {
        +CharField name
        +CharField course_code
        +CharField category
        +BooleanField is_private
        +IntegerField max_members
        +CharField invite_code
        +ForeignKey created_by
        +ManyToManyField members
        +save() void
    }

    class GroupMembership {
        +ForeignKey user
        +ForeignKey group
        +CharField role
        +DateTimeField joined_at
    }

    class Message {
        +ForeignKey group
        +ForeignKey sender
        +ForeignKey reply_to
        +TextField content
        +CharField message_type
        +JSONField reactions
        +BooleanField is_edited
    }

    class StudySession {
        +ForeignKey group
        +ForeignKey created_by
        +CharField title
        +DateTimeField scheduled_at
        +IntegerField duration_minutes
        +BooleanField is_online
        +URLField join_link
    }

    class PomodoroSession {
        +ForeignKey user
        +IntegerField duration_minutes
        +BooleanField is_completed
        +DateTimeField started_at
        +DateTimeField completed_at
        +CharField subject
    }

    class AIConversation {
        +ForeignKey user
        +CharField title
        +JSONField messages
    }

    class FlashCard {
        +ForeignKey user
        +CharField deck_name
        +TextField front
        +TextField back
        +BooleanField ai_generated
        +FloatField ease_factor
        +IntegerField interval_days
        +DateTimeField next_review
    }

    class StudyStreak {
        +OneToOneField user
        +IntegerField current_streak
        +IntegerField longest_streak
        +DateField last_study_date
        +IntegerField total_study_days
    }

    class DailyStudyLog {
        +ForeignKey user
        +DateField date
        +IntegerField minutes_studied
        +IntegerField sessions_completed
        +JSONField subjects
    }

    class Notification {
        +ForeignKey user
        +CharField notification_type
        +CharField title
        +BooleanField is_read
        +IntegerField related_object_id
    }

    AbstractUser <|-- User
    User "1" --> "1" UserProfile : profile
    User "1" --> "*" GroupMembership
    User "1" --> "*" Message : sent_messages
    User "1" --> "*" PomodoroSession
    User "1" --> "*" AIConversation
    User "1" --> "*" FlashCard
    User "1" --> "1" StudyStreak
    User "1" --> "*" DailyStudyLog
    User "1" --> "*" Notification
    StudyGroup "1" --> "*" GroupMembership : memberships
    StudyGroup "1" --> "*" Message
    StudyGroup "1" --> "*" StudySession
    Message --> Message : reply_to
```

---

## 3. System Architecture

How the three layers communicate at runtime.

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
        AI["AI Mock Client\nstreaming SSE"]
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

## 4. WebSocket Message Flow

Real-time chat sequence from send to all connected clients.

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

## 5. Auth & JWT Flow

Login → token storage → auto-refresh lifecycle.

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

    Note over FE,BE: WebSocket — headers not supported by browser WS API
    FE->>BE: ws://...?token=access_token
    BE->>BE: AccessToken(token).payload user_id
    BE->>BE: verify GroupMembership
    BE-->>FE: 101 Switching Protocols
```

---

## 6. AI Streaming Flow

SSE word-by-word response from mock AI client to React typewriter.

```mermaid
sequenceDiagram
    actor User
    participant FE as React AIChat
    participant BE as AIChatStreamView
    participant AI as MockAIClient

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

## 7. Notification Signal Flow

How a new chat message auto-creates and pushes a notification.

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

## 8. Frontend Component Tree

React component hierarchy for the dashboard shell.

```mermaid
graph TD
    Root["app/layout.tsx\nQueryClientProvider · Toaster"]
    Auth["(auth)/layout.tsx\nAnimatedBackground"]
    Dash["(dashboard)/layout.tsx\nauth guard · notifications"]

    Root --> Auth
    Root --> Dash

    Auth --> Login["login/page.tsx"]
    Auth --> Signup["signup/page.tsx"]

    Dash --> Sidebar["Sidebar.tsx\ncollapsible nav"]
    Dash --> Topbar["Topbar.tsx\nsearch · bell"]

    Dash --> DB["dashboard/page.tsx\nstreak · stats · groups"]
    Dash --> Groups["groups/page.tsx\nsearch · filter · join"]
    Dash --> GD["groups/[id]/page.tsx\nmembers · sessions"]
    Dash --> Chat["groups/[id]/chat/page.tsx\nuseChat · WS · reactions"]
    Dash --> AI["ai/page.tsx\nchat · quiz · flashcards\nsummarize · explain"]
    Dash --> Pomo["pomodoro/page.tsx\nSVG ring · phases"]
    Dash --> Analy["analytics/page.tsx\nAreaChart · PieChart"]
    Dash --> Prof["profile/page.tsx"]
    Dash --> Sett["settings/page.tsx"]
```

---

## Stack Reference

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 |
| State | Zustand (client) · React Query (server cache) |
| Backend | Django 6 · Django REST Framework · Django Channels 4 |
| Auth | JWT (simplejwt) · localStorage · Axios interceptors |
| Real-time | Daphne ASGI · WebSocket · InMemoryChannelLayer (dev) |
| Database | PostgreSQL (Postgres.app) |
| AI | Mocked SSE streaming — set `USE_MOCK_AI=False` + `OPENAI_API_KEY` for real OpenAI |

## Running Locally

```bash
# Backend (HTTP + WebSocket on one port)
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"
source venv/bin/activate
cd studysync-backend && daphne -p 8000 config.asgi:application

# Frontend
cd studysync-frontend && npm run dev

# Demo login
# Email:    alex@university.edu
# Password: StudySync2024!
```
