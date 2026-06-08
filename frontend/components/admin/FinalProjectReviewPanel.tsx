"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";

type Submission = {
  id: number;
  final_project_id: number;
  user_id: number;
  submission_text: string;
  file_url: string;
  status: string;
  created_at: string;
};

export function FinalProjectReviewPanel() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setSubmissions(await api.finalProjectSubmissions());
    } catch {
      setError("Final project submissions could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function review(id: number, status: "approved" | "needs_changes") {
    setError("");
    try {
      const updated = await api.reviewFinalProjectSubmission(id, status);
      setSubmissions((items) => items.map((item) => (item.id === id ? updated : item)));
    } catch {
      setError("Final project review status could not be saved.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-coral" />
          <div>
            <h2 className="text-lg font-semibold">Review final projects</h2>
            <p className="mt-1 text-sm text-slate-600">Read submitted portfolio work for Manual QA, Automation QA, and AI for QA.</p>
          </div>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <RotateCcw className="h-4 w-4" /> Refresh
        </button>
      </div>
      {loading ? <p className="mt-4 text-sm text-slate-600">Loading final project submissions...</p> : null}
      {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {!loading && submissions.length === 0 ? <p className="mt-4 text-sm text-slate-600">No final project submissions yet.</p> : null}
      <div className="mt-4 space-y-3">
        {submissions.map((submission) => (
          <article key={submission.id} className="rounded-md border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Submission #{submission.id}</p>
                <p className="text-xs text-slate-500">
                  User {submission.user_id} / Project {submission.final_project_id} / {submission.status}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs text-slate-500">{new Date(submission.created_at).toLocaleString()}</p>
                <button
                  type="button"
                  onClick={() => review(submission.id, "approved")}
                  className="inline-flex items-center gap-1 rounded-md bg-mint px-2 py-1 text-xs text-white"
                >
                  <CheckCircle2 className="h-3 w-3" /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => review(submission.id, "needs_changes")}
                  className="rounded-md border px-2 py-1 text-xs"
                >
                  Needs changes
                </button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{submission.submission_text}</p>
            {submission.file_url ? (
              <a href={submission.file_url} className="mt-3 inline-flex text-sm font-medium text-ink">
                Attached file
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
