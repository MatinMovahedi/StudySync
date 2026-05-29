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
| FR-05 | The system shall provide real-time group chat within each study group using a managed Pub/Sub service (Ably), delivering messages and typing indicators to all connected members. |
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
| NFR-05 | Security | Real-time Pub/Sub connections shall use subscribe-only API keys on the client side; only the backend server holds the root publish key. |
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
| **Description** | A group member sends a text message in the group's real-time chat channel. All online members receive the message instantly via Ably Pub/Sub. |
| **Preconditions** | The student is logged in and is a member of the group. The Ably client is subscribed to the group's chat channel. |
| **Postconditions** | The message is persisted in the database and delivered to all members subscribed to the channel. |

**Main Flow:**
1. The student navigates to `/groups/{groupId}/chat`.
2. The system subscribes the Ably client to channel `chat-{groupId}` using a subscribe-only API key.
3. Previous messages are loaded from `GET /api/chat/{groupId}/messages/` and displayed in chronological order.
4. The student types a message in the input field and presses Enter or clicks Send.
5. The browser sends the message to `POST /api/chat/{groupId}/messages/` via HTTPS.
6. The server persists the message in the database and publishes it to the Ably channel using the root API key.
7. Ably delivers the message event to all subscribed members; each client appends it to the chat display.

**Alternative Flow — Connection Lost:**
- If the Ably connection drops, the client automatically reconnects and re-subscribes to the channel.

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

### UC-07: View Weekly Schedule Calendar

| Field | Detail |
|-------|--------|
| **Use Case Name** | View Weekly Schedule Calendar |
| **Use Case ID** | UC-07 |
| **Actor(s)** | Student (primary) |
| **Description** | A student views their upcoming study sessions on a weekly time-grid calendar. Sessions from all groups the student belongs to are displayed as colour-coded blocks; overlapping sessions are laid out side-by-side. |
| **Preconditions** | The student is logged in. |
| **Postconditions** | All study sessions scheduled for the current week are displayed accurately, with overlap resolved by a column-assignment layout algorithm. |

**Main Flow:**
1. The student navigates to `/schedule`.
2. The system fetches sessions for the current week via `GET /api/sessions/?from=...&to=...`.
3. The calendar renders a 7-column grid with hourly rows from 7 am to 10 pm.
4. Each session is positioned absolutely using its `scheduled_at` time and `duration_minutes`; overlapping sessions are placed side-by-side.
5. The current-time indicator (a horizontal brand-coloured line) is rendered in today's column.
6. The student may use ‹ / › navigation to move to the previous or next week.

**Alternative Flow — Click to Schedule:**
- The student clicks any empty time slot on the calendar grid.
- The system pre-fills a "New Session" modal with the clicked date and time.
- The student completes the form and clicks "Schedule" to create the session (see UC-06).

**Alternative Flow — No Sessions:**
- If no sessions exist for the selected week, the calendar grid is displayed empty with a prompt to create the first session.

---

### UC-08: Run Pomodoro Timer

| Field | Detail |
|-------|--------|
| **Use Case Name** | Run Pomodoro Timer |
| **Use Case ID** | UC-08 |
| **Actor(s)** | Student (primary) |
| **Description** | A student uses the built-in Pomodoro timer to structure their study session into focused work intervals followed by short breaks. Completed intervals are logged and contribute to study analytics and streak tracking. |
| **Preconditions** | The student is logged in and has navigated to the Pomodoro page. |
| **Postconditions** | Completed work intervals are recorded in `DailyStudyLog`. The student's study streak is updated if the session occurred on a new calendar day. XP is awarded to the student's gamification profile. |

**Main Flow:**
1. The student navigates to `/pomodoro`.
2. The system displays the timer with default settings: 25-minute work interval and 5-minute break.
3. The student optionally adjusts the work and break durations using the controls.
4. The student clicks **Start**.
5. The timer counts down, displaying the remaining time in large text.
6. When the work interval reaches zero, the system plays an audio notification and logs the completed interval.
7. The system awards XP and updates `DailyStudyLog` with the elapsed study minutes.
8. The timer automatically switches to the break phase and counts down.
9. When the break ends, the system plays a notification and prompts the student to begin the next interval.
10. The student clicks **Start** again to begin the next Pomodoro cycle.

**Alternative Flow A — Pause Timer:**
- At any point during step 5 or 8, the student may click **Pause**.
- The timer halts and a **Resume** button appears.
- The student clicks **Resume** to continue from the paused time.

**Alternative Flow B — Stop Early:**
- The student clicks **Stop** mid-interval.
- The system logs only the completed portion of the work interval to `DailyStudyLog`.
- A session summary is displayed showing intervals completed and total minutes studied.

**Alternative Flow C — Page Closed Mid-Session:**
- If the browser tab is closed during an active timer, no partial time is logged (the timer state is not persisted server-side).

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

### UC-10: Generate AI Weekly Study Plan

| Field | Detail |
|-------|--------|
| **Use Case Name** | Generate AI Weekly Study Plan |
| **Use Case ID** | UC-10 |
| **Actor(s)** | Student (primary), AI Service (secondary) |
| **Description** | A student provides a weekly study goal and available hours per day. The system uses AI to generate a personalised 7-day study plan broken into subject-specific time blocks, which is then displayed on a colour-coded weekly grid. |
| **Preconditions** | The student is logged in. The student has at least one entry in their profile courses. |
| **Postconditions** | A `StudyPlan` record is created and stored for the student. The 7-day grid is rendered on screen. The plan appears in the student's past plans list. |

**Main Flow:**
1. The student navigates to `/planner`.
2. The student types a study goal (e.g., "Prepare for MATH201 midterm and finish CS401 assignments").
3. The student sets the available hours per day using a slider (1–8 hours).
4. The student clicks **Generate Plan**.
5. The system reads the student's enrolled courses from their profile and their study activity from the last 7 days.
6. The system constructs a prompt and sends it to the AI service requesting a JSON array of `{day, subject, duration_min, task, priority}` objects.
7. The AI service returns the plan data.
8. The system saves the plan as a `StudyPlan` record linked to the student.
9. The system renders a 7-column weekly grid, with each study block colour-coded by subject.
10. The new plan is prepended to the past plans list at the bottom of the page.

**Alternative Flow A — AI Service Unavailable:**
- At step 6, if the AI service returns an error or `USE_MOCK_AI=True` is configured, the system returns a pre-defined sample plan covering common study tasks.
- A subtle notice informs the student that a mock plan was used.

**Alternative Flow B — No Courses in Profile:**
- At step 5, if the student has no courses listed, the system generates a generic plan based on the goal text alone, without subject-specific context.

**Alternative Flow C — View Past Plan:**
- The student clicks on a past plan in the list at the bottom of the page.
- The plan expands to show its 7-day grid without making a new API call.

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

### UC-12: Browse and Share Resources

| Field | Detail |
|-------|--------|
| **Use Case Name** | Browse and Share Resources |
| **Use Case ID** | UC-12 |
| **Actor(s)** | Student (primary) |
| **Description** | A student discovers community-curated study resources (links, notes, tutorials, cheat sheets) and optionally contributes a new resource. Resources can be upvoted, bookmarked, searched, and filtered by category. |
| **Preconditions** | The student is logged in. |
| **Postconditions** | If sharing: a new `Resource` record is persisted and visible to all users. If upvoting: the resource's upvote count is incremented. If bookmarking: a `ResourceSave` record is created for the student. |

**Main Flow (Browse):**
1. The student navigates to `/resources`.
2. The system fetches and displays resources sorted by upvotes (default: "Top").
3. The student optionally filters by category (notes, cheat sheet, tutorial, tool, video, article) or searches by keyword.
4. The student clicks the "Saved" toggle to view only their bookmarked resources.

**Main Flow (Share):**
1. The student clicks "Share" to open the resource creation modal.
2. The student enters a title (required), description (required), optional URL, optional tags, and a category.
3. The student submits the form.
4. The system creates the resource and closes the modal; the new resource appears at the top of the "New" sort view.

**Main Flow (Bookmark):**
1. The student clicks the bookmark icon on any resource card.
2. The system toggles the save state — creating or deleting a `ResourceSave` record.
3. The icon updates immediately to reflect the saved state.

**Alternative Flow — Upvote:**
- The student clicks the upvote chevron on a resource card; the system toggles the vote and updates the count.

---

### UC-14: Edit Community Wiki Page

| Field | Detail |
|-------|--------|
| **Use Case Name** | Edit Community Wiki Page |
| **Use Case ID** | UC-14 |
| **Actor(s)** | Student (primary) |
| **Description** | A community member edits a collaboratively maintained wiki page. Wiki pages are written in markdown and are versioned by last-updated timestamp. Any community member may edit any page. |
| **Preconditions** | The student is logged in and has joined the community. The wiki page exists (or the student creates a new one). |
| **Postconditions** | The wiki page's `content`, `updated_at`, and `updated_by` fields are updated in the database. The rendered page reflects the new content for all readers. |

**Main Flow:**
1. The student navigates to a community page (e.g., `/communities/cs-401`) and selects the "Wiki" tab.
2. The system lists existing wiki pages for the community.
3. The student clicks a page title to open it.
4. The system displays the rendered markdown content and an "Edit" button.
5. The student clicks "Edit"; the content switches to a markdown textarea pre-filled with the current content.
6. The student makes changes and clicks "Save".
7. The system sends `PUT /api/communities/{slug}/wiki/{pageSlug}/` with the updated content.
8. The server updates the record and returns the new content.
9. The page re-renders the updated markdown content.

**Alternative Flow — Create New Page:**
- The student clicks "New Page", enters a title and initial content, and submits.
- The system creates a new `WikiPage` record with a slug derived from the title.

**Alternative Flow — Concurrent Edit:**
- If another user saves the page while the student is editing, the student's save overwrites the intermediate version (last-write-wins; no conflict detection).

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
               └── <<includes>> Subscribe to Ably Channel
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
