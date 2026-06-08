# QA Learning Platform - Functional Requirements

## 1. Purpose

This document describes functional requirements for the QA Learning Platform.

The requirements are written so they can be used as a basis for a QA project, including:

- test plan;
- test scenarios;
- test cases;
- checklists;
- traceability matrix;
- bug reports;
- test summary report.

## 2. User Roles

### FR-ROLE-001: Student Role

The system shall allow a student to:

- register;
- log in;
- view courses;
- open modules and lessons;
- study lesson content;
- view slides;
- complete quizzes;
- submit homework;
- track progress;
- submit final projects;
- use AI Assistant;
- use mock interview preparation.

### FR-ROLE-002: Admin Role

The system shall allow an admin to:

- manage courses;
- manage modules;
- manage lessons;
- manage slides;
- manage examples;
- manage interactive tasks;
- manage homework;
- manage quizzes;
- review homework;
- review final projects;
- view student progress;
- manage AI settings;
- view AI usage;
- generate and attach AI images.

## 3. Authentication

### FR-AUTH-001: Student Registration

The system shall allow a new student to create an account using:

- full name;
- email;
- password.

Acceptance criteria:

- The email must be unique.
- The system must reject invalid or already registered emails.
- The system must reject invalid passwords according to backend validation rules.
- After successful registration, the user must be authenticated.
- After successful registration, the user must be redirected to the dashboard.

### FR-AUTH-002: Login

The system shall allow a registered user to log in using email and password.

Acceptance criteria:

- Valid credentials must authenticate the user.
- Invalid credentials must show an error message.
- After successful login, the token must be saved in browser storage.
- After successful login, the user must be redirected to the dashboard.

### FR-AUTH-003: Logout

The system shall allow an authenticated user to log out.

Acceptance criteria:

- The access token must be removed from browser storage.
- User data must be removed from browser storage.
- The user must no longer be treated as authenticated.

## 4. Course Catalog

### FR-COURSE-001: View Course Catalog

The system shall display the list of available courses.

Acceptance criteria:

- The course catalog must show all available course tracks.
- Each course must show title, section, description, and module count.
- If there are no courses, the system must show an empty state.

### FR-COURSE-002: Open Course Module

The system shall allow a student to open a course module.

Acceptance criteria:

- A module page must show module title and description.
- A module page must show all lessons inside the module.
- Lessons must be ordered by `order_index`.

## 5. Lessons

### FR-LESSON-001: View Lesson

The system shall allow a student to open a lesson page.

Acceptance criteria:

- The lesson page must show lesson title.
- The lesson page must show short description.
- The lesson page must show learning goals.
- The lesson page must show theory explanation.
- The lesson page must show key terms.
- The lesson page must show real-world example.
- The lesson page must show step-by-step explanation.
- The lesson page must show common mistakes.
- The lesson page must show practical use case.
- The lesson page must show summary.

### FR-LESSON-002: Lesson Progress Tracking

The system shall track when a student opens or completes a lesson.

Acceptance criteria:

- Opening a lesson must be recorded as progress.
- Completing a lesson must update progress.
- Updated progress must be visible on the dashboard and progress pages.

## 6. Lesson Slides

### FR-SLIDE-001: View Lesson Slides

The system shall display slides for each lesson.

Acceptance criteria:

- The lesson page must show the Slides section.
- Slides must be ordered by `order_index`.
- Each slide must show title and body.
- If a slide has an image, the image must be displayed.
- Slide images must load from backend static uploads.

### FR-SLIDE-002: Slide Drawer

The system shall provide a slide drawer for lesson slides.

Acceptance criteria:

- A student must be able to open the slide drawer.
- The drawer must show the list of slides.
- The drawer must show the active slide.
- The student must be able to navigate to the previous and next slide.
- The drawer must support closing with the close button.
- The drawer must support closing with the Escape key.

### FR-SLIDE-003: Fullscreen Slide Image

The system shall allow fullscreen preview for slides with images.

Acceptance criteria:

- If a slide has an image, the user must be able to open it fullscreen.
- Fullscreen mode must show the image, slide title, and slide number.
- Fullscreen mode must support previous and next slide navigation.
- Fullscreen mode must support closing.

## 7. Examples

### FR-EXAMPLE-001: View Lesson Examples

The system shall display practical examples for each lesson.

Acceptance criteria:

- The lesson page must show an Examples section.
- Each example must show title and content.
- Example content must preserve line breaks.

### FR-EXAMPLE-002: QA Artifact Examples

The system shall provide practical QA artifact examples.

Acceptance criteria:

- The platform must include checklist examples.
- The platform must include traceability matrix examples.
- The platform must include test plan examples.
- The platform must include test case examples.
- The platform must include bug report examples.
- The platform must include test summary report examples.

## 8. Interactive Practice

### FR-PRACTICE-001: View Interactive Practice

The system shall show interactive practice tasks on the lesson page.

Acceptance criteria:

- The lesson page must show task type.
- The lesson page must show task prompt.
- The lesson page must show expected answer guide.
- The expected answer guide may be hidden inside expandable details.

## 9. Homework

### FR-HOMEWORK-001: View Homework

The system shall allow a student to open homework for a lesson.

Acceptance criteria:

- Homework page must show task description.
- Homework page must show expected result.
- Homework page must allow text submission.
- Homework page may allow file upload if enabled.

### FR-HOMEWORK-002: Submit Homework

The system shall allow a student to submit homework.

Acceptance criteria:

- A student must be able to submit an answer.
- Submitted homework must be saved.
- Homework submission must update student progress.
- Submitted homework must be available for admin review.

### FR-HOMEWORK-003: Review Homework

The system shall allow an admin to review homework submissions.

Acceptance criteria:

- Admin must see submitted homework.
- Admin must see student answer.
- Admin must be able to update homework status.

## 10. Quizzes

### FR-QUIZ-001: View Quiz

The system shall allow a student to open a quiz for a lesson.

Acceptance criteria:

- Quiz page must show quiz title.
- Quiz page must show questions.
- Each question must show answer options.

### FR-QUIZ-002: Submit Quiz

The system shall allow a student to submit quiz answers.

Acceptance criteria:

- Student must be able to select answers.
- The system must calculate score.
- The system must show quiz result.
- Quiz completion must update progress.

### FR-QUIZ-003: Admin Quiz Management

The system shall allow an admin to manage quiz questions.

Acceptance criteria:

- Admin must be able to create quiz questions.
- Admin must be able to update quiz questions.
- Admin must be able to delete quiz questions.
- Admin must be able to define correct answers.

## 11. Dashboard

### FR-DASH-001: Student Dashboard

The system shall show a student dashboard.

Acceptance criteria:

- Dashboard must show completed lessons count.
- Dashboard must show opened lessons count.
- Dashboard must show completed quizzes count.
- Dashboard must show submitted homework count.
- Dashboard must show current module.
- Dashboard must show current lesson.
- Dashboard must show recommended next lesson.
- Dashboard must show AI usage for the current day.
- Dashboard must show final project progress.

## 12. Progress

### FR-PROGRESS-001: View Learning Progress

The system shall allow a student to view learning progress.

Acceptance criteria:

- Progress page must show lesson progress.
- Progress page must show quiz progress.
- Progress page must show homework progress.
- Progress page must show certificate readiness indicators.

### FR-PROGRESS-002: Admin Student Progress

The system shall allow an admin to view student progress.

Acceptance criteria:

- Admin must see student email.
- Admin must see lesson title.
- Admin must see opened status.
- Admin must see completed status.
- Admin must see quiz completion status.
- Admin must see homework submission status.
- Admin must see last update date.

## 13. Gamification

### FR-GAME-001: Player Stats

The system shall show gamification stats for a student.

Acceptance criteria:

- The system must show XP.
- The system must show level.
- The system must show rank.
- The system must show next rank.
- The system must show streak days.
- The system must show unlocked achievements.

### FR-GAME-002: Achievements

The system shall unlock achievements based on student activity.

Acceptance criteria:

- Opening lessons may unlock achievements.
- Completing lessons may unlock achievements.
- Completing quizzes may unlock achievements.
- Submitting homework may unlock achievements.
- Using AI Assistant may unlock achievements.
- Submitting final projects may unlock achievements.

### FR-GAME-003: Leaderboard

The system shall show a leaderboard.

Acceptance criteria:

- Leaderboard must show student position.
- Leaderboard must show student name or email.
- Leaderboard must show XP.
- Leaderboard must show level.
- Leaderboard must show rank.

## 14. Final Projects

### FR-PROJECT-001: View Final Projects

The system shall allow students to view final projects.

Acceptance criteria:

- Final project page must show available final projects.
- Each project must show title and requirements.

### FR-PROJECT-002: Submit Final Project

The system shall allow students to submit a final project.

Acceptance criteria:

- Student must be able to submit project text.
- Student may attach a file URL.
- Submission must be saved with status.
- Submission must be available for admin review.

### FR-PROJECT-003: Review Final Project

The system shall allow admins to review final project submissions.

Acceptance criteria:

- Admin must see submitted final projects.
- Admin must be able to approve submission.
- Admin must be able to mark submission as needing changes.

## 15. Certificate Readiness

### FR-CERT-001: View Certificate Readiness

The system shall show certificate readiness based on student progress.

Acceptance criteria:

- Certificate page must show required learning milestones.
- Certificate page must show completed and remaining requirements.
- Certificate readiness must depend on lessons, quizzes, homework, and final projects.

## 16. Mock Interview

### FR-INTERVIEW-001: View Mock Interview Section

The system shall provide a mock interview page.

Acceptance criteria:

- The page must be available from navigation.
- The page must show interview topics.
- The page must show the total number of topics.
- The page must show the total number of questions.

### FR-INTERVIEW-002: Interview Questions by Topic

The system shall group interview questions by testing topic.

Acceptance criteria:

- Questions must be grouped by topic.
- Each topic must show title and focus.
- Each question must be expandable.
- Each question must include a strong answer anchor.
- Each question must include a practice drill.

Required topics:

- QA Foundations;
- SDLC and STLC;
- Test Design;
- QA Documentation;
- Testing Types;
- API and Web Testing;
- SQL, Git, Jira, and Agile;
- Automation Basics;
- AI for QA.

## 17. AI Assistant

### FR-AI-001: Open AI Assistant

The system shall allow a student to open AI Assistant from lesson pages.

Acceptance criteria:

- AI Assistant button must be visible on lesson pages.
- Clicking the button must open the AI Assistant panel.
- Student must be able to close the panel.

### FR-AI-002: Send AI Message

The system shall allow a student to send a message to AI Assistant.

Acceptance criteria:

- Student must be able to enter a message.
- Student must be able to submit the message.
- The system must show the student message.
- The system must show the AI response.
- If the AI request fails, the system must show an error message.

### FR-AI-003: AI Quick Actions

The system shall provide AI quick actions.

Acceptance criteria:

- Student must be able to request topic explanation.
- Student must be able to request more examples.
- Student must be able to request a practice task.
- Student must be able to request an extra quiz.
- Student must be able to request homework help.
- Student must be able to request automation help.

### FR-AI-004: Backend-Only AI Provider Calls

The system shall send AI provider requests only from the backend.

Acceptance criteria:

- Frontend must not store AI provider API keys.
- Frontend must not call OpenAI or OpenRouter directly.
- Backend must process AI chat requests.
- Backend must enforce AI usage limits.

## 18. AI Image Generation

### FR-IMG-001: Generate AI Image

The system shall allow admins to generate AI images for learning content.

Acceptance criteria:

- Admin must be able to enter image prompt.
- Admin must be able to choose target type.
- Admin must be able to choose image style.
- Admin must be able to choose image size.
- Generated image must be saved under backend uploads.
- Generated image metadata must be saved.

### FR-IMG-002: Attach AI Image

The system shall allow admins to attach generated AI images to learning content.

Acceptance criteria:

- Admin must be able to select generated image.
- Admin must be able to attach image to lesson-related content.
- Attached image must be visible in the related student-facing view when supported.

## 19. Admin Content Management

### FR-ADMIN-001: Manage Courses

The system shall allow admin users to manage courses.

Acceptance criteria:

- Admin must be able to create courses.
- Admin must be able to update courses.
- Admin must be able to view course list.

### FR-ADMIN-002: Manage Modules

The system shall allow admin users to manage modules.

Acceptance criteria:

- Admin must be able to create modules.
- Admin must be able to update modules.
- Admin must be able to delete modules.
- Module order must be configurable.

### FR-ADMIN-003: Manage Lessons

The system shall allow admin users to manage lessons.

Acceptance criteria:

- Admin must be able to create lessons.
- Admin must be able to update lessons.
- Admin must be able to delete lessons.
- Lesson order must be configurable.

### FR-ADMIN-004: Manage Slides

The system shall allow admin users to manage slides.

Acceptance criteria:

- Admin must be able to create slides.
- Admin must be able to update slides.
- Admin must be able to attach image URL to slides.
- Slide order must be configurable.

### FR-ADMIN-005: Manage Examples

The system shall allow admin users to manage lesson examples.

Acceptance criteria:

- Admin must be able to create examples.
- Admin must be able to update examples.
- Examples must be connected to lessons.

### FR-ADMIN-006: Manage Interactive Tasks

The system shall allow admin users to manage interactive tasks.

Acceptance criteria:

- Admin must be able to create interactive tasks.
- Admin must be able to update interactive tasks.
- Task must include type, prompt, and expected answer.

## 20. Error Handling

### FR-ERROR-001: API Error Handling

The system shall handle API errors gracefully.

Acceptance criteria:

- If backend is unavailable, frontend must not crash.
- User-facing pages must show clear fallback or error message.
- Admin panels must show error messages when loading or saving fails.

### FR-ERROR-002: Empty States

The system shall show empty states when data is missing.

Acceptance criteria:

- Course catalog must show empty state if no courses exist.
- Progress pages must show empty state if no progress exists.
- Admin panels must show empty state if there are no records.

## 21. Security Requirements

### FR-SEC-001: Token Storage

The system shall store the user access token after successful authentication.

Acceptance criteria:

- Token must be saved after login.
- Token must be saved after registration.
- Token must be removed after logout.

### FR-SEC-002: Protected User Data

The system shall require authorization for user profile operations.

Acceptance criteria:

- Profile data must require a valid bearer token.
- Invalid token must be rejected.
- Missing token must be rejected.

### FR-SEC-003: API Keys

The system shall keep provider API keys out of frontend code.

Acceptance criteria:

- AI provider keys must be stored only in backend environment variables.
- `NEXT_PUBLIC_*` variables must not contain secrets.

## 22. Data Requirements

### FR-DATA-001: Persistent Data

The system shall persist core platform data in PostgreSQL.

Required data:

- users;
- user profiles;
- courses;
- modules;
- lessons;
- slides;
- examples;
- interactive tasks;
- homework;
- homework submissions;
- quizzes;
- quiz attempts;
- progress;
- final projects;
- final project submissions;
- AI usage logs;
- AI generated images;
- gamification stats;
- achievements.

### FR-DATA-002: Seed Data

The system shall provide seed data for local testing.

Acceptance criteria:

- Seed data must create demo admin user.
- Seed data must create demo student user.
- Seed data must create courses.
- Seed data must create modules.
- Seed data must create lessons.
- Seed data must create slides.
- Seed data must create examples.
- Seed data must create homework.
- Seed data must create quizzes.
- Seed data must create final projects.

## 23. QA Project Deliverables

Based on these requirements, a QA project should include:

- requirements analysis;
- test plan;
- test strategy;
- test scenarios;
- test cases;
- checklists;
- traceability matrix;
- bug reports;
- test summary report.

Recommended traceability format:

```text
Requirement ID | Requirement | Test Scenario | Test Case ID | Priority | Status
```

Recommended test case format:

```text
Test Case ID
Requirement ID
Title
Priority
Preconditions
Test Data
Steps
Expected Result
Actual Result
Status
```
