"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClipboardCheck, FileText, Loader2, Send } from "lucide-react";
import { api } from "@/lib/api";

type FinalProject = {
  id: number;
  course_id: number;
  title: string;
  requirements: string;
};

export default function FinalProjectsPage() {
  const [projects, setProjects] = useState<FinalProject[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  useEffect(() => {
    api.finalProjects()
      .then(setProjects)
      .catch(() => setError("Final projects could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  async function submit(projectId: number) {
    const answer = answers[projectId] ?? "";
    if (!answer.trim()) return;
    setSubmittingId(projectId);
    setError("");
    try {
      const submission = await api.submitFinalProject(projectId, answer);
      setStatus((items) => ({ ...items, [projectId]: `Submitted. Submission ID: ${submission.id}` }));
      setAnswers((items) => ({ ...items, [projectId]: "" }));
    } catch {
      setError("Final project submission failed.");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div>
        <p className="text-sm text-coral">Final projects</p>
        <h1 className="text-3xl font-bold">Job-ready QA portfolio work</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Complete a final project for Manual QA, Automation QA, and AI for QA to practice realistic end-to-end workflows.
        </p>
      </div>
      {loading ? <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" /> Loading projects...</p> : null}
      {error ? <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {projects.map((project) => (
          <article key={project.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <ClipboardCheck className="h-5 w-5 text-mint" />
            <h2 className="mt-4 text-xl font-semibold">{project.title}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{project.requirements}</p>
            <label className="mt-5 block text-sm font-medium">
              Project submission
              <textarea
                value={answers[project.id] ?? ""}
                onChange={(event) => setAnswers((items) => ({ ...items, [project.id]: event.target.value }))}
                className="mt-2 min-h-36 w-full rounded-md border border-slate-200 p-3 text-sm"
                placeholder="Describe your artifacts, links, evidence, and final QA report."
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm">
                <FileText className="h-4 w-4" /> Upload file
              </button>
              <button
                type="button"
                onClick={() => submit(project.id)}
                disabled={submittingId === project.id || !(answers[project.id] ?? "").trim()}
                className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingId === project.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit project
              </button>
            </div>
            {status[project.id] ? <p className="mt-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{status[project.id]}</p> : null}
          </article>
        ))}
      </section>
      {!loading && projects.length === 0 ? (
        <p className="mt-6 rounded-lg border border-slate-200 bg-white p-5 text-slate-600">No final projects yet. Run the seed script.</p>
      ) : null}
      <div className="mt-6">
        <Link href="/certificate" className="text-sm font-medium text-ink">View certificate readiness</Link>
      </div>
    </main>
  );
}
