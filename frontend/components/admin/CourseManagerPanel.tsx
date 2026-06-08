"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Save, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Course } from "@/types/course";

export function CourseManagerPanel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState("New QA lesson");
  const [draftDescription, setDraftDescription] = useState("Short lesson description.");
  const [draftTheory, setDraftTheory] = useState("Full lesson theory goes here.");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const lessons = useMemo(() => courses.flatMap((course) => course.modules.flatMap((module) => module.lessons)), [courses]);
  const firstModule = courses[0]?.modules[0];
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];

  async function load() {
    setError("");
    try {
      const data = await api.courses();
      setCourses(data);
      if (!selectedLessonId) {
        const firstLesson = data[0]?.modules[0]?.lessons[0];
        if (firstLesson) setSelectedLessonId(firstLesson.id);
      }
    } catch {
      setError("Course content could not be loaded.");
    }
  }

  async function saveLesson() {
    if (!selectedLesson) return;
    setStatus("");
    setError("");
    try {
      const updated = await api.updateLesson(selectedLesson.id, {
        title: draftTitle,
        short_description: draftDescription,
        theory: draftTheory
      });
      setCourses((items) =>
        items.map((course) => ({
          ...course,
          modules: course.modules.map((module) => ({
            ...module,
            lessons: module.lessons.map((lesson) => (lesson.id === updated.id ? { ...lesson, ...updated } : lesson))
          }))
        }))
      );
      setStatus("Lesson saved.");
    } catch {
      setError("Lesson could not be saved.");
    }
  }

  async function createLesson() {
    if (!firstModule) return;
    setStatus("");
    setError("");
    try {
      const created = await api.createLesson({
        module_id: firstModule.id,
        title: "New QA lesson",
        short_description: "Draft lesson created from admin panel.",
        theory: "Add theory for this lesson.",
        order_index: firstModule.lessons.length + 1
      });
      setCourses((items) =>
        items.map((course) => ({
          ...course,
          modules: course.modules.map((module) =>
            module.id === firstModule.id ? { ...module, lessons: [...module.lessons, created] } : module
          )
        }))
      );
      setSelectedLessonId(created.id);
      setConfirmDelete(false);
      setStatus("Draft lesson created.");
    } catch {
      setError("Draft lesson could not be created.");
    }
  }

  async function deleteLesson() {
    if (!selectedLesson) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      setStatus("Click delete again to confirm.");
      return;
    }
    setStatus("");
    setError("");
    try {
      await api.deleteLesson(selectedLesson.id);
      let nextLessonId: number | null = null;
      setCourses((items) =>
        items.map((course) => ({
          ...course,
          modules: course.modules.map((module) => {
            const remaining = module.lessons.filter((lesson) => lesson.id !== selectedLesson.id);
            if (nextLessonId === null && remaining.length) nextLessonId = remaining[0].id;
            return { ...module, lessons: remaining };
          })
        }))
      );
      setSelectedLessonId(nextLessonId);
      setConfirmDelete(false);
      setStatus("Lesson deleted.");
    } catch {
      setError("Lesson could not be deleted.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (selectedLesson) {
      setDraftTitle(selectedLesson.title);
      setDraftDescription(selectedLesson.short_description);
      setDraftTheory(selectedLesson.theory);
      setConfirmDelete(false);
    }
  }, [selectedLesson?.id]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Manage lessons</h2>
          <p className="mt-1 text-sm text-slate-600">Create lesson drafts and edit core lesson content.</p>
        </div>
        <button type="button" onClick={createLesson} className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm text-white">
          <Plus className="h-4 w-4" /> New lesson
        </button>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="max-h-96 overflow-y-auto rounded-md border border-slate-200 p-3">
          {courses.map((course) => (
            <div key={course.id} className="mb-4">
              <p className="text-xs font-semibold uppercase text-coral">{course.title}</p>
              {course.modules.map((module) => (
                <div key={module.id} className="mt-2">
                  <p className="text-sm font-medium">{module.title}</p>
                  <div className="mt-2 space-y-1">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm ${selectedLesson?.id === lesson.id ? "bg-ink text-white" : "hover:bg-slate-50"}`}
                      >
                        {lesson.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </aside>
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Title
            <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} className="mt-1 w-full rounded-md border p-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">
            Short description
            <textarea value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} className="mt-1 min-h-20 w-full rounded-md border p-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">
            Theory
            <textarea value={draftTheory} onChange={(event) => setDraftTheory(event.target.value)} className="mt-1 min-h-40 w-full rounded-md border p-3 text-sm" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={saveLesson} className="inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2 text-sm text-white">
              <Save className="h-4 w-4" /> Save lesson
            </button>
            <button type="button" onClick={deleteLesson} className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm text-red-700">
              <Trash2 className="h-4 w-4" /> {confirmDelete ? "Confirm delete" : "Delete lesson"}
            </button>
          </div>
          {status ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p> : null}
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          {selectedLesson ? (
            <p className="inline-flex items-center gap-2 text-xs text-slate-500">
              <Edit3 className="h-3 w-3" /> Editing lesson #{selectedLesson.id}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
