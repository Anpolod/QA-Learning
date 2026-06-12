"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lock, LogIn, UserPlus } from "lucide-react";

// Client-side gate for learning content. The catalog stays public; opening a
// lesson/quiz/homework requires an account. Auth state lives in localStorage
// (httpOnly cookie + qa_learning_user), so the check runs on the client after mount.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [next, setNext] = useState("/");

  useEffect(() => {
    setNext(window.location.pathname + window.location.search);
    // Auth token is an httpOnly cookie; the readable user object signals "signed in".
    const sync = () => setAuthed(Boolean(localStorage.getItem("qa_learning_user")));
    sync();
    // A 401 from any API call clears the user and fires auth-change, so an expired
    // session flips this gate back to the login card instead of breaking silently.
    window.addEventListener("auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (authed === null) {
    return <main className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-slate-400">Loading…</main>;
  }

  if (!authed) {
    const q = `?next=${encodeURIComponent(next)}`;
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-coral/10">
            <Lock className="h-6 w-6 text-coral" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Create an account to start</h1>
          <p className="mt-2 text-sm text-slate-600">
            Browsing the catalog is free. To start a lesson and track your progress, register or log in.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={`/register${q}`}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-medium text-white"
            >
              <UserPlus className="h-4 w-4" /> Create account
            </Link>
            <Link
              href={`/login${q}`}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-3 text-sm font-medium"
            >
              <LogIn className="h-4 w-4" /> I already have an account
            </Link>
          </div>
          <Link href="/courses" className="mt-5 inline-block text-xs text-slate-500 underline">
            Back to course catalog
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
