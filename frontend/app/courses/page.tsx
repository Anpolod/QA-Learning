import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { api } from "@/lib/api";

export default async function CoursesPage() {
  const courses = await api.courses().catch(() => []);
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course catalog</h1>
          <p className="mt-2 text-sm text-slate-600">Choose a learning path, then practice interview answers when you are ready to explain your work.</p>
        </div>
        <Link href="/interview" className="inline-flex w-fit items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">
          <MessageSquareText className="h-4 w-4" />
          Mock interview
        </Link>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {courses.map((course) => (
          <section key={course.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm uppercase text-coral">{course.section.replaceAll("_", " ")}</p>
            <h2 className="mt-2 text-xl font-semibold">{course.title}</h2>
            <p className="mt-3 text-sm text-slate-600">{course.description}</p>
            <p className="mt-4 text-sm font-medium text-ink">{course.modules.length} modules ready</p>
            <div className="mt-4 space-y-2">
              {[...course.modules]
                .sort((a, b) => a.order_index - b.order_index)
                .map((module) => (
                  <Link
                    key={module.id}
                    href={`/courses/${course.id}/modules/${module.id}`}
                    className="block rounded-md border border-slate-200 px-3 py-2 transition hover:border-mint hover:bg-slate-50"
                  >
                    <span className="text-sm font-semibold text-ink">{module.title}</span>
                    <span className="mt-1 block text-xs text-slate-500">{module.lessons.length} lessons</span>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
      {courses.length === 0 ? <p className="mt-6 rounded-lg bg-white p-5 text-slate-600">No courses yet. Run the backend seed script.</p> : null}
    </main>
  );
}
