import {
  ArrowRight,
  Bot,
  BookOpen,
  Bug,
  ClipboardCheck,
  FileCheck2,
  FileText,
  GraduationCap,
  Layers,
  ListChecks,
  Lock,
  MessageSquareText,
  Trophy,
  UserCog,
} from "lucide-react";

type RequirementGroup = {
  id: string;
  title: string;
  summary: string;
  icon: typeof FileText;
  requirements: string[];
  qaArtifacts: string[];
};

const requirementGroups: RequirementGroup[] = [
  {
    id: "AUTH",
    title: "Authentication",
    summary: "Registration, login, logout, token storage, and dashboard redirect.",
    icon: Lock,
    requirements: [
      "Student can register with full name, email, and password.",
      "System rejects duplicate email and invalid registration data.",
      "Student can log in with valid credentials.",
      "System shows an error for invalid credentials.",
      "After successful login or registration, the user is redirected to Dashboard.",
      "Logout removes token and user data from browser storage.",
    ],
    qaArtifacts: ["Positive/negative auth test cases", "Validation checklist", "Auth bug report template"],
  },
  {
    id: "COURSE",
    title: "Course Catalog",
    summary: "Course tracks, modules, lesson list, and empty states.",
    icon: BookOpen,
    requirements: [
      "Course catalog shows all available course tracks.",
      "Each course shows title, section, description, and module count.",
      "Course modules are visible and ordered correctly.",
      "Module page shows module title, description, and ordered lessons.",
      "Empty state is shown when no courses are available.",
    ],
    qaArtifacts: ["Course catalog checklist", "Module navigation test cases", "Empty state tests"],
  },
  {
    id: "LESSON",
    title: "Lessons",
    summary: "Lesson content, learning materials, and progress tracking.",
    icon: GraduationCap,
    requirements: [
      "Lesson page shows title, short description, learning goals, theory, key terms, real-world example, steps, mistakes, use case, and summary.",
      "Opening a lesson records lesson progress.",
      "Completing a lesson updates progress.",
      "Progress is visible on Dashboard and Progress pages.",
    ],
    qaArtifacts: ["Lesson content checklist", "Progress traceability matrix", "Lesson view test cases"],
  },
  {
    id: "SLIDE",
    title: "Lesson Slides",
    summary: "Slide cards, images, drawer, navigation, and fullscreen mode.",
    icon: Layers,
    requirements: [
      "Lesson page shows Slides section.",
      "Slides are ordered by order index.",
      "Each slide shows title and body.",
      "If a slide has an image, the image is displayed from backend uploads.",
      "Student can open slide drawer.",
      "Student can navigate previous and next slides.",
      "Slides with images can be opened fullscreen.",
    ],
    qaArtifacts: ["Slide rendering checklist", "Image loading test cases", "Drawer navigation tests"],
  },
  {
    id: "EXAMPLE",
    title: "Examples and QA Artifacts",
    summary: "Practical examples for checklists, traceability, test plans, cases, and bug reports.",
    icon: FileCheck2,
    requirements: [
      "Lesson page shows Examples section.",
      "Each example shows title and content.",
      "Example content preserves line breaks.",
      "Platform includes checklist examples.",
      "Platform includes traceability matrix examples.",
      "Platform includes test plan, test case, bug report, and test summary report examples.",
    ],
    qaArtifacts: ["QA artifact checklist", "Example coverage matrix", "Content verification cases"],
  },
  {
    id: "PRACTICE",
    title: "Interactive Practice",
    summary: "Practice tasks with prompts and expected answer guides.",
    icon: ClipboardCheck,
    requirements: [
      "Lesson page shows interactive practice tasks.",
      "Each task shows task type, prompt, and expected answer guide.",
      "Expected answer guide can be hidden inside expandable details.",
    ],
    qaArtifacts: ["Practice task checklist", "Expandable details UI tests"],
  },
  {
    id: "HOMEWORK",
    title: "Homework",
    summary: "Homework view, submission, progress update, and admin review.",
    icon: ListChecks,
    requirements: [
      "Student can open homework for a lesson.",
      "Homework page shows task description and expected result.",
      "Student can submit text answer.",
      "Submitted homework is saved and updates progress.",
      "Admin can review homework submissions and update status.",
    ],
    qaArtifacts: ["Homework submission test cases", "Admin review checklist", "Submission bug report examples"],
  },
  {
    id: "QUIZ",
    title: "Quizzes",
    summary: "Quiz questions, answer submission, scoring, and admin question management.",
    icon: FileText,
    requirements: [
      "Student can open quiz for a lesson.",
      "Quiz page shows title, questions, and answer options.",
      "Student can submit selected answers.",
      "System calculates score and shows result.",
      "Quiz completion updates progress.",
      "Admin can create, update, and delete quiz questions.",
    ],
    qaArtifacts: ["Quiz scoring test cases", "Question management checklist", "Answer validation matrix"],
  },
  {
    id: "DASH",
    title: "Dashboard and Progress",
    summary: "Student progress, recommended next lesson, AI usage, and final project progress.",
    icon: ClipboardCheck,
    requirements: [
      "Dashboard shows completed lessons, opened lessons, completed quizzes, and submitted homework.",
      "Dashboard shows current module, current lesson, and recommended next lesson.",
      "Dashboard shows AI usage for the current day.",
      "Progress page shows learning progress and certificate readiness indicators.",
      "Admin can view student progress by lesson, quiz, homework, and update date.",
    ],
    qaArtifacts: ["Dashboard checklist", "Progress calculation test cases", "Admin progress matrix"],
  },
  {
    id: "GAME",
    title: "Gamification",
    summary: "XP, levels, ranks, achievements, streaks, and leaderboard.",
    icon: Trophy,
    requirements: [
      "System shows student XP, level, rank, next rank, and streak days.",
      "Achievements unlock based on learning activity.",
      "Leaderboard shows position, student identity, XP, level, and rank.",
      "Gamification updates after relevant progress changes.",
    ],
    qaArtifacts: ["XP calculation tests", "Achievement traceability matrix", "Leaderboard checklist"],
  },
  {
    id: "PROJECT",
    title: "Final Projects and Certificate",
    summary: "Final project view, submission, admin review, and certificate readiness.",
    icon: FileCheck2,
    requirements: [
      "Student can view available final projects.",
      "Each project shows title and requirements.",
      "Student can submit project text and optional file URL.",
      "Admin can approve submission or mark it as needing changes.",
      "Certificate page shows completed and remaining readiness requirements.",
    ],
    qaArtifacts: ["Final project test cases", "Certificate readiness checklist", "Review status matrix"],
  },
  {
    id: "INTERVIEW",
    title: "Mock Interview",
    summary: "Interview topics, questions, strong answer anchors, and practice drills.",
    icon: MessageSquareText,
    requirements: [
      "Mock Interview page is available from navigation.",
      "Page shows topic groups and total question count.",
      "Questions are grouped by testing topic.",
      "Each question is expandable.",
      "Each question includes a strong answer anchor and practice drill.",
    ],
    qaArtifacts: ["Interview content checklist", "Accordion interaction tests", "Topic coverage matrix"],
  },
  {
    id: "AI",
    title: "AI Assistant and AI Images",
    summary: "Lesson AI assistant, quick actions, backend-only provider calls, and image generation.",
    icon: Bot,
    requirements: [
      "AI Assistant button is visible on lesson pages.",
      "Student can open and close AI Assistant panel.",
      "Student can send a message and see AI response.",
      "AI quick actions support explanations, examples, tasks, quizzes, homework help, and automation help.",
      "AI provider calls are processed only by backend.",
      "Admin can generate AI images and attach them to learning content.",
    ],
    qaArtifacts: ["AI assistant test cases", "Provider security checklist", "AI image generation tests"],
  },
  {
    id: "ADMIN",
    title: "Admin Content Management",
    summary: "Course, module, lesson, slide, example, task, homework, quiz, and review management.",
    icon: UserCog,
    requirements: [
      "Admin can manage courses, modules, and lessons.",
      "Admin can manage slides and attach image URLs.",
      "Admin can manage examples and interactive tasks.",
      "Admin can manage homework and quizzes.",
      "Admin can review homework and final project submissions.",
      "Admin can manage AI settings and view AI usage.",
    ],
    qaArtifacts: ["Admin CRUD checklist", "Role-based test scenarios", "Content management traceability matrix"],
  },
  {
    id: "SEC",
    title: "Security and Data",
    summary: "Token handling, protected profile operations, API keys, persistence, and seed data.",
    icon: Bug,
    requirements: [
      "Profile operations require a valid bearer token.",
      "Invalid or missing token is rejected.",
      "AI provider API keys are stored only in backend environment variables.",
      "Core platform data persists in PostgreSQL.",
      "Seed data creates demo users, courses, modules, lessons, slides, examples, homework, quizzes, and final projects.",
    ],
    qaArtifacts: ["Security checklist", "Token tests", "Seed data verification matrix"],
  },
];

const qaDeliverables = [
  {
    id: "requirements-analysis",
    title: "Requirements analysis",
    purpose: "Validate business and functional requirements before test design starts.",
    items: [
      "Identify clear, testable, incomplete, duplicated, and conflicting requirements.",
      "Map every requirement to a functional area and expected user role.",
      "Record open questions, assumptions, dependencies, and acceptance criteria.",
    ],
  },
  {
    id: "test-plan",
    title: "Test plan",
    purpose: "Define QA scope, schedule, resources, risks, environments, and exit criteria.",
    items: [
      "Describe what will be tested across auth, courses, lessons, homework, quizzes, AI, admin, and docs.",
      "Define in-scope, out-of-scope, test environment, test data, responsibilities, and deliverables.",
      "Add entry criteria, exit criteria, risks, mitigation plan, and reporting cadence.",
    ],
  },
  {
    id: "test-strategy",
    title: "Test strategy",
    purpose: "Describe the overall testing approach for quality coverage.",
    items: [
      "Define test levels: smoke, functional, regression, API, UI, integration, and basic security.",
      "Set priorities for role-based access, core learning flow, admin CRUD, and progress tracking.",
      "Define automation candidates and manual exploratory testing areas.",
    ],
  },
  {
    id: "test-scenarios",
    title: "Test scenarios",
    purpose: "Create high-level user journeys that cover real product behavior.",
    items: [
      "Cover student registration, login, learning, quiz, homework, progress, final project, and certificate readiness.",
      "Cover admin login, content management, user management, reviews, AI settings, and generated assets.",
      "Include positive, negative, permission, empty state, and data persistence scenarios.",
    ],
  },
  {
    id: "test-cases",
    title: "Test cases",
    purpose: "Create executable step-by-step checks with expected results.",
    items: [
      "Each case must include ID, title, preconditions, steps, test data, expected result, priority, and status.",
      "Create cases for every functional area and every critical role-based permission.",
      "Include negative tests for invalid credentials, missing data, forbidden admin access, and broken content states.",
    ],
  },
  {
    id: "checklists",
    title: "Checklists",
    purpose: "Support fast smoke, regression, and release verification.",
    items: [
      "Create smoke checklist for app launch, login, dashboard, lesson, quiz, homework, and admin access.",
      "Create UI checklist for navigation, responsive layout, empty states, forms, validation, and errors.",
      "Create release checklist for seed data, slides, docs, API health, and Docker startup.",
    ],
  },
  {
    id: "traceability-matrix",
    title: "Traceability matrix",
    purpose: "Connect requirements to scenarios, test cases, bugs, and release status.",
    items: [
      "Map each FR ID to related test scenarios and test cases.",
      "Track execution status, linked defects, priority, and coverage gaps.",
      "Use the matrix to prove that all critical requirements are covered before release.",
    ],
  },
  {
    id: "bug-reports",
    title: "Bug reports",
    purpose: "Document defects clearly enough for developers to reproduce and fix.",
    items: [
      "Each bug must include title, environment, severity, priority, preconditions, steps, actual result, expected result, and evidence.",
      "Link bugs to requirement IDs, test case IDs, screenshots, logs, or API responses where relevant.",
      "Cover functional, UI, validation, data, permission, and content defects.",
    ],
  },
  {
    id: "test-summary-report",
    title: "Test summary report",
    purpose: "Summarize QA execution results and release readiness.",
    items: [
      "Include tested scope, build/version, executed tests, pass/fail/blocked counts, and defect summary.",
      "Describe unresolved risks, known issues, skipped areas, and coverage limitations.",
      "Provide final QA recommendation: ready, ready with risks, or not ready.",
    ],
  },
];

export default function DocsPage() {
  return (
    <main id="top" className="mx-auto max-w-7xl px-4 py-8">
      <section className="border-b border-slate-200 pb-6">
        <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-coral">
          <FileText className="h-4 w-4" />
          Project docs
        </p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-3xl font-bold text-ink">Functional requirements for QA project practice</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Use these requirements to build QA artifacts for the platform: test plan, scenarios, cases, checklists, traceability matrix,
              bug reports, and test summary.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-2xl font-bold text-ink">{requirementGroups.length}</p>
            <p className="text-sm text-slate-500">functional areas covered</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">QA deliverables based on these requirements</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {qaDeliverables.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="group flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-coral hover:bg-coral/5 hover:text-ink"
            >
              <span>{item.title}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-coral" />
            </a>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {qaDeliverables.map((item, index) => (
          <article key={item.id} id={item.id} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-coral">QA-{String(index + 1).padStart(2, "0")}</p>
                <h2 className="mt-1 text-xl font-semibold text-ink">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{item.purpose}</p>
              </div>
              <a href="#top" className="text-sm font-medium text-coral">
                Back to list
              </a>
            </div>
            <ul className="mt-4 space-y-2">
              {item.items.map((requirement) => (
                <li key={requirement} className="rounded-md border border-slate-200 p-3 text-sm leading-6 text-slate-700">
                  {requirement}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-6 space-y-4">
        {requirementGroups.map((group) => (
          <article key={group.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100">
                  <group.icon className="h-5 w-5 text-mint" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-coral">FR-{group.id}</p>
                  <h2 className="mt-1 text-xl font-semibold text-ink">{group.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{group.summary}</p>
                </div>
              </div>
              <span className="inline-flex w-fit rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {group.requirements.length} requirements
              </span>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
              <div>
                <h3 className="text-sm font-semibold text-ink">Functional requirements</h3>
                <ul className="mt-2 space-y-2">
                  {group.requirements.map((requirement, index) => (
                    <li key={requirement} className="rounded-md border border-slate-200 p-3 text-sm leading-6 text-slate-700">
                      <span className="font-semibold text-ink">FR-{group.id}-{String(index + 1).padStart(3, "0")}:</span> {requirement}
                    </li>
                  ))}
                </ul>
              </div>

              <aside className="rounded-md bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-ink">QA artifacts to create</h3>
                <ul className="mt-2 space-y-2">
                  {group.qaArtifacts.map((artifact) => (
                    <li key={artifact} className="text-sm leading-6 text-slate-700">
                      - {artifact}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
