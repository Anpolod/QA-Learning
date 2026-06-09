"use client";

import { useEffect, useMemo, useState } from "react";
import { BookMarked, Search } from "lucide-react";
import { api } from "@/lib/api";

type Term = { slug: string; term: string; definition: string; category: string };

const CATEGORY_COLOR: Record<string, string> = {
  Fundamentals: "bg-coral/10 text-coral",
  "Test Types": "bg-mint/10 text-mint",
  "Test Design": "bg-amber/10 text-amber-700",
  Documentation: "bg-slate-100 text-slate-600",
  "Process & Agile": "bg-coral/10 text-coral",
  Automation: "bg-mint/10 text-mint",
  "API & Web": "bg-slate-100 text-slate-600",
  "SQL & Data": "bg-amber/10 text-amber-700",
  "Tools & CI": "bg-slate-100 text-slate-600",
  "AI for QA": "bg-coral/10 text-coral"
};

export default function GlossaryPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .glossary()
      .then((data) => mounted && setTerms(data))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q));
  }, [terms, query]);

  const groups = useMemo(() => {
    const map = new Map<string, Term[]>();
    for (const t of filtered) {
      const letter = /[a-z]/i.test(t.term[0]) ? t.term[0].toUpperCase() : "#";
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(t);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const letters = groups.map((g) => g[0]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <BookMarked className="h-6 w-6 text-coral" />
          <h1 className="text-3xl font-bold text-ink">QA Glossary</h1>
        </div>
        <p className="mt-2 max-w-2xl text-slate-600">
          {terms.length} core testing terms used across the courses — definitions you can jump to from any lesson.
        </p>
        <div className="mt-5 flex items-center gap-2 rounded-md border border-slate-300 bg-paper px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms or definitions…"
            className="w-full bg-transparent text-sm outline-none"
            aria-label="Search glossary"
          />
        </div>
        {letters.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {letters.map((l) => (
              <a key={l} href={`#letter-${l}`} className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:border-coral hover:text-coral">
                {l}
              </a>
            ))}
          </div>
        ) : null}
      </section>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading glossary…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-slate-600">No terms match “{query}”.</p>
      ) : (
        <div className="mt-6 space-y-8">
          {groups.map(([letter, items]) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">{letter}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((t) => (
                  <article key={t.slug} id={t.slug} className="scroll-mt-20 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-ink">{t.term}</h3>
                      {t.category ? (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${CATEGORY_COLOR[t.category] ?? "bg-slate-100 text-slate-600"}`}>
                          {t.category}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{t.definition}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
