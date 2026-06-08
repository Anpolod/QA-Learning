"use client";

type AiImagePromptFormProps = {
  prompt: string;
  onPromptChange: (value: string) => void;
};

export function AiImagePromptForm({ prompt, onPromptChange }: AiImagePromptFormProps) {
  return (
    <textarea
      value={prompt}
      onChange={(event) => onPromptChange(event.target.value)}
      className="min-h-28 w-full rounded-md border border-slate-200 p-3 text-sm"
      placeholder="Describe the educational image"
    />
  );
}

