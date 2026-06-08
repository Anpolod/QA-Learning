"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Loader2, RefreshCw } from "lucide-react";
import { api, mediaUrl } from "@/lib/api";
import { AiGeneratedImagePreview } from "@/components/ai/AiGeneratedImagePreview";
import { AiImageAttachDialog } from "@/components/ai/AiImageAttachDialog";
import { AiImageHistory } from "@/components/ai/AiImageHistory";
import { AiImagePromptForm } from "@/components/ai/AiImagePromptForm";

const targetTypes = [
  "lesson_cover",
  "slide_image",
  "diagram",
  "workflow",
  "bug_example",
  "ui_mockup",
  "quiz_image",
  "homework_image",
  "interactive_task_image"
];

const styles = [
  "clean_educational",
  "modern_flat",
  "minimal_diagram",
  "isometric",
  "realistic_ui_mockup",
  "dark_tech",
  "friendly_learning"
];

export function AiImageGeneratorPanel({ lessonId = "1" }: { lessonId?: string }) {
  const [prompt, setPrompt] = useState("Bug lifecycle diagram for beginner QA students");
  const [targetType, setTargetType] = useState(targetTypes[2]);
  const [style, setStyle] = useState(styles[0]);
  const [size, setSize] = useState("1024x1024");
  const [imageUrl, setImageUrl] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.aiImages(6)
      .then((items) => setHistory(items.map((item) => mediaUrl(item.imageUrl))))
      .catch(() => {
        // Image history is helpful, but generation can work without it.
      });
  }, []);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const result = await api.aiImage({ prompt, lessonId, targetType, style, size });
      const url = mediaUrl(result.imageUrl);
      setImageUrl(url);
      setHistory((items) => [url, ...items].slice(0, 6));
    } catch {
      setError("Image generation failed. Check backend settings, permissions, and image limits.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <ImagePlus className="h-5 w-5 text-coral" />
        <h2 className="text-lg font-semibold">Generate image with AI</h2>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <AiImagePromptForm prompt={prompt} onPromptChange={setPrompt} />
          <div className="grid gap-3 sm:grid-cols-3">
            <select value={targetType} onChange={(event) => setTargetType(event.target.value)} className="rounded-md border p-2 text-sm">
              {targetTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select value={style} onChange={(event) => setStyle(event.target.value)} className="rounded-md border p-2 text-sm">
              {styles.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select value={size} onChange={(event) => setSize(event.target.value)} className="rounded-md border p-2 text-sm">
              <option>1024x1024</option>
              <option>1024x1536</option>
              <option>1536x1024</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={generate} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              Generate
            </button>
            <button type="button" onClick={generate} className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm">
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
            <AiImageAttachDialog imageUrl={imageUrl} lessonId={lessonId} />
          </div>
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        </div>
        <div>
          <AiGeneratedImagePreview imageUrl={imageUrl} />
          <AiImageHistory history={history} onSelect={setImageUrl} />
        </div>
      </div>
    </section>
  );
}
