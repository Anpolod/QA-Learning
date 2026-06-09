"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Brain, ClipboardCheck, Gamepad2, Trophy } from "lucide-react";
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

type Player = Awaited<ReturnType<typeof api.playerStats>> | null;

export default function DashboardPage() {
  const [progress, setProgress] = useState(defaultProgress);
  const [player, setPlayer] = useState<Player>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const p = await api.dashboardProgress().catch(() => ({}));
      const pl = await api.playerStats().catch(() => null);
      if (!mounted) return;
      setProgress({ ...defaultProgress, ...p });
      setPlayer(pl);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalLessons = progress.totalLessons || 9;
  const lessonProgress = Math.min((progress.completedLessons / totalLessons) * 100, 100);
  const openedProgress = Math.min((progress.openedLessons / totalLessons) * 100, 100);
  const quizProgress = Math.min((progress.quizCompleted / totalLessons) * 100, 100);
  const homeworkProgress = Math.min((progress.homeworkSubmitted / totalLessons) * 100, 100);
  const aiLimit = progress.aiDailyLimit || 50;
  const aiProgress = Math.min((progress.aiUsageToday / aiLimit) * 100, 100);
  const finalProjectStatus =
    progress.finalProjectsApproved > 0
      ? `${progress.finalProjectsApproved}/${progress.totalFinalProjects} approved`
      : `${progress.finalProjectsSubmitted}/${progress.totalFinalProjects} submitted`;

  return (
    <RequireAuth>
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Student dashboard</p>
          <h1 className="text-3xl font-bold">Your QA journey</h1>
        </div>
        <Link href={`/lessons/${progress.recommendedLessonId ?? 1}`} className="rounded-md bg-ink px-4 py-2 text-white">
          Continue learning
        </Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <ProgressCard label="Completed lessons" value={`${progress.completedLessons}/${totalLessons}`} progress={lessonProgress} />
        <ProgressCard label="Opened lessons" value={`${progress.openedLessons}/${totalLessons}`} progress={openedProgress} />
        <ProgressCard label="Quiz completed" value={`${progress.quizCompleted}/${totalLessons}`} progress={quizProgress} />
        <ProgressCard label="Homework submitted" value={`${progress.homeworkSubmitted}/${totalLessons}`} progress={homeworkProgress} />
        <ProgressCard label="AI usage today" value={`${progress.aiUsageToday}/${aiLimit}`} progress={aiProgress} />
      </div>
      <section className="mt-8 grid gap-4 lg:grid-cols-4">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <BookOpen className="h-5 w-5 text-coral" />
          <p className="mt-4 text-sm text-slate-500">Current module</p>
          <h2 className="mt-1 text-lg font-semibold">{progress.currentModule}</h2>
          <p className="mt-2 text-sm text-slate-600">{progress.currentLesson}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Brain className="h-5 w-5 text-coral" />
          <p className="mt-4 text-sm text-slate-500">Recommended next lesson</p>
          <h2 className="mt-1 text-lg font-semibold">{progress.recommendedNextLesson}</h2>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Trophy className="h-5 w-5 text-coral" />
          <p className="mt-4 text-sm text-slate-500">Final project progress</p>
          <h2 className="mt-1 text-lg font-semibold">{finalProjectStatus}</h2>
        </article>
        <Link href="/game" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-mint">
          <Gamepad2 className="h-5 w-5 text-coral" />
          <p className="mt-4 text-sm text-slate-500">Game rank</p>
          <h2 className="mt-1 text-lg font-semibold">{player ? `${player.rank} · ${player.xp} XP` : "Open player hub"}</h2>
        </Link>
      </section>
      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-mint" />
          <h2 className="text-lg font-semibold">Completed lessons</h2>
        </div>
        <p className="mt-3 text-sm text-slate-600">Your progress is saved to your account as you open lessons, take quizzes, and submit homework.</p>
      </section>
      <section className="mt-6 grid gap-3 md:grid-cols-3">
        <Link href="/progress" className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium hover:border-mint">
          View detailed progress
        </Link>
        <Link href="/final-projects" className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium hover:border-mint">
          Open final projects
        </Link>
        <Link href="/certificate" className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium hover:border-mint">
          Certificate readiness
        </Link>
      </section>
    </main>
    </RequireAuth>
  );
}
