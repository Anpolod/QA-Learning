"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Bot, Send, Upload } from "lucide-react";
import { api } from "@/lib/api";

export default function HomeworkPage() {
  const params = useParams<{ lessonId: string }>();
  const [homework, setHomework] = useState<Awaited<ReturnType<typeof api.homework>> | null>(null);
  const [answer, setAnswer] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.homework(params.lessonId).then((data) => setHomework(data)).catch(() => setHomework(null));
  }, [params.lessonId]);

  async function checkHomework() {
    const response = await api.aiChat({
      lessonId: params.lessonId,
      mode: "check_homework",
      message: `Check this homework and guide me without simply replacing my work:\n${answer}`
    });
    setAiFeedback(response.answer);
  }

  async function submitHomework() {
    if (!homework || !answer.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.submitHomework(homework.id, answer);
      setStatus(`Submitted successfully. Submission ID: ${response.submissionId}`);
    } catch {
      setError("Homework submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">Homework</h1>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">Task description</h2>
        <p className="mt-2 text-sm text-slate-700">{homework?.task_description ?? "Loading homework..."}</p>
        <h2 className="mt-5 font-semibold">Expected result</h2>
        <p className="mt-2 text-sm text-slate-700">{homework?.expected_result}</p>
      </section>
      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-5">
        <textarea
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          className="min-h-48 w-full rounded-md border border-slate-200 p-3 text-sm"
          placeholder="Write your homework submission"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {homework?.allow_file_upload ? (
            <button type="button" className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm">
              <Upload className="h-4 w-4" /> Upload file
            </button>
          ) : null}
          <button
            type="button"
            onClick={submitHomework}
            disabled={!homework || !answer.trim() || loading}
            className="inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" /> {loading ? "Submitting..." : "Submit homework"}
          </button>
          <button type="button" onClick={checkHomework} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm text-white">
            <Bot className="h-4 w-4" /> Check my homework
          </button>
        </div>
        {status ? <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p> : null}
        {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        {aiFeedback ? <p className="mt-4 whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm text-slate-700">{aiFeedback}</p> : null}
      </section>
    </main>
  );
}
