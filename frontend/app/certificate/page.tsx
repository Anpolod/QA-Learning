import Link from "next/link";
import { Award, CheckCircle2, ClipboardCheck, ClipboardList, Target } from "lucide-react";
import { ProgressCard } from "@/components/course/ProgressCard";
import { api } from "@/lib/api";

const totalFinalProjects = 3;

export default async function CertificatePage() {
  const defaultProgress = {
    completedLessons: 0,
    openedLessons: 0,
    quizCompleted: 0,
    homeworkSubmitted: 0,
    totalLessons: 9,
    currentModule: "Manual QA Foundations",
    currentLesson: "QA / QC / Testing basics",
    recommendedNextLesson: "QA / QC / Testing basics",
    recommendedLessonId: 1,
    aiUsageToday: 0,
    aiDailyLimit: 50,
    finalProjectsSubmitted: 0,
    finalProjectsApproved: 0,
    totalFinalProjects: 3
  };
  const [progressResult, submissions] = await Promise.all([
    api.dashboardProgress().catch(() => ({
      completedLessons: 0,
      openedLessons: 0,
      quizCompleted: 0,
      homeworkSubmitted: 0,
      recommendedNextLesson: "QA / QC / Testing basics"
    })),
    api.finalProjectSubmissions().catch(() => [])
  ]);
  const progress = { ...defaultProgress, ...progressResult };
  const totalLessons = progress.totalLessons || 9;

  const approvedFinalProjects = new Set(
    submissions.filter((submission) => submission.user_id === 1 && submission.status === "approved").map((submission) => submission.final_project_id)
  ).size;
  const ready =
    progress.completedLessons >= totalLessons &&
    progress.quizCompleted >= totalLessons &&
    progress.homeworkSubmitted >= totalLessons &&
    approvedFinalProjects >= totalFinalProjects;

  const checklist = [
    ["Complete all lessons", progress.completedLessons, totalLessons, CheckCircle2],
    ["Pass lesson quizzes", progress.quizCompleted, totalLessons, Target],
    ["Submit homework", progress.homeworkSubmitted, totalLessons, ClipboardList],
    ["Approve final projects", approvedFinalProjects, totalFinalProjects, ClipboardCheck]
  ] as const;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Award className="mx-auto h-12 w-12 text-amber" />
        <p className="mt-5 text-sm text-coral">{ready ? "Certificate ready" : "Certificate progress"}</p>
        <h1 className="mt-2 text-3xl font-bold">QA Learning Certificate</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">
          {ready
            ? "You have completed the MVP certificate requirements. Download support can be added as the next certificate layer."
            : "Complete lessons, quizzes, homework, and approved final projects to unlock your QA Learning Certificate."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/progress" className="inline-flex rounded-md bg-ink px-4 py-2 text-white">View progress</Link>
          <Link href="/final-projects" className="inline-flex rounded-md border px-4 py-2">Final projects</Link>
        </div>
      </section>
      <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {checklist.map(([label, value, total, Icon]) => (
          <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <Icon className={`h-5 w-5 ${value >= total ? "text-mint" : "text-slate-400"}`} />
            <p className="mt-4 text-sm text-slate-500">{label}</p>
            <h2 className="mt-1 text-2xl font-semibold">{value}/{total}</h2>
          </article>
        ))}
      </section>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Certificate readiness</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {checklist.map(([label, value, total]) => (
            <ProgressCard key={label} label={label} value={`${value}/${total}`} progress={Math.min((value / total) * 100, 100)} />
          ))}
        </div>
      </section>
    </main>
  );
}
