"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { api } from "@/lib/api";
import type { Slide } from "@/types/course";

type Props = {
  imageUrl: string;
  lessonId: string;
};

export function AiImageAttachDialog({ imageUrl, lessonId }: Props) {
  const [open, setOpen] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [slideId, setSlideId] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function loadSlides() {
    setError("");
    try {
      const lesson = await api.lesson(lessonId);
      setSlides(lesson.slides);
      setSlideId(lesson.slides[0]?.id ?? null);
    } catch {
      setError("Slides could not be loaded.");
    }
  }

  async function attachToSlide() {
    const slide = slides.find((item) => item.id === slideId);
    if (!slide || !imageUrl) return;
    setStatus("");
    setError("");
    try {
      const updated = await api.updateSlide(slide.id, { image_url: imageUrl });
      setSlides((items) => items.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      setStatus("Image attached to slide.");
    } catch {
      setError("Image could not be attached to slide.");
    }
  }

  useEffect(() => {
    if (open) loadSlides();
  }, [open, lessonId]);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={!imageUrl}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Save className="h-4 w-4" />
        Attach to slide
      </button>
      {open ? (
        <div className="absolute left-0 top-12 z-10 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
          <h3 className="font-semibold">Attach generated image</h3>
          <p className="mt-1 text-sm text-slate-600">Select a slide in this lesson.</p>
          <label className="mt-3 block text-sm font-medium">
            Slide
            <select
              value={slideId ?? ""}
              onChange={(event) => setSlideId(Number(event.target.value))}
              className="mt-1 w-full rounded-md border p-2 text-sm"
            >
              {slides.map((slide) => (
                <option key={slide.id} value={slide.id}>{slide.order_index}. {slide.title}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={attachToSlide}
            disabled={!slideId || !imageUrl}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-mint px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> Save to slide
          </button>
          {status ? <p className="mt-3 rounded-md bg-emerald-50 p-2 text-xs text-emerald-700">{status}</p> : null}
          {error ? <p className="mt-3 rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
