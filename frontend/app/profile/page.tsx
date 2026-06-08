"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Mail, RefreshCw, Save, Shield, Target, User } from "lucide-react";
import { api } from "@/lib/api";

type ProfileUser = {
  id: number;
  email: string;
  role: string;
  fullName: string;
  goal: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftGoal, setDraftGoal] = useState("Become a job-ready QA engineer");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function loadProfile() {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("qa_learning_token");
    if (!token) {
      setUser(null);
      setError("You are not logged in yet.");
      setLoading(false);
      return;
    }
    try {
      const response = await api.me(token);
      setUser(response);
      setDraftName(response.fullName);
      setDraftGoal(response.goal || "Become a job-ready QA engineer");
    } catch {
      setUser(null);
      setError("Session is invalid or expired. Please log in again.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("qa_learning_token");
    localStorage.removeItem("qa_learning_user");
    setUser(null);
    setError("You are logged out.");
  }

  async function saveProfile() {
    const token = localStorage.getItem("qa_learning_token");
    if (!token) {
      setError("You are not logged in yet.");
      return;
    }
    setSaving(true);
    setStatus("");
    setError("");
    try {
      const updated = await api.updateProfile(token, { fullName: draftName, goal: draftGoal });
      setUser(updated);
      localStorage.setItem("qa_learning_user", JSON.stringify(updated));
      setStatus("Profile saved.");
    } catch {
      setError("Profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-coral">Profile</p>
          <h1 className="text-3xl font-bold">Student profile</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={loadProfile} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? <p className="text-sm text-slate-600">Loading profile...</p> : null}
        {!loading && error ? (
          <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
            <p>{error}</p>
            <Link href="/login" className="mt-3 inline-flex rounded-md bg-ink px-3 py-2 text-white">Login</Link>
          </div>
        ) : null}
        {!loading && user ? (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-md bg-slate-50 p-4">
            <User className="h-5 w-5 text-mint" />
            <p className="mt-3 text-sm text-slate-500">Name</p>
            <h2 className="font-semibold">{user.fullName || "Not set"}</h2>
          </div>
          <div className="rounded-md bg-slate-50 p-4">
            <Mail className="h-5 w-5 text-mint" />
            <p className="mt-3 text-sm text-slate-500">Email</p>
            <h2 className="break-words font-semibold">{user.email}</h2>
          </div>
          <div className="rounded-md bg-slate-50 p-4">
            <Shield className="h-5 w-5 text-mint" />
            <p className="mt-3 text-sm text-slate-500">Role</p>
            <h2 className="font-semibold">{user.role}</h2>
          </div>
          <div className="rounded-md bg-slate-50 p-4">
            <Target className="h-5 w-5 text-mint" />
            <p className="mt-3 text-sm text-slate-500">Goal</p>
            <h2 className="font-semibold">{user.goal || "Become a job-ready QA engineer"}</h2>
          </div>
        </div>
        ) : null}
      </section>
      {!loading && user ? (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Edit profile</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium">
              Full name
              <input value={draftName} onChange={(event) => setDraftName(event.target.value)} className="mt-1 w-full rounded-md border p-3 text-sm" />
            </label>
            <label className="block text-sm font-medium">
              Learning goal
              <input value={draftGoal} onChange={(event) => setDraftGoal(event.target.value)} className="mt-1 w-full rounded-md border p-3 text-sm" />
            </label>
          </div>
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save profile"}
          </button>
          {status ? <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p> : null}
        </section>
      ) : null}
    </main>
  );
}
