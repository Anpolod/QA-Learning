"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, ClipboardList, Target } from "lucide-react";
import { ProgressCard } from "@/components/course/ProgressCard";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { api } from "@/lib/api";

const defaultProgress = {
  completedLessons: 0,
  openedLessons: 0,
  quizCompleted: 0,
  homeworkSubmitted: 0,
  totalLessons: 9,
  currentModule: "Manual QA Foundations",
  currentLesson: "QA / QC / Testing basics",
  recommendedNextLesson: "QA / QC / Testing basics",
  recommendedLessonId: 1 as number | null,
  aiUsageToday: 0,
  aiDailyLimit: 50,
  finalProjectsSubmitted: 0,
  finalProjectsApproved: 0,
  totalFinalProjects: 3
};

export default function ProgressPage() {
  const [progress, setProgress] = useState(defaultProgress);

  useEffect(() => {
    let mounted = true;
    api.dashboardProgress().then((p) => mounted && setProgress({ ...defaultProgress, ...p })).catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const totalLessons = progress.totalLessons || 9;
  const rows = [
    ["Opened lessons", progress.openedLessons, BarChart3],
    ["Completed lessons", progress.completedLessons, CheckCircle2],
    ["Completed quizzes", progress.quizCompleted, Target],
    ["Submitted homework", progress.homeworkSubmitted, ClipboardList]
  ] as const;

  return (
    <RequireAuth>
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-coral">Progress</p>
          <h1 className="text-3xl font-bold">Learning progress</h1>
          <p className="mt-2 text-slate-600">Track lesson activity, quiz completion, and homework submissions.</p>
        </div>
        <Link href={`/lessons/${progress.recommendedLessonId ?? 1}`} className="rounded-md bg-ink px-4 py-2 text-white">Continue learning</Link>
      </div>
      <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {rows.map(([label, value, Icon]) => (
          <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <Icon className="h-5 w-5 text-mint" />
            <p className="mt-4 text-sm text-slate-500">{label}</p>
            <h2 className="mt-1 text-2xl font-semibold">{value}</h2>
          </article>
        ))}
      </section>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Course completion</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <ProgressCard label="Lessons" value={`${progress.completedLessons}/${totalLessons}`} progress={Math.min((progress.completedLessons / totalLessons) * 100, 100)} />
          <ProgressCard label="Quizzes" value={`${progress.quizCompleted}/${totalLessons}`} progress={Math.min((progress.quizCompleted / totalLessons) * 100, 100)} />
          <ProgressCard label="Homework" value={`${progress.homeworkSubmitted}/${totalLessons}`} progress={Math.min((progress.homeworkSubmitted / totalLessons) * 100, 100)} />
        </div>
      </section>
    </main>
    </RequireAuth>
  );
}
