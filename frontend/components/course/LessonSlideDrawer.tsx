"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Layers, X } from "lucide-react";
import type { Slide } from "@/types/course";
import { mediaUrl } from "@/lib/api";

type LessonSlideDrawerProps = {
  lessonTitle: string;
  slides: Slide[];
};

export function LessonSlideDrawer({ lessonTitle, slides }: LessonSlideDrawerProps) {
  const orderedSlides = useMemo(() => [...slides].sort((a, b) => a.order_index - b.order_index), [slides]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = orderedSlides[activeIndex];

  if (!orderedSlides.length) {
    return null;
  }

  function showPrevious() {
    setActiveIndex((current) => Math.max(current - 1, 0));
  }

  function showNext() {
    setActiveIndex((current) => Math.min(current + 1, orderedSlides.length - 1));
  }

  function closeDrawer() {
    setIsFullscreen(false);
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          closeDrawer();
        }
      }
      if (event.key === "ArrowLeft") {
        showPrevious();
      }
      if (event.key === "ArrowRight") {
        showNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFullscreen, orderedSlides.length]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm transition hover:border-amber hover:bg-slate-50"
        aria-label="Open lesson slides"
      >
        <Layers className="h-4 w-4 text-amber" /> Slides
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-ink/35"
            aria-label="Close lesson slides"
            onClick={closeDrawer}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-5xl flex-col bg-white shadow-2xl md:w-[min(88vw,980px)]">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-coral">Lesson slides</p>
                <h2 className="mt-1 text-xl font-bold text-ink">{lessonTitle}</h2>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-md border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                aria-label="Close lesson slides"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="grid min-h-0 flex-1 lg:grid-cols-[240px_1fr]">
              <nav className="min-h-0 overflow-y-auto border-b border-slate-200 bg-slate-50 p-3 lg:border-b-0 lg:border-r">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {orderedSlides.map((slide, index) => (
                    <button
                      type="button"
                      key={slide.id}
                      onClick={() => {
                        setActiveIndex(index);
                        if (slide.image_url) {
                          setIsFullscreen(true);
                        }
                      }}
                      className={`rounded-md border p-2 text-left transition ${
                        index === activeIndex ? "border-coral bg-white shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <p className="text-xs text-slate-500">Slide {slide.order_index}</p>
                      <p className="mt-1 text-sm font-semibold leading-5 text-ink">{slide.title}</p>
                      {slide.image_url ? (
                        <img
                          src={mediaUrl(slide.image_url)}
                          alt=""
                          className="mt-2 aspect-video w-full rounded object-cover"
                        />
                      ) : null}
                    </button>
                  ))}
                </div>
              </nav>

              <section className="min-h-0 overflow-y-auto p-5">
                {activeSlide ? (
                  <div className="mx-auto max-w-4xl">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-500">
                          Slide {activeSlide.order_index} of {orderedSlides.length}
                        </p>
                        <h3 className="mt-1 text-2xl font-bold text-ink">{activeSlide.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        {activeSlide.image_url ? (
                          <button
                            type="button"
                            onClick={() => setIsFullscreen(true)}
                            className="rounded-md border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50"
                            aria-label="Open slide fullscreen"
                          >
                            <Expand className="h-5 w-5" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={showPrevious}
                          disabled={activeIndex === 0}
                          className="rounded-md border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Previous slide"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={showNext}
                          disabled={activeIndex === orderedSlides.length - 1}
                          className="rounded-md border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Next slide"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {activeSlide.image_url ? (
                      <button
                        type="button"
                        onClick={() => setIsFullscreen(true)}
                        className="mt-5 block w-full rounded-md border border-slate-200 bg-white p-0 shadow-sm transition hover:border-coral"
                        aria-label="Open slide fullscreen"
                      >
                        <img
                          src={mediaUrl(activeSlide.image_url)}
                          alt={activeSlide.title}
                          className="aspect-video w-full rounded-md object-contain"
                        />
                      </button>
                    ) : null}
                    <p className="mt-4 whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {activeSlide.body}
                    </p>
                  </div>
                ) : null}
              </section>
            </div>
          </aside>
        </div>
      ) : null}

      {isOpen && isFullscreen && activeSlide?.image_url ? (
        <div className="fixed inset-0 z-[60] bg-ink/95 p-4 text-white">
          <div className="mx-auto flex h-full max-w-7xl flex-col">
            <header className="flex items-start justify-between gap-4 pb-4">
              <div>
                <p className="text-sm text-slate-300">
                  Slide {activeSlide.order_index} of {orderedSlides.length}
                </p>
                <h2 className="mt-1 text-xl font-bold">{activeSlide.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="rounded-md border border-white/20 p-2 text-white transition hover:bg-white/10"
                aria-label="Close fullscreen slide"
              >
                <X className="h-6 w-6" />
              </button>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-[auto_1fr_auto] items-center gap-3">
              <button
                type="button"
                onClick={showPrevious}
                disabled={activeIndex === 0}
                className="rounded-full border border-white/20 p-3 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <img
                src={mediaUrl(activeSlide.image_url)}
                alt={activeSlide.title}
                className="max-h-[calc(100vh-150px)] w-full object-contain"
              />
              <button
                type="button"
                onClick={showNext}
                disabled={activeIndex === orderedSlides.length - 1}
                className="rounded-full border border-white/20 p-3 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next slide"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </div>

            <p className="mx-auto mt-4 max-w-4xl rounded-md bg-white/10 p-3 text-sm leading-6 text-slate-100">
              {activeSlide.body}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
