"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("Demo Student");
  const [email, setEmail] = useState("");
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
      const response = await api.register({ email, password, full_name: fullName });
      // Token is set by the backend as an httpOnly cookie; only the user object is kept client-side.
      localStorage.setItem("qa_learning_user", JSON.stringify(response.user));
      window.dispatchEvent(new Event("auth-change"));
      setStatus(`Account created for ${response.user.email}`);
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next || "/dashboard");
    } catch {
      setError("Registration failed. The email may already be registered or the password is too short.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-bold">Register</h1>
      <form onSubmit={submit} className="mt-6 space-y-3 rounded-lg border border-slate-200 bg-white p-5">
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-md border p-3 text-sm" placeholder="Full name" />
        <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border p-3 text-sm" placeholder="Email" type="email" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-md border p-3 text-sm" placeholder="Password" type="password" />
        <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-white disabled:opacity-60">
          <UserPlus className="h-4 w-4" /> {loading ? "Creating account..." : "Create account"}
        </button>
        {status ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p> : null}
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </form>
      <p className="mt-4 text-sm text-slate-600">Already registered? <Link href="/login" className="font-medium text-ink">Login</Link></p>
    </main>
  );
}
