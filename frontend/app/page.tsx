import Link from "next/link";
import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";
import {
  ArrowRight,
  Award,
  Bot,
  CheckCircle2,
  FileText,
  FlaskConical,
  GraduationCap,
  Layers,
  MessageSquareText,
  Sparkles,
  Trophy
} from "lucide-react";
import { api } from "@/lib/api";

const SECTION_ACCENT: Record<string, { dot: string; chip: string; ring: string }> = {
  manual: { dot: "bg-coral", chip: "text-coral", ring: "group-hover:border-coral" },
  automation: { dot: "bg-mint", chip: "text-mint", ring: "group-hover:border-mint" },
  ai_for_qa: { dot: "bg-amber", chip: "text-amber", ring: "group-hover:border-amber" },
  istqb: { dot: "bg-ink", chip: "text-ink", ring: "group-hover:border-ink" }
};

const LOOP = ["Topic", "Theory", "Example", "Practice", "Homework", "Quiz", "Progress", "Project"];

const FEATURES = [
  { icon: Bot, title: "Built-in AI tutor", body: "Explain, generate tasks and quizzes, check homework, and get automation help — context-aware to each lesson." },
  { icon: Trophy, title: "XP, ranks & leaderboard", body: "Earn XP for lessons, quizzes, and homework. Climb ranks and track streaks as you progress." },
  { icon: MessageSquareText, title: "Mock interviews", body: "Practice explaining your QA reasoning the way you would in a real interview." },
  { icon: FlaskConical, title: "Live API testing", body: "Embedded Swagger explorer plus an HTTP method and status-code reference to practice real requests." },
  { icon: FileText, title: "QA documentation", body: "Test plans, cases, checklists, bug reports, traceability — the artifacts the job actually needs." },
  { icon: Award, title: "Certificate-ready", body: "Complete lessons, quizzes, homework, and final projects to unlock certificate readiness." }
];

export default async function HomePage() {
  const courses = await api.courses().catch(() => []);
  const totalModules = courses.reduce((n, c) => n + c.modules.length, 0);
  const totalLessons = courses.reduce(
    (n, c) => n + c.modules.reduce((m, mod) => m + mod.lessons.length, 0),
    0
  );

  const stats = [
    { label: "Courses", value: courses.length || 4 },
    { label: "Modules", value: totalModules || 30 },
    { label: "Lessons", value: totalLessons ? `${totalLessons}+` : "100+" }
  ];

  return (
    <main className="bg-paper">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-mint/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-coral/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <Sparkles className="h-3.5 w-3.5 text-amber" /> Manual · Automation · AI for QA · ISTQB
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-ink md:text-6xl">
              Become a job-ready
              <span className="block text-coral">QA engineer.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-7 text-slate-600">
              Learn testing the way teams actually work — theory, worked examples, hands-on practice, homework,
              quizzes, and a built-in AI tutor. From manual QA fundamentals to automation and the ISTQB exam.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Start learning <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-ink transition hover:border-mint hover:bg-paper"
              >
                Create free account
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg border border-slate-200 bg-paper p-4">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">{s.label}</dt>
                  <dd className="mt-1 text-2xl font-bold text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Learning loop card */}
          <div className="flex items-center">
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-ink">Your learning loop</p>
              <p className="mt-1 text-sm text-slate-500">Every lesson follows the same proven path.</p>
              <div className="mt-5 grid gap-2.5">
                {LOOP.map((step, i) => (
                  <div
                    key={step}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-paper px-4 py-2.5"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium text-ink">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      {step}
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-mint" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-ink px-4 py-3 text-white">
                <Bot className="h-5 w-5 shrink-0 text-amber" />
                <span className="text-sm">AI tutor available on every lesson.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink">Learning paths</h2>
            <p className="mt-2 text-slate-600">Pick a track and start with the fundamentals.</p>
          </div>
          <Link href="/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-coral hover:underline">
            All courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => {
            const accent = SECTION_ACCENT[course.section] ?? SECTION_ACCENT.manual;
            const lessons = course.modules.reduce((m, mod) => m + mod.lessons.length, 0);
            return (
              <Link
                key={course.id}
                href="/courses"
                className={`group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${accent.ring}`}
              >
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
                  {course.section.replaceAll("_", " ")}
                </span>
                <h3 className="mt-3 text-lg font-bold text-ink">{course.title}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">{course.description}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" /> {course.modules.length} modules
                  </span>
                  <span>{lessons} lessons</span>
                  <ArrowRight className={`ml-auto h-4 w-4 transition group-hover:translate-x-1 ${accent.chip}`} />
                </div>
              </Link>
            );
          })}
          {courses.length === 0 ? (
            <p className="col-span-full rounded-lg border border-slate-200 bg-white p-6 text-slate-600">
              Courses are loading. Browse the <Link href="/courses" className="font-semibold text-coral">catalog</Link>.
            </p>
          ) : null}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight text-ink">Everything you need to get hired</h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Not just videos — a full practice environment with tools real QA engineers use every day.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="rounded-2xl border border-slate-200 bg-paper p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white shadow-sm">
                  <f.icon className="h-5 w-5 text-coral" />
                </div>
                <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">Climb the leaderboard</h2>
            <p className="mt-3 max-w-md text-slate-600">
              Earn XP for finishing lessons, passing quizzes, submitting homework, and practising test documentation.
              Rank up from QA Rookie to QA Champion.
            </p>
            <Link
              href="/game"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
            >
              Open player hub <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <LeaderboardPanel />
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-mint/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-coral/20 blur-3xl" />
          <GraduationCap className="relative mx-auto h-10 w-10 text-amber" />
          <h2 className="relative mt-4 text-3xl font-bold tracking-tight md:text-4xl">Start your QA journey today</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-slate-300">
            Free to start. Browse the catalog, then create an account to track progress, earn XP, and use the AI tutor.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-slate-100">
              Create free account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/courses" className="inline-flex items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Browse courses
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
