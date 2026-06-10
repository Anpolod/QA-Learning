"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClipboardList, Bug, Table2, FileText, Code2, BarChart3, Network, Sparkles, Loader2, CheckCircle2, AlertTriangle, XCircle, Plus, Trash2 } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { api, type DocAttempt, type DocReview, type DocScenario } from "@/lib/api";

type DocType = "test_case" | "bug_report" | "decision_table" | "test_plan" | "bdd" | "test_summary" | "traceability";

type FieldDef = { name: string; label: string; multiline?: boolean; hint?: string; options?: string[] };

const FIELDS: Record<string, FieldDef[]> = {
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
  ],
  test_plan: [
    { name: "title", label: "Title", hint: "e.g. 'Test plan — checkout & payment release'" },
    { name: "scope", label: "Scope (in / out)", multiline: true, hint: "What IS and is NOT tested" },
    { name: "approach", label: "Approach", multiline: true, hint: "Test levels, types, manual/automation" },
    { name: "entry_criteria", label: "Entry criteria", multiline: true, hint: "When testing can start (measurable)" },
    { name: "exit_criteria", label: "Exit criteria", multiline: true, hint: "When testing is done (measurable)" },
    { name: "risks", label: "Risks & mitigation", multiline: true, hint: "Real risks + how to handle them" },
    { name: "schedule", label: "Schedule & resources", multiline: true, hint: "Who, how long" }
  ],
  bdd: [
    { name: "title", label: "Title", hint: "Feature under test" },
    { name: "feature", label: "Feature", multiline: true, hint: "One-line feature description / user story" },
    {
      name: "scenarios",
      label: "Scenarios (Given/When/Then)",
      multiline: true,
      hint: "One scenario per block: Given … / When … / Then …. Cover happy + edge cases."
    }
  ],
  test_summary: [
    { name: "title", label: "Title", hint: "e.g. 'Test summary — Sprint 12 regression'" },
    { name: "summary", label: "Summary", multiline: true, hint: "What was tested, overall outcome" },
    { name: "metrics", label: "Metrics", multiline: true, hint: "Planned/executed/passed/failed, pass rate" },
    { name: "open_defects", label: "Open defects", multiline: true, hint: "By severity (criticals, majors…)" },
    { name: "risks", label: "Residual risk", multiline: true, hint: "What risk remains if shipped" },
    { name: "recommendation", label: "Release recommendation", multiline: true, hint: "Go / no-go / conditional + why" }
  ]
};

const TABS: { type: DocType; label: string; icon: typeof Bug }[] = [
  { type: "test_case", label: "Test Case", icon: ClipboardList },
  { type: "bug_report", label: "Bug Report", icon: Bug },
  { type: "decision_table", label: "Decision Table", icon: Table2 },
  { type: "test_plan", label: "Test Plan", icon: FileText },
  { type: "bdd", label: "Given/When/Then", icon: Code2 },
  { type: "test_summary", label: "Summary Report", icon: BarChart3 },
  { type: "traceability", label: "Traceability", icon: Network }
];

const DOC_NOUN: Record<DocType, string> = {
  test_case: "test case",
  bug_report: "bug report",
  decision_table: "decision table",
  test_plan: "test plan",
  bdd: "Given/When/Then scenarios",
  test_summary: "test summary report",
  traceability: "traceability matrix"
};

const GRID_TYPES = new Set<DocType>(["decision_table", "traceability"]);

const ICON_BY_TYPE = Object.fromEntries(TABS.map((t) => [t.type, t.icon])) as Record<DocType, typeof Bug>;

type DTRule = { vals: string[]; action: string };
type DTState = { conditions: string[]; rules: DTRule[] };

function emptyDecisionTable(): DTState {
  return {
    conditions: ["", ""],
    rules: [
      { vals: ["Y", "Y"], action: "" },
      { vals: ["Y", "N"], action: "" }
    ]
  };
}

// Serialise the grid into the flat fields the backend reviewer expects.
function serializeDecisionTable(title: string, dt: DTState): Record<string, string> {
  const conds = dt.conditions.map((c, i) => `${i + 1}. ${c || "(unnamed)"}`).join("\n");
  const rules = dt.rules
    .map((r, j) => `R${j + 1}: ` + dt.conditions.map((c, i) => `${c || "C" + (i + 1)}=${r.vals[i] ?? "-"}`).join(", "))
    .join("\n");
  const actions = dt.rules.map((r, j) => `R${j + 1}: ${r.action || "(no action)"}`).join("\n");
  return { title, conditions: conds, rules, actions };
}

function DecisionTableEditor({ value, onChange }: { value: DTState; onChange: (dt: DTState) => void }) {
  const { conditions, rules } = value;

  function setCondition(i: number, label: string) {
    onChange({ ...value, conditions: conditions.map((c, idx) => (idx === i ? label : c)) });
  }
  function addCondition() {
    onChange({ conditions: [...conditions, ""], rules: rules.map((r) => ({ ...r, vals: [...r.vals, "-"] })) });
  }
  function removeCondition(i: number) {
    if (conditions.length <= 1) return;
    onChange({
      conditions: conditions.filter((_, idx) => idx !== i),
      rules: rules.map((r) => ({ ...r, vals: r.vals.filter((_, idx) => idx !== i) }))
    });
  }
  function setVal(ruleIdx: number, condIdx: number, v: string) {
    onChange({
      ...value,
      rules: rules.map((r, idx) => (idx === ruleIdx ? { ...r, vals: r.vals.map((x, k) => (k === condIdx ? v : x)) } : r))
    });
  }
  function setAction(ruleIdx: number, action: string) {
    onChange({ ...value, rules: rules.map((r, idx) => (idx === ruleIdx ? { ...r, action } : r)) });
  }
  function addRule() {
    onChange({ ...value, rules: [...rules, { vals: conditions.map(() => "-"), action: "" }] });
  }
  function removeRule(j: number) {
    if (rules.length <= 1) return;
    onChange({ ...value, rules: rules.filter((_, idx) => idx !== j) });
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-ink">Conditions</label>
          <button type="button" onClick={addCondition} className="inline-flex items-center gap-1 text-xs font-medium text-coral hover:underline">
            <Plus className="h-3.5 w-3.5" /> Condition
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {conditions.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 text-xs text-slate-400">C{i + 1}</span>
              <input
                value={c}
                onChange={(e) => setCondition(i, e.target.value)}
                placeholder="e.g. Customer is a member"
                className="flex-1 rounded-md border border-slate-300 bg-paper px-3 py-1.5 text-sm"
              />
              <button type="button" onClick={() => removeCondition(i)} className="text-slate-300 hover:text-coral" aria-label="Remove condition">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-ink">Rules</label>
          <button type="button" onClick={addRule} className="inline-flex items-center gap-1 text-xs font-medium text-coral hover:underline">
            <Plus className="h-3.5 w-3.5" /> Rule
          </button>
        </div>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-slate-200 bg-slate-50 p-2 text-left text-xs font-semibold text-slate-500">Condition</th>
                {rules.map((_, j) => (
                  <th key={j} className="border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-500">
                    <div className="flex items-center justify-center gap-1">
                      R{j + 1}
                      <button type="button" onClick={() => removeRule(j)} className="text-slate-300 hover:text-coral" aria-label="Remove rule">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {conditions.map((c, i) => (
                <tr key={i}>
                  <td className="border border-slate-200 p-2 text-slate-700">{c || `C${i + 1}`}</td>
                  {rules.map((r, j) => (
                    <td key={j} className="border border-slate-200 p-1 text-center">
                      <select value={r.vals[i] ?? "-"} onChange={(e) => setVal(j, i, e.target.value)} className="rounded bg-paper px-1 py-1 text-sm">
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                        <option value="-">–</option>
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-500">Action / outcome</td>
                {rules.map((r, j) => (
                  <td key={j} className="border border-slate-200 p-1">
                    <input
                      value={r.action}
                      onChange={(e) => setAction(j, e.target.value)}
                      placeholder="outcome"
                      className="w-full min-w-[90px] rounded bg-paper px-2 py-1 text-sm"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          For {conditions.length} boolean condition{conditions.length === 1 ? "" : "s"} a complete table usually needs{" "}
          {2 ** conditions.length} rules (use “–” for don’t-care).
        </p>
      </div>
    </div>
  );
}

type TraceRow = { requirement: string; tests: string; status: string };
type TraceState = { rows: TraceRow[] };
const TRACE_STATUS = ["Covered", "Partial", "Not covered"];

function emptyTraceability(): TraceState {
  return {
    rows: [
      { requirement: "", tests: "", status: "Covered" },
      { requirement: "", tests: "", status: "Covered" },
      { requirement: "", tests: "", status: "Not covered" }
    ]
  };
}

function serializeTraceability(title: string, t: TraceState): Record<string, string> {
  const rows = t.rows;
  const requirements = rows.map((r, i) => `REQ-${i + 1}: ${r.requirement || "(unnamed)"}`).join("\n");
  const matrix = rows
    .map((r, i) => `REQ-${i + 1} -> tests: ${r.tests || "(none)"} [${r.status}]`)
    .join("\n");
  const covered = rows.filter((r) => r.tests.trim() && r.status !== "Not covered").length;
  return { title, requirements, matrix, coverage_notes: `${covered}/${rows.length} requirements traced to a test.` };
}

function TraceabilityEditor({ value, onChange }: { value: TraceState; onChange: (t: TraceState) => void }) {
  const { rows } = value;
  function setRow(i: number, patch: Partial<TraceRow>) {
    onChange({ rows: rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });
  }
  function addRow() {
    onChange({ rows: [...rows, { requirement: "", tests: "", status: "Covered" }] });
  }
  function removeRow(i: number) {
    if (rows.length <= 1) return;
    onChange({ rows: rows.filter((_, idx) => idx !== i) });
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-ink">Requirements → tests</label>
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1 text-xs font-medium text-coral hover:underline">
          <Plus className="h-3.5 w-3.5" /> Requirement
        </button>
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-slate-200 bg-slate-50 p-2 text-left text-xs font-semibold text-slate-500">#</th>
              <th className="border border-slate-200 bg-slate-50 p-2 text-left text-xs font-semibold text-slate-500">Requirement</th>
              <th className="border border-slate-200 bg-slate-50 p-2 text-left text-xs font-semibold text-slate-500">Test case(s)</th>
              <th className="border border-slate-200 bg-slate-50 p-2 text-left text-xs font-semibold text-slate-500">Status</th>
              <th className="border border-slate-200 bg-slate-50 p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="border border-slate-200 p-2 text-xs text-slate-400">REQ-{i + 1}</td>
                <td className="border border-slate-200 p-1">
                  <input value={r.requirement} onChange={(e) => setRow(i, { requirement: e.target.value })} placeholder="e.g. Valid login succeeds" className="w-full min-w-[140px] rounded bg-paper px-2 py-1 text-sm" />
                </td>
                <td className="border border-slate-200 p-1">
                  <input value={r.tests} onChange={(e) => setRow(i, { tests: e.target.value })} placeholder="e.g. TC-01, TC-02" className="w-full min-w-[110px] rounded bg-paper px-2 py-1 text-sm" />
                </td>
                <td className="border border-slate-200 p-1">
                  <select value={r.status} onChange={(e) => setRow(i, { status: e.target.value })} className="rounded bg-paper px-1 py-1 text-sm">
                    {TRACE_STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-slate-200 p-1 text-center">
                  <button type="button" onClick={() => removeRow(i)} className="text-slate-300 hover:text-coral" aria-label="Remove requirement">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-400">Every requirement should map to at least one test with a status.</p>
    </div>
  );
}

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
  const fieldDefs = FIELDS[docType] ?? [];
  const isDecisionTable = docType === "decision_table";
  const isTraceability = docType === "traceability";
  const isGrid = GRID_TYPES.has(docType);
  const [scenarios, setScenarios] = useState<DocScenario[]>([]);
  const [scenarioId, setScenarioId] = useState<number | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [dtTitle, setDtTitle] = useState("");
  const [dt, setDt] = useState<DTState>(emptyDecisionTable());
  const [trace, setTrace] = useState<TraceState>(emptyTraceability());
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState<DocReview | null>(null);
  const [error, setError] = useState("");
  const reviewRef = useRef<HTMLDivElement>(null);

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
      const fields = isDecisionTable
        ? serializeDecisionTable(dtTitle, dt)
        : isTraceability
          ? serializeTraceability(dtTitle, trace)
          : values;
      const result = await api.reviewDoc({ scenario_id: scenarioId, doc_type: docType, fields });
      setReview(result);
      setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
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
          {isGrid ? (
            <>
              <div>
                <label className="text-sm font-medium text-ink">Title</label>
                <input
                  value={dtTitle}
                  onChange={(e) => setDtTitle(e.target.value)}
                  placeholder={isTraceability ? "e.g. Traceability — login" : "e.g. Checkout discount eligibility"}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-paper px-3 py-2 text-sm"
                />
              </div>
              {isDecisionTable ? (
                <DecisionTableEditor value={dt} onChange={setDt} />
              ) : (
                <TraceabilityEditor value={trace} onChange={setTrace} />
              )}
            </>
          ) : (
            fieldDefs.map((f) => (
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
            ))
          )}
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

      <aside ref={reviewRef} className="scroll-mt-6 lg:sticky lg:top-6 lg:self-start">
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
            Fill the {DOC_NOUN[docType]} and submit — an AI reviewer scores it and
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
        {attempts.map((a) => {
          const Icon = ICON_BY_TYPE[a.doc_type] ?? ClipboardList;
          return (
          <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-ink">{a.scenario_title}</span>
            </span>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreColor(a.score)}`}>{a.score}</span>
          </div>
          );
        })}
      </div>
    </section>
  );
}

export default function TestDocsPage() {
  const [tab, setTab] = useState<DocType>("test_case");
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("type");
    if (t === "bug_report" || t === "test_case") setTab(t);
  }, []);
  return (
    <RequireAuth>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold text-ink">Test Documentation Practice</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Practise writing test cases and bug reports against realistic scenarios. An AI reviewer scores each
          submission and explains what to improve.
        </p>

        <div className="mt-5 flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
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
