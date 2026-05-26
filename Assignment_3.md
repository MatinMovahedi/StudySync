# Assignment 3 — Requirements & Scenario-Based Modelling
**Project:** StudySync — Collaborative Study Platform  
**Student:** Matin Movahedi

---

## 1. Project Description

**StudySync** is a web-based collaborative study platform designed for university students. It centralises the tools students need to study effectively: group coordination, AI-assisted planning, session scheduling, progress analytics, a peer tutoring marketplace, a resource library, and gamified motivation features. The intended output is a fully functional full-stack web application (Next.js frontend, Django REST API backend, PostgreSQL database).

The scope covers two primary actors — **Students** (the primary user) and the **System** (automated background processes such as the AI assistant and digest emails) — interacting across fifteen distinct feature areas.

---

## 2. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | The system shall allow users to register an account with first name, last name, email, and password. |
| FR-02 | The system shall authenticate users via email and password and issue JWT access/refresh tokens. |
| FR-03 | The system shall support optional Two-Factor Authentication (TOTP) via an authenticator app. |
| FR-04 | The system shall allow users to create, browse, join, and leave study groups. |
| FR-05 | The system shall provide real-time group chat within each study group using WebSockets. |
| FR-06 | The system shall allow group members to schedule study sessions with a title, date/time, duration, and optional online join link or physical location. |
| FR-07 | The system shall display scheduled sessions on a weekly time-grid calendar with overlap detection. |
| FR-08 | The system shall provide a Pomodoro timer with configurable work and break intervals. |
| FR-09 | The system shall provide an AI study assistant that answers academic questions in a chat interface. |
| FR-10 | The system shall generate a personalised 7-day study plan via AI given a user's goal and available hours per day. |
| FR-11 | The system shall track daily study time and compute a consecutive-day study streak. |
| FR-12 | The system shall display a personal analytics dashboard showing total study hours, sessions completed, and streak history. |
| FR-13 | The system shall award XP points for study activities and display a level and leaderboard. |
| FR-14 | The system shall allow users to create, browse, and post within topic-based communities. |
| FR-15 | Each community shall have a collaborative wiki where members can create and edit markdown pages. |
| FR-16 | The system shall display a searchable map of campus study spots with availability and amenity information. |
| FR-17 | The system shall provide a grade tracker where users can record courses, assessments, scores, and weights, and the system computes weighted averages. |
| FR-18 | The system shall provide a searchable resource library where users can share links and notes, categorised and tagged, with upvoting. |
| FR-19 | The system shall allow users to list themselves as peer tutors by subject and for students to send tutoring requests. |
| FR-20 | The system shall allow users to configure their public portfolio with skills, projects, and social links (GitHub, LinkedIn). |
| FR-21 | The system shall send a weekly email digest summarising the user's study activity for the past seven days. |
| FR-22 | The system shall support light and dark themes switchable at runtime. |

---

## 3. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | API responses for standard CRUD endpoints shall complete within 500 ms under normal load. |
| NFR-02 | Performance | The AI study planner shall return a generated plan within 10 seconds. |
| NFR-03 | Security | All passwords shall be stored using Django's PBKDF2 hashing algorithm; plaintext passwords shall never be persisted. |
| NFR-04 | Security | All API endpoints except login and registration shall require a valid JWT bearer token. |
| NFR-05 | Security | WebSocket connections shall be validated against the server's `ALLOWED_HOSTS` before being accepted. |
| NFR-06 | Usability | The interface shall be fully usable on screens from 375 px wide (mobile) to 2560 px wide (desktop). |
| NFR-07 | Usability | Key interactive elements shall have ARIA labels to meet WCAG 2.1 Level AA accessibility guidelines. |
| NFR-08 | Scalability | The backend architecture shall support horizontal scaling; session state shall not be stored in process memory. |
| NFR-09 | Reliability | The system shall degrade gracefully when the AI service is unavailable by returning pre-defined mock responses. |
| NFR-10 | Maintainability | Backend business logic shall be separated into Django apps per domain (users, groups, analytics, etc.) with no cross-app model imports at the database level. |
| NFR-11 | Portability | The application shall be deployable via a single `vercel --prod` command to a serverless cloud environment. |

---

## 4. Use Cases

The following use cases are identified for StudySync. The primary actor in all cases is the **Student** unless noted.

| ID | Use Case | Actor(s) |
|----|----------|---------|
| UC-01 | Register Account | Student |
| UC-02 | Log In (with optional 2FA) | Student |
| UC-03 | Create and Configure Study Group | Student |
| UC-04 | Join an Existing Study Group | Student |
| UC-05 | Send a Message in Group Chat | Student |
| UC-06 | Schedule a Study Session | Student |
| UC-07 | View Weekly Schedule Calendar | Student |
| UC-08 | Run Pomodoro Timer | Student |
| UC-09 | Ask the AI Study Assistant | Student |
| UC-10 | Generate AI Weekly Study Plan | Student |
| UC-11 | Track Course Grades | Student |
| UC-12 | Browse and Share Resources | Student |
| UC-13 | List as a Peer Tutor / Request Tutoring | Student |
| UC-14 | Edit Community Wiki Page | Student |
| UC-15 | Receive Weekly Email Digest | System, Student |

---

## 5. Formal Use Case Descriptions

---

### UC-01: Register Account

| Field | Detail |
|-------|--------|
| **Use Case Name** | Register Account |
| **Use Case ID** | UC-01 |
| **Actor(s)** | Student (primary) |
| **Description** | A new user creates a StudySync account by providing their name, email address, and a password. |
| **Preconditions** | The user does not already have an account with the provided email address. The registration page is accessible. |
| **Postconditions** | A new user account is created. The user receives a JWT token pair and is redirected to the onboarding screen. |

**Main Flow:**
1. The student navigates to `/signup`.
2. The student enters first name, last name, email address, and password.
3. The student submits the form.
4. The system validates that all fields are present, the email is well-formed, and the password meets minimum length.
5. The system checks that no existing account uses the provided email.
6. The system creates the user account with a hashed password and an associated profile.
7. The system issues a JWT access token and refresh token.
8. The system redirects the student to the onboarding page.

**Alternative Flow A — Email Already Registered:**
- At step 5, if the email exists, the system displays "An account with this email already exists" and halts submission.

**Alternative Flow B — Validation Failure:**
- At step 4, if a field is missing or invalid, the system highlights the offending field(s) with an inline error message.

---

### UC-02: Log In (with optional 2FA)

| Field | Detail |
|-------|--------|
| **Use Case Name** | Log In |
| **Use Case ID** | UC-02 |
| **Actor(s)** | Student (primary) |
| **Description** | An existing user authenticates with email and password. If Two-Factor Authentication is enabled on the account, the user must also provide a valid TOTP code. |
| **Preconditions** | The user has a registered account. |
| **Postconditions** | The user receives a valid JWT token pair, which is stored in the browser, and is redirected to the dashboard. |

**Main Flow:**
1. The student navigates to `/login`.
2. The student enters email and password and submits.
3. The system verifies the credentials against the stored hashed password.
4. If 2FA is not enabled, the system issues a full JWT token pair.
5. The system stores the tokens in `localStorage` and redirects to `/dashboard`.

**Alternative Flow A — 2FA Enabled:**
- After step 3, the system returns `{ requires_2fa: true, temp_token: <short-lived token> }` instead of a full token pair.
- A 6-digit code input screen slides in.
- The student opens their authenticator app and enters the TOTP code.
- The system verifies the code against the user's stored TOTP secret.
- On success, the system issues a full JWT token pair and proceeds to step 5.

**Alternative Flow B — Invalid Credentials:**
- At step 3, if the password does not match, the system displays "Invalid email or password" without indicating which field is incorrect.

**Alternative Flow C — Invalid TOTP Code:**
- If the TOTP code is incorrect or expired, the system displays "Invalid code. Please try again."

---

### UC-03: Create and Configure Study Group

| Field | Detail |
|-------|--------|
| **Use Case Name** | Create and Configure Study Group |
| **Use Case ID** | UC-03 |
| **Actor(s)** | Student (primary) |
| **Description** | A student creates a new study group, setting its name, category, optional course code, description, privacy setting, and member limit. The creating student automatically becomes the group admin. |
| **Preconditions** | The student is logged in. |
| **Postconditions** | A new study group exists. The student is a member with the Admin role and is redirected to the group detail page. |

**Main Flow:**
1. The student navigates to `/groups` and clicks "Create Group".
2. A modal form opens. The student enters: group name (required), category, course code (optional), description (optional), max members, and private/public toggle.
3. The student submits the form.
4. The system validates that the name is non-empty and max members is within allowed bounds.
5. The system creates the group record and adds the creating user as a member with role `admin`.
6. The system closes the modal and navigates to the new group's detail page.

**Alternative Flow — Duplicate Name:**
- If a group with the same name already exists, the system warns the user but allows creation (names are not globally unique).

---

### UC-04: Join an Existing Study Group

| Field | Detail |
|-------|--------|
| **Use Case Name** | Join an Existing Study Group |
| **Use Case ID** | UC-04 |
| **Actor(s)** | Student (primary) |
| **Description** | A student browses the public group directory and joins a group that is not already at capacity. |
| **Preconditions** | The student is logged in and is not already a member of the target group. The group is public and not at full capacity. |
| **Postconditions** | The student is added as a member with role `member`. The group's member count increments by one. |

**Main Flow:**
1. The student navigates to `/groups`.
2. The student browses or searches for a group by name, category, or course code.
3. The student clicks on a group to view its detail page.
4. The student clicks "Join Group".
5. The system adds the student as a member.
6. The page refreshes showing the student's membership status and the "Open Chat" button.

**Alternative Flow — Group Full:**
- At step 4, if `member_count >= max_members`, the "Join Group" button is disabled and a "Full" label is displayed.

**Alternative Flow — Private Group:**
- Private groups do not appear in the public browse directory; a direct link is required.

---

### UC-05: Send a Message in Group Chat

| Field | Detail |
|-------|--------|
| **Use Case Name** | Send a Message in Group Chat |
| **Use Case ID** | UC-05 |
| **Actor(s)** | Student (primary) |
| **Description** | A group member sends a text message in the group's real-time chat channel. All online members receive the message instantly via WebSocket. |
| **Preconditions** | The student is logged in and is a member of the group. A WebSocket connection to the group's chat channel is established. |
| **Postconditions** | The message is persisted in the database and broadcast to all connected members of the group. |

**Main Flow:**
1. The student navigates to `/groups/{groupId}/chat`.
2. The system establishes a WebSocket connection authenticated by the student's JWT token.
3. Previous messages are loaded from the REST API and displayed in chronological order.
4. The student types a message in the input field and presses Enter or clicks Send.
5. The message is sent over the WebSocket connection to the server.
6. The server persists the message and broadcasts it to all members currently connected to the group channel.
7. The message appears in real-time in all connected members' chat windows.

**Alternative Flow — WebSocket Disconnected:**
- If the connection drops, the UI displays a "Reconnecting…" indicator and automatically attempts to reconnect with exponential back-off.

---

### UC-06: Schedule a Study Session

| Field | Detail |
|-------|--------|
| **Use Case Name** | Schedule a Study Session |
| **Use Case ID** | UC-06 |
| **Actor(s)** | Student (primary) |
| **Description** | A group member schedules a study session for a group, specifying the title, date, time, duration, and whether the session is online or in-person. |
| **Preconditions** | The student is logged in and is a member of at least one group. |
| **Postconditions** | A session record is created and appears on the weekly schedule calendar for all group members. |

**Main Flow:**
1. The student navigates to `/schedule`.
2. The student clicks the "+" button or clicks on a time slot in the calendar grid.
3. The "New Session" modal opens, pre-filled with the clicked date and time.
4. The student enters a title, selects a group, adjusts date/time if needed, sets duration, and toggles Online/In-person.
5. If online, the student optionally enters a join link. If in-person, the student optionally enters a location.
6. The student clicks "Schedule".
7. The system creates the session record linked to the group.
8. The modal closes and the session block appears on the calendar at the correct time slot.

**Alternative Flow — No Groups:**
- If the student is not a member of any group, the group dropdown is empty and a message prompts the student to join a group first.

---

### UC-07: Run Pomodoro Timer

| Field | Detail |
|-------|--------|
| **Use Case Name** | Run Pomodoro Timer |
| **Use Case ID** | UC-07 |
| **Actor(s)** | Student (primary) |
| **Description** | A student uses the built-in Pomodoro timer to structure their study session into focused work intervals followed by short breaks. Completed sessions are logged and contribute to analytics. |
| **Preconditions** | The student is logged in. |
| **Postconditions** | Completed Pomodoro intervals are recorded in the student's study log, updating total study hours and streak. |

**Main Flow:**
1. The student navigates to `/pomodoro`.
2. The student optionally adjusts the work duration (default 25 min) and break duration (default 5 min).
3. The student clicks "Start".
4. The timer counts down, displaying the remaining time prominently.
5. When the work interval ends, the system plays a notification sound and automatically switches to the break phase.
6. When the break ends, the system prompts the student to start the next interval.
7. After completing a session, the system records the session duration in `DailyStudyLog` and increments the streak if applicable.

**Alternative Flow — Pause / Stop:**
- The student may pause the timer at any point. Stopping mid-session logs the completed portion of the interval.

---

### UC-09: Ask the AI Study Assistant

| Field | Detail |
|-------|--------|
| **Use Case Name** | Ask the AI Study Assistant |
| **Use Case ID** | UC-09 |
| **Actor(s)** | Student (primary), AI Service (secondary) |
| **Description** | A student submits an academic question or prompt to the AI assistant and receives a generated response in a conversational chat interface. |
| **Preconditions** | The student is logged in. |
| **Postconditions** | The student's message and the AI response are stored in the conversation history. The student's monthly AI message count increments. |

**Main Flow:**
1. The student navigates to `/ai`.
2. The student types a question or prompt in the message input and submits.
3. The system appends the student's message to the conversation history display.
4. A loading indicator appears.
5. The system sends the conversation history and the new message to the AI service (OpenAI GPT).
6. The AI service returns a response.
7. The system appends the AI response to the display and removes the loading indicator.
8. Both the student's message and the AI response are persisted in the database.

**Alternative Flow — AI Service Unavailable:**
- If the AI service returns an error or `USE_MOCK_AI=True` is set, the system returns a pre-defined mock response and logs a warning.

---

### UC-11: Track Course Grades

| Field | Detail |
|-------|--------|
| **Use Case Name** | Track Course Grades |
| **Use Case ID** | UC-11 |
| **Actor(s)** | Student (primary) |
| **Description** | A student adds a course to the grade tracker, records individual assessments with their scores and weights, and the system automatically calculates a weighted average grade. |
| **Preconditions** | The student is logged in. |
| **Postconditions** | The course and its assessments are persisted. The weighted average is displayed with colour-coded feedback (green ≥ 90%, cyan ≥ 80%, amber ≥ 70%, red < 70%). |

**Main Flow:**
1. The student navigates to `/grades`.
2. The student clicks "Add Course" and enters a course name and optional target grade.
3. The system creates a course record and displays an empty assessment list.
4. The student clicks "Add Assessment" and enters: name, score, maximum score, weight percentage, and type (assignment / midterm / final).
5. The system saves the assessment and recalculates the weighted average: `Σ(score/max_score × weight) / Σ(weight) × 100`.
6. The weighted average is displayed with the appropriate colour code.
7. A progress bar visualises progress toward the target grade.

**Alternative Flow — Weights Exceed 100%:**
- The system displays a warning if total assessment weights exceed 100%, but still calculates based on the provided data.

---

### UC-13: List as a Peer Tutor / Request Tutoring

| Field | Detail |
|-------|--------|
| **Use Case Name** | List as Peer Tutor / Request Tutoring |
| **Use Case ID** | UC-13 |
| **Actor(s)** | Student — Tutor role; Student — Learner role |
| **Description** | A student who is proficient in a subject creates a free tutor listing. Another student finds the listing and sends a tutoring request. The tutor accepts or declines. |
| **Preconditions** | Both actors are logged in. The tutor does not already have an active listing. |
| **Postconditions** | A `TutoringRequest` record exists with status `accepted` or `declined`. |

**Main Flow (Tutor):**
1. The student navigates to `/tutoring` → "My Listings & Requests" tab.
2. The student clicks "Create Listing" and enters subjects, a bio, and availability.
3. The system creates a `TutorListing` record and displays it in the public directory.

**Main Flow (Learner):**
1. The learner navigates to `/tutoring` → "Find a Tutor" tab.
2. The learner searches by subject (e.g., "MATH201").
3. The learner clicks "Request Session" on a tutor's card and enters a message.
4. The system creates a `TutoringRequest` with status `pending` and notifies the tutor.

**Main Flow (Tutor — Respond):**
1. The tutor navigates to "My Listings & Requests" → "Incoming Requests".
2. The tutor clicks "Accept" or "Decline".
3. The system updates the request status and the learner sees the updated status on their "Sent Requests" tab.

**Alternative Flow — Duplicate Request:**
- If the learner has already sent a request to the same tutor, the "Request Session" button is disabled.

---

### UC-15: Receive Weekly Email Digest

| Field | Detail |
|-------|--------|
| **Use Case Name** | Receive Weekly Email Digest |
| **Use Case ID** | UC-15 |
| **Actor(s)** | System (primary), Student (recipient) |
| **Description** | The system automatically compiles and sends a personalised weekly summary email to each student who has the digest enabled, covering their study activity for the past seven days. |
| **Preconditions** | The student has `email_digest_enabled = True` in their profile. The management command `send_weekly_digest` is executed (e.g., via a scheduled cron job). |
| **Postconditions** | Each eligible student receives an email containing their study minutes, session count, current streak, and a recent activity summary. |

**Main Flow:**
1. The system executes the `send_weekly_digest` management command.
2. For each user with `email_digest_enabled = True`, the system:
   a. Queries `DailyStudyLog` for the last 7 days → computes total minutes and session count.
   b. Queries `StudyStreak` → retrieves current streak.
   c. Queries the last 5 `Notification` records → extracts activity summary items.
3. The system formats a plain-text + HTML email body with the collected data.
4. The system calls `send_mail()` with the user's email address.
5. The email is delivered via the configured email backend.

**Alternative Flow — Digest Disabled:**
- If `email_digest_enabled = False`, the system skips that user without sending an email.

**Alternative Flow — No Activity:**
- If the user has zero study minutes in the past 7 days, the digest is still sent with a motivational prompt to start a session.

---

## 6. Use Case Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         StudySync System                                  │
│                                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐    │
│   │  Authentication                                                   │    │
│   │    ○ Register Account (UC-01)                                     │    │
│   │    ○ Log In (UC-02) ────────────────── <<extends>> 2FA Verify    │    │
│   │    ○ Enable / Disable 2FA                                         │    │
│   └─────────────────────────────────────────────────────────────────┘    │
│                                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐    │
│   │  Study Groups                                                     │    │
│   │    ○ Create Study Group (UC-03)                                   │    │
│   │    ○ Join Study Group (UC-04)                                     │    │
│   │    ○ Leave Study Group                                            │    │
│   │    ○ Send Message in Chat (UC-05)                                 │    │
│   │    ○ Schedule Study Session (UC-06)                               │    │
│   │    ○ View Weekly Schedule (UC-07)                                 │    │
│   └─────────────────────────────────────────────────────────────────┘    │
│                                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐    │
│   │  Study Tools                                                      │    │
│   │    ○ Run Pomodoro Timer (UC-08)                                   │    │
│   │    ○ Ask AI Assistant (UC-09)                                     │    │
│   │    ○ Generate AI Study Plan (UC-10)                               │    │
│   │    ○ Track Course Grades (UC-11)                                  │    │
│   └─────────────────────────────────────────────────────────────────┘    │
│                                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐    │
│   │  Community & Discovery                                            │    │
│   │    ○ Browse Resource Library (UC-12)                              │    │
│   │    ○ List / Request Peer Tutoring (UC-13)                         │    │
│   │    ○ Edit Community Wiki Page (UC-14)                             │    │
│   │    ○ Browse Campus Study Spots                                    │    │
│   └─────────────────────────────────────────────────────────────────┘    │
│                                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐    │
│   │  Profile & Analytics                                              │    │
│   │    ○ View Analytics Dashboard                                     │    │
│   │    ○ Edit Public Portfolio                                        │    │
│   │    ○ View Leaderboard                                             │    │
│   └─────────────────────────────────────────────────────────────────┘    │
│                                                                            │
└──────────────────────────────────────────────────────────────────────────┘

Actors:
  👤 Student ──── interacts with all use cases above
  🤖 System  ──── Receive Weekly Email Digest (UC-15)
                   AI Study Plan generation (UC-10) [secondary]
                   Streak calculation (triggered post-UC-08)
```

### Actor — Use Case Relationships

```
Student ──── Register Account
        ──── Log In
               └── <<extends>> Verify TOTP Code  (when 2FA enabled)
        ──── Create Study Group
        ──── Join Study Group
               └── <<includes>> Browse Group Directory
        ──── Send Message in Chat
               └── <<includes>> Establish WebSocket Connection
        ──── Schedule Study Session
               └── <<includes>> Select Group
        ──── View Weekly Schedule Calendar
        ──── Run Pomodoro Timer
               └── <<includes>> Log Study Time
        ──── Ask AI Study Assistant
        ──── Generate AI Weekly Study Plan
               └── <<includes>> Ask AI Study Assistant (shared AI service)
        ──── Track Course Grades
               └── <<includes>> Calculate Weighted Average
        ──── Browse and Share Resources
        ──── List as Peer Tutor / Request Tutoring
        ──── Edit Community Wiki Page
        ──── View Analytics Dashboard
        ──── Edit Public Portfolio

System  ──── Receive Weekly Email Digest
               └── <<includes>> Query Study Logs
               └── <<includes>> Send Email
```

---

*End of Assignment 3*
