"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, ClipboardList, RotateCcw, Target, type LucideIcon } from "lucide-react";
import { api } from "@/lib/api";

type ProgressRow = {
  user_id: number;
  email: string;
  lesson_id: number;
  lesson_title: string;
  opened: boolean;
  completed: boolean;
  quiz_completed: boolean;
  homework_submitted: boolean;
  updated_at: string;
};

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

export function StudentProgressPanel() {
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const summary = useMemo(
    () => ({
      students: new Set(rows.map((row) => row.user_id)).size,
      opened: rows.filter((row) => row.opened).length,
      completed: rows.filter((row) => row.completed).length,
      quizzes: rows.filter((row) => row.quiz_completed).length,
      homework: rows.filter((row) => row.homework_submitted).length
    }),
    [rows]
  );
  const summaryCards: { label: string; value: number; Icon: LucideIcon }[] = [
    { label: "Students", value: summary.students, Icon: BarChart3 },
    { label: "Opened", value: summary.opened, Icon: BarChart3 },
    { label: "Completed", value: summary.completed, Icon: CheckCircle2 },
    { label: "Quizzes", value: summary.quizzes, Icon: Target },
    { label: "Homework", value: summary.homework, Icon: ClipboardList }
  ];

  async function load() {
    setLoading(true);
    setError("");
    try {
      setRows(await api.adminStudentProgress());
    } catch {
      setError("Student progress could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-coral" />
          <div>
            <h2 className="text-lg font-semibold">View student progress</h2>
            <p className="mt-1 text-sm text-slate-600">Track lesson activity, quizzes, and homework by student.</p>
          </div>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <RotateCcw className="h-4 w-4" /> Refresh
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {summaryCards.map(({ label, value, Icon }) => (
          <article key={label} className="rounded-md border border-slate-200 p-3">
            <Icon className="h-4 w-4 text-mint" />
            <p className="mt-2 text-xs text-slate-500">{label}</p>
            <p className="text-xl font-semibold">{value}</p>
          </article>
        ))}
      </div>
      {loading ? <p className="mt-4 text-sm text-slate-600">Loading progress...</p> : null}
      {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {!loading && rows.length === 0 ? <p className="mt-4 text-sm text-slate-600">No student progress has been recorded yet.</p> : null}
      {rows.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Student</th>
                <th className="py-2 pr-3 font-medium">Lesson</th>
                <th className="py-2 pr-3 font-medium">Opened</th>
                <th className="py-2 pr-3 font-medium">Completed</th>
                <th className="py-2 pr-3 font-medium">Quiz</th>
                <th className="py-2 pr-3 font-medium">Homework</th>
                <th className="py-2 pr-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.user_id}-${row.lesson_id}`} className="border-b last:border-b-0">
                  <td className="py-3 pr-3">{row.email}</td>
                  <td className="py-3 pr-3">{row.lesson_title}</td>
                  <td className="py-3 pr-3">{yesNo(row.opened)}</td>
                  <td className="py-3 pr-3">{yesNo(row.completed)}</td>
                  <td className="py-3 pr-3">{yesNo(row.quiz_completed)}</td>
                  <td className="py-3 pr-3">{yesNo(row.homework_submitted)}</td>
                  <td className="py-3 pr-3">{new Date(row.updated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
