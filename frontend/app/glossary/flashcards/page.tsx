"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Shuffle, Check, X } from "lucide-react";
import { api } from "@/lib/api";

type Term = { slug: string; term: string; definition: string; category: string };

function shuffle<T>(arr: T[], seed: number): T[] {
  // Deterministic-ish Fisher-Yates using a simple LCG so re-renders don't reshuffle.
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [category, setCategory] = useState("All");
  const [seed, setSeed] = useState(1);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [review, setReview] = useState(0);

  useEffect(() => {
    api.glossary().then(setTerms).catch(() => {});
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(terms.map((t) => t.category))).sort()], [terms]);

  const deck = useMemo(() => {
    const filtered = category === "All" ? terms : terms.filter((t) => t.category === category);
    return shuffle(filtered, seed);
  }, [terms, category, seed]);

  function restart(newSeed = seed) {
    setSeed(newSeed);
    setIndex(0);
    setFlipped(false);
    setKnown(0);
    setReview(0);
  }

  function rate(got: boolean) {
    if (got) setKnown((k) => k + 1);
    else setReview((r) => r + 1);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  const card = deck[index];
  const done = deck.length > 0 && index >= deck.length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/glossary" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-coral">
        <ArrowLeft className="h-4 w-4" /> Glossary
      </Link>
      <h1 className="mt-3 text-3xl font-bold text-ink">Glossary Flashcards</h1>
      <p className="mt-2 text-slate-600">Recall the definition, then flip to check. Rate yourself to track the round.</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            restart();
          }}
          className="rounded-md border border-slate-300 bg-paper px-3 py-2 text-sm"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => restart(seed + 1)}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm hover:border-coral"
        >
          <Shuffle className="h-4 w-4" /> Shuffle
        </button>
        <span className="ml-auto text-sm text-slate-500">
          {deck.length ? Math.min(index + (done ? 0 : 1), deck.length) : 0}/{deck.length} · ✓ {known} · ↻ {review}
        </span>
      </div>

      {!terms.length ? (
        <p className="mt-8 text-sm text-slate-500">Loading…</p>
      ) : done ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-ink">Round complete</p>
          <p className="mt-2 text-slate-600">
            Knew {known} of {deck.length} ({Math.round((known / deck.length) * 100)}%). Reviewed {review}.
          </p>
          <button
            type="button"
            onClick={() => restart(seed + 1)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white hover:bg-coral/90"
          >
            <RotateCcw className="h-4 w-4" /> New round
          </button>
        </div>
      ) : card ? (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:border-coral"
          >
            {flipped ? (
              <>
                <span className="text-xs uppercase tracking-wide text-slate-400">{card.category}</span>
                <p className="mt-2 text-base leading-7 text-slate-700">{card.definition}</p>
              </>
            ) : (
              <>
                <span className="text-xs uppercase tracking-wide text-slate-400">Term</span>
                <p className="mt-2 text-2xl font-bold text-ink">{card.term}</p>
                <span className="mt-4 text-xs text-slate-400">Tap to reveal definition</span>
              </>
            )}
          </button>
          {flipped ? (
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => rate(false)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-amber/40 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber/5"
              >
                <X className="h-4 w-4" /> Need review
              </button>
              <button
                type="button"
                onClick={() => rate(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-mint/40 px-4 py-2.5 text-sm font-medium text-mint hover:bg-mint/5"
              >
                <Check className="h-4 w-4" /> Got it
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-8 text-sm text-slate-500">No terms in this category.</p>
      )}
    </main>
  );
}
