"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { BackLink } from "@/components/ui/BackLink";
import { api } from "@/lib/api";

type Quiz = Awaited<ReturnType<typeof api.quiz>>;

function isMultipleChoice(type: string) {
  return type === "multiple" || type === "multiple_choice";
}

export default function QuizPage() {
  const params = useParams<{ lessonId: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; wrong_answers: { question: string; explanation: string }[] } | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    api.quiz(params.lessonId).then((data) => setQuiz(data)).catch(() => setQuiz(null));
  }, [params.lessonId]);

  function setAnswer(questionId: number, answerId: number, checked: boolean, multiple: boolean) {
    setAnswers((current) => {
      if (!multiple) return { ...current, [questionId]: checked ? [answerId] : [] };
      const currentAnswers = current[questionId] ?? [];
      return {
        ...current,
        [questionId]: checked ? [...new Set([...currentAnswers, answerId])] : currentAnswers.filter((id) => id !== answerId)
      };
    });
  }

  async function submitQuiz() {
    if (!quiz) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.submitQuiz(quiz.id, answers);
      setResult(response);
    } catch {
      setError("Quiz submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function retry() {
    setAnswers({});
    setResult(null);
    setError("");
  }

  const answeredCount = quiz?.questions.filter((question) => (answers[question.id] ?? []).length > 0).length ?? 0;
  const canSubmit = Boolean(quiz && answeredCount === quiz.questions.length && !loading);

  return (
    <RequireAuth>
    <main className="mx-auto max-w-4xl px-4 py-8">
      <BackLink href={`/lessons/${params.lessonId}`} label="Back to lesson" />
      <h1 className="text-3xl font-bold">{quiz?.title ?? "Quiz"}</h1>
      <div className="mt-6 space-y-4">
        {quiz?.questions.map((question) => (
          <section key={question.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{question.question}</h2>
              <span className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-500">{question.type.replace("_", " ")}</span>
            </div>
            <div className="mt-3 space-y-2">
              {question.answers.map((answer) => (
                <label key={answer.id} className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 p-3 text-sm">
                  <input
                    type={isMultipleChoice(question.type) ? "checkbox" : "radio"}
                    name={`question-${question.id}`}
                    checked={answers[question.id]?.includes(answer.id) ?? false}
                    onChange={(event) => setAnswer(question.id, answer.id, event.target.checked, isMultipleChoice(question.type))}
                  />
                  {answer.answerText}
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
      <button
        type="button"
        onClick={submitQuiz}
        disabled={!canSubmit}
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <CheckCircle2 className="h-4 w-4" /> {loading ? "Submitting..." : "Submit quiz"}
      </button>
      {quiz && answeredCount < quiz.questions.length ? (
        <p className="mt-3 text-sm text-slate-600">Answer all questions before submitting: {answeredCount}/{quiz.questions.length} selected.</p>
      ) : null}
      {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {result ? (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Score: {result.score}/{result.total}</h2>
            <button type="button" onClick={retry} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <RotateCcw className="h-4 w-4" /> Retry quiz
            </button>
          </div>
          {result.wrong_answers.length ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-slate-700">Review wrong answers</p>
              {result.wrong_answers.map((item) => (
                <article key={item.question} className="rounded-md bg-slate-50 p-3 text-sm">
                  <p className="font-medium">{item.question}</p>
                  <p className="mt-1 text-slate-600">{item.explanation}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-mint">Perfect score. This lesson is marked as completed.</p>
          )}
        </section>
      ) : null}
    </main>
    </RequireAuth>
  );
}
