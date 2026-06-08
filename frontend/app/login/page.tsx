"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    setError("");
    try {
      const response = await api.login({ email, password });
      localStorage.setItem("qa_learning_token", response.accessToken);
      localStorage.setItem("qa_learning_user", JSON.stringify(response.user));
      window.dispatchEvent(new Event("auth-change"));
      setStatus(`Logged in as ${response.user.email}`);
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next || (response.user.role === "admin" ? "/admin" : "/dashboard"));
    } catch {
      setError("Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-bold">Login</h1>
      <form onSubmit={submit} className="mt-6 space-y-3 rounded-lg border border-slate-200 bg-white p-5">
        <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border p-3 text-sm" placeholder="Email" type="email" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-md border p-3 text-sm" placeholder="Password" type="password" />
        <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-white disabled:opacity-60">
          <LogIn className="h-4 w-4" /> {loading ? "Logging in..." : "Login"}
        </button>
        {status ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p> : null}
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </form>
      <p className="mt-4 text-sm text-slate-600">No account yet? <Link href="/register" className="font-medium text-ink">Register</Link></p>
    </main>
  );
}
