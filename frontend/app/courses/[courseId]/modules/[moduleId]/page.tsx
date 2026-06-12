import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ModuleLessonList } from "@/components/course/ModuleLessonList";
import { api } from "@/lib/api";

export default async function ModulePage({ params }: { params: Promise<{ courseId: string; moduleId: string }> }) {
  const { courseId, moduleId } = await params;
  const [course, module] = await Promise.all([api.course(courseId), api.module(moduleId)]);
  const modules = [...course.modules].sort((a, b) => a.order_index - b.order_index);
  const lessons = [...module.lessons].sort((a, b) => a.order_index - b.order_index);
  const currentIndex = modules.findIndex((m) => m.id === module.id);
  const prevModule = currentIndex > 0 ? modules[currentIndex - 1] : null;
  const nextModule = currentIndex >= 0 && currentIndex < modules.length - 1 ? modules[currentIndex + 1] : null;
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

          <ModuleLessonList
            lessons={lessons.map((l) => ({ id: l.id, title: l.title, short_description: l.short_description }))}
          />

          <nav className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
            {prevModule ? (
              <Link
                href={`/courses/${course.id}/modules/${prevModule.id}`}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-mint"
              >
                <ArrowLeft className="h-4 w-4" /> Previous module
              </Link>
            ) : (
              <span />
            )}
            {nextModule ? (
              <Link
                href={`/courses/${course.id}/modules/${nextModule.id}`}
                className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90"
              >
                Next module <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-mint"
              >
                Back to catalog <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </nav>
        </section>
      </div>
    </main>
    </RequireAuth>
  );
}
