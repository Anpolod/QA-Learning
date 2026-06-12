"use client";

import { useState } from "react";
import { KeyRound, Save, SlidersHorizontal } from "lucide-react";
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
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [openrouterApiKey, setOpenrouterApiKey] = useState("");
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
        dailyImageLimitAdmin,
        // Send keys only when the admin typed something, so a blank field never clears a stored key.
        ...(openaiApiKey.trim() ? { openaiApiKey: openaiApiKey.trim() } : {}),
        ...(openrouterApiKey.trim() ? { openrouterApiKey: openrouterApiKey.trim() } : {})
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
      setOpenaiApiKey("");
      setOpenrouterApiKey("");
      setStatus("AI settings saved.");
    } catch {
      setError("AI settings could not be saved.");
    }
  }

  async function clearKey(target: "openai" | "openrouter") {
    setStatus("");
    setError("");
    try {
      const updated = await api.updateAiSettings(
        target === "openai" ? { openaiApiKey: "" } : { openrouterApiKey: "" }
      );
      setOpenaiConfigured(updated.openaiConfigured);
      setOpenrouterConfigured(updated.openrouterConfigured);
      setStatus(`${target === "openai" ? "OpenAI" : "OpenRouter"} key cleared.`);
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
          <p className="mt-1 text-sm text-slate-600">Manage AI provider, model, request limits, and provider API keys.</p>
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
      <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-coral" />
          <h3 className="text-sm font-semibold">Provider API keys</h3>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Stored on the backend and never shown again. Leave a field blank to keep the current key. Saving a new value replaces it.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-medium">
            OpenAI API key{" "}
            <span className={`text-xs font-normal ${openaiConfigured ? "text-emerald-600" : "text-red-500"}`}>
              ({openaiConfigured ? "configured" : "missing"})
            </span>
            <input
              type="password"
              autoComplete="off"
              value={openaiApiKey}
              onChange={(event) => setOpenaiApiKey(event.target.value)}
              placeholder={openaiConfigured ? "••••••••  (saved)" : "sk-..."}
              className="mt-1 w-full rounded-md border p-3 text-sm"
            />
            {openaiConfigured ? (
              <button type="button" onClick={() => clearKey("openai")} className="mt-1 text-xs text-red-500 underline">
                Clear stored key
              </button>
            ) : null}
          </label>
          <label className="block text-sm font-medium">
            OpenRouter API key{" "}
            <span className={`text-xs font-normal ${openrouterConfigured ? "text-emerald-600" : "text-red-500"}`}>
              ({openrouterConfigured ? "configured" : "missing"})
            </span>
            <input
              type="password"
              autoComplete="off"
              value={openrouterApiKey}
              onChange={(event) => setOpenrouterApiKey(event.target.value)}
              placeholder={openrouterConfigured ? "••••••••  (saved)" : "sk-or-..."}
              className="mt-1 w-full rounded-md border p-3 text-sm"
            />
            {openrouterConfigured ? (
              <button type="button" onClick={() => clearKey("openrouter")} className="mt-1 text-xs text-red-500 underline">
                Clear stored key
              </button>
            ) : null}
          </label>
        </div>
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
