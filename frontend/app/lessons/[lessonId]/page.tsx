import Link from "next/link";
import { ArrowRight, ClipboardList, Layers, Lightbulb, MousePointerClick, Target } from "lucide-react";
import { AiAssistant } from "@/components/ai/AiAssistant";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LessonProgressTracker } from "@/components/course/LessonProgressTracker";
import { LessonSlideDrawer } from "@/components/course/LessonSlideDrawer";
import { BackLink } from "@/components/ui/BackLink";
import { api, mediaUrl } from "@/lib/api";

// Must match the backend slug derivation in app/seed/apply_glossary.py.
function glossarySlug(term: string): string {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "term";
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = await api.lesson(lessonId);
  const slides = [...lesson.slides].sort((a, b) => a.order_index - b.order_index);
  const glossarySlugs = new Set<string>(
    await api
      .glossary()
      .then((terms) => terms.map((t) => t.slug))
      .catch(() => [])
  );
  return (
    <RequireAuth>
    <main className="mx-auto max-w-7xl px-4 py-8">
      <BackLink label="Back" />
      <LessonProgressTracker lessonId={lesson.id} />
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <Link href={`/quiz/${lesson.id}`} className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm">
            <Target className="h-4 w-4 text-coral" /> Quiz
          </Link>
          <Link href={`/homework/${lesson.id}`} className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm">
            <ClipboardList className="h-4 w-4 text-mint" /> Homework
          </Link>
          <LessonSlideDrawer lessonTitle={lesson.title} slides={slides} />
        </aside>
        <article className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-coral">Lesson</p>
            <h1 className="mt-2 text-3xl font-bold">{lesson.title}</h1>
            <p className="mt-3 text-slate-600">{lesson.short_description}</p>
          </section>
          {[
            ["Learning goals", lesson.learning_goals],
            ["Theory explanation", lesson.theory],
            ["Real-world example", lesson.real_world_example],
            ["Step-by-step explanation", lesson.step_by_step],
            ["Common mistakes", lesson.common_mistakes],
            ["Practical use case", lesson.practical_use_case],
            ["Summary", lesson.summary]
          ].map(([title, body]) => (
            <section key={title} className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{body}</p>
            </section>
          ))}
          {lesson.key_terms ? (
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Key terms</h2>
              <p className="mt-1 text-xs text-slate-500">Tap a term to open its glossary definition.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {lesson.key_terms
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((term) => {
                    const slug = glossarySlug(term);
                    return glossarySlugs.has(slug) ? (
                      <Link
                        key={term}
                        href={`/glossary#${slug}`}
                        className="rounded-full border border-slate-200 bg-paper px-3 py-1 text-sm text-ink transition hover:border-coral hover:text-coral"
                      >
                        {term}
                      </Link>
                    ) : (
                      <span key={term} className="rounded-full border border-slate-100 bg-paper px-3 py-1 text-sm text-slate-500">
                        {term}
                      </span>
                    );
                  })}
              </div>
            </section>
          ) : null}
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber" />
              <h2 className="text-lg font-semibold">Slides</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {slides.map((slide) => (
                <div key={slide.id} className="group relative rounded-md border border-slate-200 p-4 hover:z-20">
                  <p className="text-xs text-slate-500">Slide {slide.order_index}</p>
                  <h3 className="mt-1 font-semibold">{slide.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{slide.body}</p>
                  {slide.image_url ? (
                    <img
                      src={mediaUrl(slide.image_url)}
                      alt={slide.title}
                      className="relative mt-3 aspect-video w-full cursor-zoom-in rounded-md object-cover shadow-sm transition duration-300 ease-out group-hover:scale-150 group-hover:shadow-2xl"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-coral" />
              <h2 className="text-lg font-semibold">Examples</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {lesson.examples.map((example) => (
                <article key={example.id} className="rounded-md border border-slate-200 p-4">
                  <h3 className="font-semibold">{example.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{example.content}</p>
                </article>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <MousePointerClick className="h-5 w-5 text-mint" />
              <h2 className="text-lg font-semibold">Interactive Practice</h2>
            </div>
            <div className="mt-4 space-y-3">
              {(lesson.interactive_tasks ?? []).map((task) => (
                <article key={task.id} className="rounded-md border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{task.task_type.replace("_", " ")}</p>
                  <h3 className="mt-2 font-semibold">Your task</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{task.prompt}</p>
                  <details className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                    <summary className="cursor-pointer font-medium">Expected answer guide</summary>
                    <p className="mt-2 whitespace-pre-wrap leading-6">{task.expected_answer}</p>
                  </details>
                </article>
              ))}
            </div>
          </section>
          <div className="flex justify-end">
            <Link href={`/quiz/${lesson.id}`} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-white">
              Start quiz <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </div>
      <AiAssistant lessonId={lessonId} />
    </main>
    </RequireAuth>
  );
}
