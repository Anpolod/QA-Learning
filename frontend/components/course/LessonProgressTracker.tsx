"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";

export function LessonProgressTracker({ lessonId }: { lessonId: number }) {
  useEffect(() => {
    api.updateProgress({ lesson_id: lessonId, opened: true }).catch(() => {
      // Progress tracking should never block reading the lesson.
    });
  }, [lessonId]);

  return null;
}
