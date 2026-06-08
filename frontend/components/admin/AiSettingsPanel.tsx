"use client";

import { useState } from "react";
import { Save, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";

export type AiSettings = {
  provider: string;
  textModel: string;
  imageModel: string;
  temperature: number;
  maxTokens: number;
  dailyTextLimitPerUser: number;
  dailyImageLimitPerUser: number;
  dailyImageLimitAdmin: number;
  openaiConfigured: boolean;
  openrouterConfigured: boolean;
};

type Props = {
  initialSettings: AiSettings | null;
};

export function AiSettingsPanel({ initialSettings }: Props) {
  const [provider, setProvider] = useState<"openai" | "openrouter">((initialSettings?.provider as "openai" | "openrouter") ?? "openai");
  const [textModel, setTextModel] = useState(initialSettings?.textModel ?? "gpt-4o-mini");
  const [imageModel, setImageModel] = useState(initialSettings?.imageModel ?? "gpt-image-1");
  const [temperature, setTemperature] = useState(initialSettings?.temperature ?? 0.3);
  const [maxTokens, setMaxTokens] = useState(initialSettings?.maxTokens ?? 1200);
  const [dailyTextLimitPerUser, setDailyTextLimitPerUser] = useState(initialSettings?.dailyTextLimitPerUser ?? 50);
  const [dailyImageLimitPerUser, setDailyImageLimitPerUser] = useState(initialSettings?.dailyImageLimitPerUser ?? 10);
  const [dailyImageLimitAdmin, setDailyImageLimitAdmin] = useState(initialSettings?.dailyImageLimitAdmin ?? 100);
  const [openaiConfigured, setOpenaiConfigured] = useState(initialSettings?.openaiConfigured ?? false);
  const [openrouterConfigured, setOpenrouterConfigured] = useState(initialSettings?.openrouterConfigured ?? false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(initialSettings ? "" : "AI settings are unavailable.");

  async function save() {
    setStatus("");
    setError("");
    try {
      const updated = await api.updateAiSettings({
        provider,
        textModel,
        imageModel,
        temperature,
        maxTokens,
        dailyTextLimitPerUser,
        dailyImageLimitPerUser,
        dailyImageLimitAdmin
      });
      setProvider(updated.provider as "openai" | "openrouter");
      setTextModel(updated.textModel);
      setImageModel(updated.imageModel);
      setTemperature(updated.temperature);
      setMaxTokens(updated.maxTokens);
      setDailyTextLimitPerUser(updated.dailyTextLimitPerUser);
      setDailyImageLimitPerUser(updated.dailyImageLimitPerUser);
      setDailyImageLimitAdmin(updated.dailyImageLimitAdmin);
      setOpenaiConfigured(updated.openaiConfigured);
      setOpenrouterConfigured(updated.openrouterConfigured);
      setStatus("AI settings saved.");
    } catch {
      setError("AI settings could not be saved.");
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-coral" />
        <div>
          <h2 className="font-semibold">AI settings</h2>
          <p className="mt-1 text-sm text-slate-600">Manage non-secret AI provider, model, and request limits.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block text-sm font-medium">
          Text provider
          <select value={provider} onChange={(event) => setProvider(event.target.value as "openai" | "openrouter")} className="mt-1 w-full rounded-md border p-3 text-sm">
            <option value="openai">OpenAI</option>
            <option value="openrouter">OpenRouter</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Text model
          <input value={textModel} onChange={(event) => setTextModel(event.target.value)} className="mt-1 w-full rounded-md border p-3 text-sm" />
        </label>
        <label className="block text-sm font-medium">
          Image model
          <input value={imageModel} onChange={(event) => setImageModel(event.target.value)} className="mt-1 w-full rounded-md border p-3 text-sm" />
        </label>
        <label className="block text-sm font-medium">
          Temperature
          <input
            type="number"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(event) => setTemperature(Number(event.target.value))}
            className="mt-1 w-full rounded-md border p-3 text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          Max tokens
          <input type="number" value={maxTokens} onChange={(event) => setMaxTokens(Number(event.target.value))} className="mt-1 w-full rounded-md border p-3 text-sm" />
        </label>
        <label className="block text-sm font-medium">
          Text limit per user
          <input
            type="number"
            value={dailyTextLimitPerUser}
            onChange={(event) => setDailyTextLimitPerUser(Number(event.target.value))}
            className="mt-1 w-full rounded-md border p-3 text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          Image limit per user
          <input
            type="number"
            value={dailyImageLimitPerUser}
            onChange={(event) => setDailyImageLimitPerUser(Number(event.target.value))}
            className="mt-1 w-full rounded-md border p-3 text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          Admin image limit
          <input
            type="number"
            value={dailyImageLimitAdmin}
            onChange={(event) => setDailyImageLimitAdmin(Number(event.target.value))}
            className="mt-1 w-full rounded-md border p-3 text-sm"
          />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2 text-sm text-white">
          <Save className="h-4 w-4" /> Save AI settings
        </button>
        <p className="text-xs text-slate-500">OpenAI key: {openaiConfigured ? "Configured" : "Missing"}</p>
        <p className="text-xs text-slate-500">OpenRouter key: {openrouterConfigured ? "Configured" : "Missing"}</p>
      </div>
      {status ? <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p> : null}
      {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
