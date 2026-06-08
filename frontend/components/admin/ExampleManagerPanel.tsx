"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenText, Plus, Save } from "lucide-react";
import { api } from "@/lib/api";
import type { Course, Example, Lesson } from "@/types/course";

export function ExampleManagerPanel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonId, setLessonId] = useState<number>(1);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [selectedExampleId, setSelectedExampleId] = useState<number | null>(null);
  const [title, setTitle] = useState("New QA example");
  const [content, setContent] = useState("Describe a real QA situation.");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const lessons = useMemo(() => courses.flatMap((course) => course.modules.flatMap((module) => module.lessons)), [courses]);
  const selectedExample = lesson?.examples.find((example) => example.id === selectedExampleId) ?? lesson?.examples[0];

  async function loadCourses() {
    try {
      const data = await api.courses();
      setCourses(data);
      const firstLesson = data[0]?.modules[0]?.lessons[0];
      if (firstLesson) setLessonId(firstLesson.id);
    } catch {
      setError("Lessons could not be loaded for example editing.");
    }
  }

  async function loadLesson(id: number) {
    setError("");
    try {
      const data = await api.lesson(String(id));
      setLesson(data);
      setSelectedExampleId(data.examples[0]?.id ?? null);
    } catch {
      setError("Lesson examples could not be loaded.");
    }
  }

  async function createExample() {
    if (!lesson) return;
    setStatus("");
    setError("");
    try {
      const created = await api.createExample({
        lesson_id: lesson.id,
        title: "New QA example",
        content: "Add a concrete QA example for students."
      });
      setLesson({ ...lesson, examples: [...lesson.examples, created] });
      setSelectedExampleId(created.id);
      setStatus("Example created.");
    } catch {
      setError("Example could not be created.");
    }
  }

  async function saveExample() {
    if (!lesson || !selectedExample) return;
    setStatus("");
    setError("");
    try {
      const updated = await api.updateExample(selectedExample.id, { title, content });
      setLesson({
        ...lesson,
        examples: lesson.examples.map((example) => (example.id === updated.id ? { ...example, ...updated } : example))
      });
      setStatus("Example saved.");
    } catch {
      setError("Example could not be saved.");
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadLesson(lessonId);
  }, [lessonId]);

  useEffect(() => {
    if (selectedExample) {
      setTitle(selectedExample.title);
      setContent(selectedExample.content);
    }
  }, [selectedExample?.id]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <BookOpenText className="h-5 w-5 text-coral" />
        <h2 className="text-lg font-semibold">Manage examples</h2>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_260px_1fr]">
        <label className="block text-sm font-medium">
          Lesson
          <select value={lessonId} onChange={(event) => setLessonId(Number(event.target.value))} className="mt-1 w-full rounded-md border p-3 text-sm">
            {lessons.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </label>
        <div className="rounded-md border border-slate-200 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Examples</p>
            <button type="button" onClick={createExample} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
              <Plus className="h-3 w-3" /> New
            </button>
          </div>
          <div className="mt-2 space-y-1">
            {lesson?.examples.map((example: Example) => (
              <button
                key={example.id}
                type="button"
                onClick={() => setSelectedExampleId(example.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${selectedExample?.id === example.id ? "bg-ink text-white" : "hover:bg-slate-50"}`}
              >
                {example.title}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Example title
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-md border p-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">
            Content
            <textarea value={content} onChange={(event) => setContent(event.target.value)} className="mt-1 min-h-36 w-full rounded-md border p-3 text-sm" />
          </label>
          <button type="button" onClick={saveExample} className="inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2 text-sm text-white">
            <Save className="h-4 w-4" /> Save example
          </button>
          {status ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p> : null}
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
