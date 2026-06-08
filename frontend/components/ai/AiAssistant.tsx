"use client";

import { useState } from "react";
import { Bot, CheckCircle2, Clipboard, Loader2, Send, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

type Message = {
  role: "student" | "assistant";
  content: string;
  type?: "explanation" | "task" | "quiz" | "feedback" | "code_help";
};

type MessageType = NonNullable<Message["type"]>;
const messageTypes = ["explanation", "task", "quiz", "feedback", "code_help"] as const;

function normalizeMessageType(type: string): Message["type"] {
  return messageTypes.includes(type as MessageType) ? (type as MessageType) : undefined;
}

const quickActions = [
  ["Explain this topic", "explain"],
  ["Give me more examples", "generate_task"],
  ["Generate practice task", "generate_task"],
  ["Generate extra quiz", "generate_quiz"],
  ["Check my homework", "check_homework"],
  ["Help with automation", "automation_help"]
] as const;

type GeneratedQuizQuestion = {
  question?: string;
  type?: string;
  options?: string[];
  answers?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  explanation?: string;
};

function parseGeneratedQuiz(content: string): GeneratedQuizQuestion[] | null {
  try {
    const parsed = JSON.parse(content);
    const questions = Array.isArray(parsed) ? parsed : parsed.questions;
    if (!Array.isArray(questions)) return null;
    return questions.filter((item) => item && typeof item === "object");
  } catch {
    return null;
  }
}

function GeneratedQuiz({ content }: { content: string }) {
  const questions = parseGeneratedQuiz(content);
  if (!questions?.length) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }
  return (
    <div className="space-y-3">
      {questions.map((question, index) => {
        const options = question.options ?? question.answers ?? [];
        const correct = question.correctAnswers ?? (question.correctAnswer ? [question.correctAnswer] : []);
        return (
          <article key={`${question.question}-${index}`} className="rounded-md border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase text-slate-500">{question.type ?? "quiz question"}</p>
            <h3 className="mt-1 font-semibold text-slate-900">{question.question ?? `Question ${index + 1}`}</h3>
            {options.length ? (
              <ul className="mt-2 space-y-1">
                {options.map((option) => (
                  <li key={option} className="rounded-md bg-slate-50 px-3 py-2 text-slate-700">{option}</li>
                ))}
              </ul>
            ) : null}
            {correct.length ? (
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Correct: {correct.join(", ")}
              </p>
            ) : null}
            {question.explanation ? <p className="mt-2 text-xs leading-5 text-slate-600">{question.explanation}</p> : null}
          </article>
        );
      })}
    </div>
  );
}

export function AiAssistant({ lessonId }: { lessonId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("explain");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");

  async function send(customMessage?: string, customMode?: string) {
    const text = customMessage ?? message;
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setMessages((current) => [...current, { role: "student", content: text }]);
    setMessage("");
    try {
      const response = await api.aiChat({ message: text, lessonId, mode: customMode ?? mode });
      setMessages((current) => [...current, { role: "assistant", content: response.answer, type: normalizeMessageType(response.type) }]);
    } catch {
      setError("The AI Assistant could not answer right now. Check backend settings and API keys.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-lg"
        aria-label="Open AI Assistant"
      >
        <Bot className="h-6 w-6" />
      </button>
      {open ? (
        <aside className="fixed bottom-0 right-0 top-0 z-20 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-slate-200 p-4">
            <div>
              <p className="text-sm text-slate-500">AI Tutor</p>
              <h2 className="text-lg font-semibold">Lesson Assistant</h2>
            </div>
            <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={() => setOpen(false)}>
              Close
            </button>
          </header>
          <div className="grid grid-cols-2 gap-2 border-b border-slate-100 p-3">
            {quickActions.map(([label, actionMode]) => (
              <button
                key={label}
                type="button"
                onClick={() => send(label, actionMode)}
                className="rounded-md border border-slate-200 px-3 py-2 text-left text-xs hover:border-mint"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                Ask for a simpler explanation, extra practice, quiz questions, homework feedback, or automation help.
              </p>
            ) : null}
            {messages.map((item, index) => (
              <article
                key={`${item.role}-${index}`}
                className={`rounded-lg p-3 text-sm ${item.role === "assistant" ? "bg-slate-50" : "bg-mint text-white"}`}
              >
                {item.type === "quiz" ? <GeneratedQuiz content={item.content} /> : <p className="whitespace-pre-wrap">{item.content}</p>}
                {item.role === "assistant" ? (
                  <button
                    type="button"
                    aria-label="Copy answer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500"
                    onClick={() => navigator.clipboard.writeText(item.content)}
                  >
                    <Clipboard className="h-3 w-3" /> Copy
                  </button>
                ) : null}
              </article>
            ))}
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-mint" /> : null}
            {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          </div>
          <footer className="border-t border-slate-200 p-3">
            <div className="mb-2 flex gap-2">
              <select value={mode} onChange={(event) => setMode(event.target.value)} className="rounded-md border px-2 text-sm">
                <option value="explain">Explain</option>
                <option value="generate_task">Practice</option>
                <option value="generate_quiz">Quiz</option>
                <option value="check_homework">Homework</option>
                <option value="automation_help">Automation</option>
              </select>
              <button type="button" className="rounded-md border px-3" aria-label="Clear chat" onClick={() => setMessages([])}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-h-12 flex-1 resize-none rounded-md border border-slate-200 p-2 text-sm"
                placeholder="Ask a QA question"
              />
              <button type="button" className="rounded-md bg-ink px-4 text-white" aria-label="Send message" onClick={() => send()}>
                <Send className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </aside>
      ) : null}
    </>
  );
}
