"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";

type Submission = {
  id: number;
  homework_id: number;
  user_id: number;
  answer_text: string;
  file_url: string;
  status: string;
  created_at: string;
};

export function HomeworkReviewPanel() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setSubmissions(await api.homeworkSubmissions());
    } catch {
      setError("Homework submissions could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function review(id: number, status: "approved" | "needs_changes") {
    try {
      const updated = await api.reviewHomework(id, status);
      setSubmissions((items) => items.map((item) => (item.id === id ? updated : item)));
    } catch {
      setError("Homework review status could not be saved.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Review homework</h2>
          <p className="mt-1 text-sm text-slate-600">Approve submissions or ask students to improve their answer.</p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <RotateCcw className="h-4 w-4" /> Refresh
        </button>
      </div>
      {loading ? <p className="mt-4 text-sm text-slate-600">Loading submissions...</p> : null}
      {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {!loading && submissions.length === 0 ? <p className="mt-4 text-sm text-slate-600">No homework submissions yet.</p> : null}
      <div className="mt-4 space-y-3">
        {submissions.map((submission) => (
          <article key={submission.id} className="rounded-md border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Submission #{submission.id}</p>
                <p className="text-xs text-slate-500">
                  User {submission.user_id} / Homework {submission.homework_id} / {submission.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => review(submission.id, "approved")} className="inline-flex items-center gap-2 rounded-md bg-mint px-3 py-2 text-sm text-white">
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </button>
                <button type="button" onClick={() => review(submission.id, "needs_changes")} className="rounded-md border px-3 py-2 text-sm">
                  Needs changes
                </button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{submission.answer_text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

