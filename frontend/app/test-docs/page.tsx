"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, Bug, Sparkles, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { api, type DocAttempt, type DocReview, type DocScenario } from "@/lib/api";

type DocType = "test_case" | "bug_report";

type FieldDef = { name: string; label: string; multiline?: boolean; hint?: string; options?: string[] };

const FIELDS: Record<DocType, FieldDef[]> = {
  test_case: [
    { name: "title", label: "Title", hint: "Short, action-oriented (e.g. 'Login with valid credentials')" },
    { name: "preconditions", label: "Preconditions", multiline: true, hint: "State the system must be in before steps" },
    { name: "steps", label: "Steps", multiline: true, hint: "Numbered, one action per line" },
    { name: "test_data", label: "Test data", hint: "Inputs used (emails, values…)" },
    { name: "expected_result", label: "Expected result", multiline: true, hint: "Observable, verifiable outcome" },
    { name: "priority", label: "Priority", options: ["P1", "P2", "P3"] }
  ],
  bug_report: [
    { name: "title", label: "Title", hint: "What is broken, where (e.g. 'Cart total wrong after removing item')" },
    { name: "environment", label: "Environment", hint: "OS, browser/app version, device" },
    { name: "steps_to_reproduce", label: "Steps to reproduce", multiline: true, hint: "Numbered, minimal, deterministic" },
    { name: "expected_result", label: "Expected result", multiline: true },
    { name: "actual_result", label: "Actual result", multiline: true },
    { name: "severity", label: "Severity", options: ["Blocker", "Critical", "Major", "Minor", "Trivial"] },
    { name: "priority", label: "Priority", options: ["P1", "P2", "P3"] }
  ]
};

const TABS: { type: DocType; label: string; icon: typeof Bug }[] = [
  { type: "test_case", label: "Test Case", icon: ClipboardList },
  { type: "bug_report", label: "Bug Report", icon: Bug }
];

function scoreColor(score: number) {
  if (score >= 80) return "bg-mint/15 text-mint";
  if (score >= 50) return "bg-amber/15 text-amber-700";
  return "bg-coral/15 text-coral";
}

function RatingIcon({ rating }: { rating: string }) {
  if (rating === "good") return <CheckCircle2 className="h-4 w-4 text-mint" />;
  if (rating === "missing") return <XCircle className="h-4 w-4 text-coral" />;
  return <AlertTriangle className="h-4 w-4 text-amber-600" />;
}

function PracticePanel({ docType }: { docType: DocType }) {
  const fields = FIELDS[docType];
  const [scenarios, setScenarios] = useState<DocScenario[]>([]);
  const [scenarioId, setScenarioId] = useState<number | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState<DocReview | null>(null);
  const [error, setError] = useState("");

  const loadScenarios = useCallback(
    (selectFirst: boolean) => {
      api
        .docScenarios(docType)
        .then((list) => {
          setScenarios(list);
          if (selectFirst && list.length) setScenarioId(list[0].id);
        })
        .catch(() => setError("Could not load scenarios."));
    },
    [docType]
  );

  useEffect(() => {
    setReview(null);
    setValues({});
    setError("");
    loadScenarios(true);
  }, [loadScenarios]);

  const scenario = useMemo(() => scenarios.find((s) => s.id === scenarioId) ?? null, [scenarios, scenarioId]);

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      const created = await api.generateDocScenario(docType);
      setScenarios((prev) => [...prev, created]);
      setScenarioId(created.id);
      setValues({});
      setReview(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  async function submit() {
    if (!scenarioId) return;
    setSubmitting(true);
    setError("");
    setReview(null);
    try {
      const result = await api.reviewDoc({ scenario_id: scenarioId, doc_type: docType, fields: values });
      setReview(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Scenario</label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              value={scenarioId ?? ""}
              onChange={(e) => {
                setScenarioId(Number(e.target.value));
                setValues({});
                setReview(null);
              }}
              className="min-w-[220px] flex-1 rounded-md border border-slate-300 bg-paper px-3 py-2 text-sm"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                  {s.source === "ai" ? " ✦" : ""}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={generate}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-md border border-coral/40 px-3 py-2 text-sm font-medium text-coral hover:bg-coral/5 disabled:opacity-50"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              New (AI)
            </button>
          </div>
          {scenario ? (
            <div className="mt-3 rounded-md bg-paper p-3 text-sm">
              <p className="font-medium text-ink">{scenario.brief}</p>
              {scenario.context ? <p className="mt-1 text-slate-500">{scenario.context}</p> : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="text-sm font-medium text-ink">{f.label}</label>
              {f.hint ? <p className="text-xs text-slate-400">{f.hint}</p> : null}
              {f.options ? (
                <select
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-paper px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {f.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.multiline ? (
                <textarea
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-paper px-3 py-2 text-sm"
                />
              ) : (
                <input
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-paper px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={submit}
            disabled={submitting || !scenarioId}
            className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white hover:bg-coral/90 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Submit for review
          </button>
          {error ? <p className="text-sm text-coral">{error}</p> : null}
        </div>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        {review ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink">AI review</h3>
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${scoreColor(review.score)}`}>{review.score}/100</span>
            </div>
            {review.summary ? <p className="mt-2 text-sm text-slate-600">{review.summary}</p> : null}
            {review.fields.length ? (
              <ul className="mt-3 space-y-2">
                {review.fields.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <RatingIcon rating={f.rating} />
                    <span>
                      <span className="font-medium text-ink">{f.name}</span>
                      <span className="text-slate-600"> — {f.comment}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {review.improvements.length ? (
              <div className="mt-3 rounded-md bg-paper p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">How to improve</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-600">
                  {review.improvements.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            Fill the {docType === "test_case" ? "test case" : "bug report"} and submit — an AI reviewer scores it and
            points out what to fix.
          </div>
        )}
      </aside>
    </div>
  );
}

function History() {
  const [attempts, setAttempts] = useState<DocAttempt[]>([]);
  useEffect(() => {
    api.docAttempts().then(setAttempts).catch(() => {});
  }, []);
  if (!attempts.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-ink">Your history</h2>
      <div className="mt-3 space-y-2">
        {attempts.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
            <span className="flex items-center gap-2">
              {a.doc_type === "bug_report" ? <Bug className="h-4 w-4 text-coral" /> : <ClipboardList className="h-4 w-4 text-mint" />}
              <span className="font-medium text-ink">{a.scenario_title}</span>
            </span>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreColor(a.score)}`}>{a.score}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TestDocsPage() {
  const [tab, setTab] = useState<DocType>("test_case");
  return (
    <RequireAuth>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold text-ink">Test Documentation Practice</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Practise writing test cases and bug reports against realistic scenarios. An AI reviewer scores each
          submission and explains what to improve.
        </p>

        <div className="mt-5 inline-flex rounded-lg border border-slate-200 bg-white p-1">
          {TABS.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => setTab(type)}
              className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium ${
                tab === type ? "bg-coral text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <PracticePanel key={tab} docType={tab} />
        <History />
      </main>
    </RequireAuth>
  );
}
