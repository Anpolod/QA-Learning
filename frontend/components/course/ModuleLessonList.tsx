"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

type LessonItem = { id: number; title: string; short_description: string };

// Renders a module's lessons with a green check on the ones the current user has
// completed (quiz + homework done), plus a "Module completed" banner when all are.
export function ModuleLessonList({ lessons }: { lessons: LessonItem[] }) {
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  useEffect(() => {
    let mounted = true;
    api
      .dashboardProgress()
      .then((d) => mounted && setCompleted(new Set(d.completedLessonIds ?? [])))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const allDone = lessons.length > 0 && lessons.every((l) => completed.has(l.id));

  return (
    <div className="mt-6 space-y-3">
      {allDone ? (
        <div className="flex items-center gap-2 rounded-lg border border-mint/40 bg-mint/5 px-4 py-3 text-sm font-medium text-mint">
          <CheckCircle2 className="h-5 w-5" /> Module completed — every lesson done.
        </div>
      ) : null}
      {lessons.map((lesson) => {
        const done = completed.has(lesson.id);
        return (
          <Link
            key={lesson.id}
            href={`/lessons/${lesson.id}`}
            className={`flex items-center justify-between gap-4 rounded-lg border bg-white p-4 transition ${
              done ? "border-mint/40" : "border-slate-200 hover:border-mint"
            }`}
          >
            <div>
              <h2 className="font-semibold">{lesson.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{lesson.short_description}</p>
            </div>
            <CheckCircle2 className={`h-5 w-5 shrink-0 ${done ? "text-mint" : "text-slate-300"}`} />
          </Link>
        );
      })}
    </div>
  );
}
