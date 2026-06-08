import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, PlayCircle } from "lucide-react";

export default function HomePage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-coral">Manual QA, Automation, and AI for QA</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-ink md:text-6xl">QA Learning Platform</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">
              Study QA step by step through theory, examples, interactive practice, homework, quizzes, progress, and a built-in AI tutor.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/courses" className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-white">
                Start learning <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-3">
                Continue <PlayCircle className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid content-end gap-3">
            {["Topic", "Theory", "Example", "Practice", "Homework", "Quiz", "Progress"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg border border-slate-200 bg-paper p-4">
                <span className="font-medium">{item}</span>
                <CheckCircle2 className="h-5 w-5 text-mint" />
              </div>
            ))}
            <div className="flex items-center gap-3 rounded-lg bg-ink p-4 text-white">
              <Bot className="h-5 w-5 text-amber" />
              <span>AI Assistant is included from the first version.</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
