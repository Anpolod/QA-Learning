"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Save } from "lucide-react";
import { api } from "@/lib/api";
import type { Course } from "@/types/course";

type Homework = {
  id: number;
  lesson_id: number;
  task_description: string;
  expected_result: string;
  allow_file_upload: boolean;
};

export function HomeworkManagerPanel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonId, setLessonId] = useState<number>(1);
  const [homework, setHomework] = useState<Homework | null>(null);
  const [taskDescription, setTaskDescription] = useState("Create a practical QA artifact for this lesson.");
  const [expectedResult, setExpectedResult] = useState("Submit a concise, structured answer with expected results and evidence.");
  const [allowFileUpload, setAllowFileUpload] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const lessons = useMemo(() => courses.flatMap((course) => course.modules.flatMap((module) => module.lessons)), [courses]);

  async function loadCourses() {
    setError("");
    try {
      const data = await api.courses();
      setCourses(data);
      const firstLesson = data[0]?.modules[0]?.lessons[0];
      if (firstLesson) setLessonId(firstLesson.id);
    } catch {
      setError("Lessons could not be loaded for homework editing.");
    }
  }

  async function loadHomework(id: number) {
    setStatus("");
    setError("");
    try {
      const data = await api.homework(String(id));
      setHomework(data);
      setTaskDescription(data.task_description);
      setExpectedResult(data.expected_result);
      setAllowFileUpload(data.allow_file_upload);
    } catch {
      setHomework(null);
      setTaskDescription("Create a practical QA artifact for this lesson.");
      setExpectedResult("Submit a concise, structured answer with expected results and evidence.");
      setAllowFileUpload(true);
      setStatus("No homework exists for this lesson yet.");
    }
  }

  async function saveHomework() {
    setStatus("");
    setError("");
    try {
      const payload = {
        task_description: taskDescription,
        expected_result: expectedResult,
        allow_file_upload: allowFileUpload
      };
      const saved = homework
        ? await api.updateHomework(homework.id, payload)
        : await api.createHomework({ lesson_id: lessonId, ...payload });
      setHomework(saved);
      setStatus(homework ? "Homework saved." : "Homework created.");
    } catch {
      setError("Homework could not be saved.");
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadHomework(lessonId);
  }, [lessonId]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-mint" />
        <div>
          <h2 className="text-lg font-semibold">Manage homework</h2>
          <p className="mt-1 text-sm text-slate-600">Create and edit the homework task for each lesson.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <label className="block text-sm font-medium">
          Lesson
          <select value={lessonId} onChange={(event) => setLessonId(Number(event.target.value))} className="mt-1 w-full rounded-md border p-3 text-sm">
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
            ))}
          </select>
        </label>
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Task description
            <textarea
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
              className="mt-1 min-h-32 w-full rounded-md border p-3 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Expected result
            <textarea
              value={expectedResult}
              onChange={(event) => setExpectedResult(event.target.value)}
              className="mt-1 min-h-28 w-full rounded-md border p-3 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={allowFileUpload}
              onChange={(event) => setAllowFileUpload(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Allow optional file upload
          </label>
          <button type="button" onClick={saveHomework} className="inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2 text-sm text-white">
            <Save className="h-4 w-4" /> Save homework
          </button>
          {status ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p> : null}
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
