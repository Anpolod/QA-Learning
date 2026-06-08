import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { api } from "@/lib/api";

export default async function ModulePage({ params }: { params: Promise<{ courseId: string; moduleId: string }> }) {
  const { courseId, moduleId } = await params;
  const [course, module] = await Promise.all([api.course(courseId), api.module(moduleId)]);
  const modules = [...course.modules].sort((a, b) => a.order_index - b.order_index);
  const lessons = [...module.lessons].sort((a, b) => a.order_index - b.order_index);
  return (
    <RequireAuth>
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <Link href="/courses" className="text-sm font-medium text-coral">
            Course catalog
          </Link>
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{course.title}</p>
            <h2 className="mt-1 text-lg font-bold text-ink">Modules</h2>
            <nav className="mt-4 space-y-2">
              {modules.map((courseModule) => (
                <Link
                  key={courseModule.id}
                  href={`/courses/${course.id}/modules/${courseModule.id}`}
                  className={`block rounded-md border px-3 py-2 text-sm transition ${
                    courseModule.id === module.id
                      ? "border-coral bg-coral/5 text-ink"
                      : "border-slate-200 text-slate-700 hover:border-mint hover:bg-slate-50"
                  }`}
                >
                  <span className="font-semibold">{courseModule.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{courseModule.lessons.length} lessons</span>
                </Link>
              ))}
            </nav>
          </section>
        </aside>

        <section>
          <p className="text-sm text-coral">Module</p>
          <h1 className="text-3xl font-bold">{module.title}</h1>
          <p className="mt-3 text-slate-600">{module.description}</p>
          <div className="mt-6 space-y-3">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 hover:border-mint"
              >
                <div>
                  <h2 className="font-semibold">{lesson.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{lesson.short_description}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 shrink-0 text-slate-300" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
    </RequireAuth>
  );
}
