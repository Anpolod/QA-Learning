"use client";

import { useEffect, useMemo, useState } from "react";
import { Images, Plus, Save } from "lucide-react";
import { api } from "@/lib/api";
import type { Course, Lesson, Slide } from "@/types/course";

export function SlideManagerPanel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonId, setLessonId] = useState<number>(1);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<number | null>(null);
  const [title, setTitle] = useState("New slide");
  const [body, setBody] = useState("Slide key point.");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const lessons = useMemo(() => courses.flatMap((course) => course.modules.flatMap((module) => module.lessons)), [courses]);
  const selectedSlide = lesson?.slides.find((slide) => slide.id === selectedSlideId) ?? lesson?.slides[0];

  async function loadCourses() {
    try {
      const data = await api.courses();
      setCourses(data);
      const firstLesson = data[0]?.modules[0]?.lessons[0];
      if (firstLesson) setLessonId(firstLesson.id);
    } catch {
      setError("Lessons could not be loaded for slide editing.");
    }
  }

  async function loadLesson(id: number) {
    setError("");
    try {
      const data = await api.lesson(String(id));
      setLesson(data);
      setSelectedSlideId(data.slides[0]?.id ?? null);
    } catch {
      setError("Lesson slides could not be loaded.");
    }
  }

  async function createSlide() {
    if (!lesson) return;
    setStatus("");
    setError("");
    try {
      const created = await api.createSlide({
        lesson_id: lesson.id,
        title: "New slide",
        body: "Add slide content.",
        order_index: lesson.slides.length + 1,
        image_url: ""
      });
      setLesson({ ...lesson, slides: [...lesson.slides, created] });
      setSelectedSlideId(created.id);
      setStatus("Slide created.");
    } catch {
      setError("Slide could not be created.");
    }
  }

  async function saveSlide() {
    if (!lesson || !selectedSlide) return;
    setStatus("");
    setError("");
    try {
      const updated = await api.updateSlide(selectedSlide.id, { title, body, image_url: imageUrl });
      setLesson({
        ...lesson,
        slides: lesson.slides.map((slide) => (slide.id === updated.id ? { ...slide, ...updated } : slide))
      });
      setStatus("Slide saved.");
    } catch {
      setError("Slide could not be saved.");
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadLesson(lessonId);
  }, [lessonId]);

  useEffect(() => {
    if (selectedSlide) {
      setTitle(selectedSlide.title);
      setBody(selectedSlide.body);
      setImageUrl(selectedSlide.image_url);
    }
  }, [selectedSlide?.id]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Images className="h-5 w-5 text-amber" />
        <h2 className="text-lg font-semibold">Manage slides</h2>
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
            <p className="text-sm font-medium">Slides</p>
            <button type="button" onClick={createSlide} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
              <Plus className="h-3 w-3" /> New
            </button>
          </div>
          <div className="mt-2 space-y-1">
            {lesson?.slides.map((slide: Slide) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setSelectedSlideId(slide.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${selectedSlide?.id === slide.id ? "bg-ink text-white" : "hover:bg-slate-50"}`}
              >
                {slide.order_index}. {slide.title}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Slide title
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-md border p-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">
            Body
            <textarea value={body} onChange={(event) => setBody(event.target.value)} className="mt-1 min-h-28 w-full rounded-md border p-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">
            Image URL
            <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} className="mt-1 w-full rounded-md border p-3 text-sm" />
          </label>
          <button type="button" onClick={saveSlide} className="inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2 text-sm text-white">
            <Save className="h-4 w-4" /> Save slide
          </button>
          {status ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p> : null}
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}

