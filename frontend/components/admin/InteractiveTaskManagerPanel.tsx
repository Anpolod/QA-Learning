"use client";

import { useEffect, useMemo, useState } from "react";
import { MousePointerClick, Plus, Save } from "lucide-react";
import { api } from "@/lib/api";
import type { Course, InteractiveTask, Lesson } from "@/types/course";

export function InteractiveTaskManagerPanel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonId, setLessonId] = useState<number>(1);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [taskType, setTaskType] = useState("analysis");
  const [prompt, setPrompt] = useState("Analyze a short QA scenario and identify the main testing risk.");
  const [expectedAnswer, setExpectedAnswer] = useState("Describe one clear risk and one matching test idea.");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const lessons = useMemo(() => courses.flatMap((course) => course.modules.flatMap((module) => module.lessons)), [courses]);
  const selectedTask = lesson?.interactive_tasks.find((task) => task.id === selectedTaskId) ?? lesson?.interactive_tasks[0];

  async function loadCourses() {
    try {
      const data = await api.courses();
      setCourses(data);
      const firstLesson = data[0]?.modules[0]?.lessons[0];
      if (firstLesson) setLessonId(firstLesson.id);
    } catch {
      setError("Lessons could not be loaded for practice editing.");
    }
  }

  async function loadLesson(id: number) {
    setError("");
    try {
      const data = await api.lesson(String(id));
      const interactiveTasks = data.interactive_tasks ?? [];
      setLesson({ ...data, interactive_tasks: interactiveTasks });
      setSelectedTaskId(interactiveTasks[0]?.id ?? null);
    } catch {
      setError("Interactive tasks could not be loaded.");
    }
  }

  async function createTask() {
    if (!lesson) return;
    setStatus("");
    setError("");
    try {
      const created = await api.createInteractiveTask({
        lesson_id: lesson.id,
        task_type: "analysis",
        prompt: "Analyze a short QA scenario and identify the main testing risk.",
        expected_answer: "Describe one clear risk and one matching test idea."
      });
      setLesson({ ...lesson, interactive_tasks: [...lesson.interactive_tasks, created] });
      setSelectedTaskId(created.id);
      setStatus("Interactive task created.");
    } catch {
      setError("Interactive task could not be created.");
    }
  }

  async function saveTask() {
    if (!lesson || !selectedTask) return;
    setStatus("");
    setError("");
    try {
      const updated = await api.updateInteractiveTask(selectedTask.id, {
        task_type: taskType,
        prompt,
        expected_answer: expectedAnswer
      });
      setLesson({
        ...lesson,
        interactive_tasks: lesson.interactive_tasks.map((task) => (task.id === updated.id ? { ...task, ...updated } : task))
      });
      setStatus("Interactive task saved.");
    } catch {
      setError("Interactive task could not be saved.");
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadLesson(lessonId);
  }, [lessonId]);

  useEffect(() => {
    if (selectedTask) {
      setTaskType(selectedTask.task_type);
      setPrompt(selectedTask.prompt);
      setExpectedAnswer(selectedTask.expected_answer);
    }
  }, [selectedTask?.id]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <MousePointerClick className="h-5 w-5 text-mint" />
        <h2 className="text-lg font-semibold">Manage interactive practice</h2>
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
            <p className="text-sm font-medium">Practice tasks</p>
            <button type="button" onClick={createTask} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
              <Plus className="h-3 w-3" /> New
            </button>
          </div>
          <div className="mt-2 space-y-1">
            {lesson?.interactive_tasks.map((task: InteractiveTask) => (
              <button
                key={task.id}
                type="button"
                onClick={() => setSelectedTaskId(task.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${selectedTask?.id === task.id ? "bg-ink text-white" : "hover:bg-slate-50"}`}
              >
                {task.task_type}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Task type
            <select value={taskType} onChange={(event) => setTaskType(event.target.value)} className="mt-1 w-full rounded-md border p-3 text-sm">
              <option value="analysis">Analysis</option>
              <option value="bug_report">Bug report</option>
              <option value="checklist">Checklist</option>
              <option value="selector_fix">Selector fix</option>
              <option value="api_scenario">API scenario</option>
              <option value="sql_practice">SQL practice</option>
              <option value="ai_review">AI review</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Prompt
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="mt-1 min-h-28 w-full rounded-md border p-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">
            Expected answer guide
            <textarea value={expectedAnswer} onChange={(event) => setExpectedAnswer(event.target.value)} className="mt-1 min-h-28 w-full rounded-md border p-3 text-sm" />
          </label>
          <button type="button" onClick={saveTask} className="inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2 text-sm text-white">
            <Save className="h-4 w-4" /> Save practice
          </button>
          {status ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p> : null}
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
