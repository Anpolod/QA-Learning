"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Save, Shield, Trash2, Users } from "lucide-react";
import { api, type UserRead } from "@/lib/api";

type Props = {
  currentUserId: number;
};

type Role = "student" | "admin";

const defaultGoal = "Become a job-ready QA engineer";

export function UserManagerPanel({ currentUserId }: Props) {
  const [users, setUsers] = useState<UserRead[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [goal, setGoal] = useState(defaultGoal);
  const [role, setRole] = useState<Role>("student");
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const selectedUser = useMemo(() => users.find((user) => user.id === selectedUserId) ?? null, [selectedUserId, users]);

  function resetCreateForm() {
    setSelectedUserId(null);
    setEmail("");
    setFullName("");
    setGoal(defaultGoal);
    setRole("student");
    setPassword("");
    setIsCreating(true);
    setConfirmDelete(false);
    setStatus("");
    setError("");
  }

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const data = await api.adminUsers();
      setUsers(data);
      if (!selectedUserId && data.length) {
        setSelectedUserId(data[0].id);
        setIsCreating(false);
      }
    } catch {
      setError("Users could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function saveUser() {
    setSaving(true);
    setStatus("");
    setError("");
    try {
      if (isCreating) {
        const created = await api.adminCreateUser({
          email,
          password,
          fullName,
          goal,
          role
        });
        setUsers((items) => [created, ...items]);
        setSelectedUserId(created.id);
        setIsCreating(false);
        setPassword("");
        setStatus("User created.");
      } else if (selectedUser) {
        const body: Partial<{ email: string; password: string; fullName: string; goal: string; role: Role }> = {
          email,
          fullName,
          goal,
          role
        };
        if (password.trim()) {
          body.password = password;
        }
        const updated = await api.adminUpdateUser(selectedUser.id, body);
        setUsers((items) => items.map((item) => (item.id === updated.id ? updated : item)));
        setPassword("");
        setStatus("User saved.");
      }
    } catch {
      setError(isCreating ? "User could not be created." : "User could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser() {
    if (!selectedUser || selectedUser.id === currentUserId) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      setStatus("Click delete again to confirm.");
      return;
    }

    setSaving(true);
    setStatus("");
    setError("");
    try {
      await api.adminDeleteUser(selectedUser.id);
      const remainingUsers = users.filter((user) => user.id !== selectedUser.id);
      setUsers(remainingUsers);
      setSelectedUserId(remainingUsers[0]?.id ?? null);
      setIsCreating(remainingUsers.length === 0);
      setConfirmDelete(false);
      setStatus("User deleted.");
    } catch {
      setError("User could not be deleted.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser && !isCreating) {
      setEmail(selectedUser.email);
      setFullName(selectedUser.fullName);
      setGoal(selectedUser.goal || defaultGoal);
      setRole(selectedUser.role === "admin" ? "admin" : "student");
      setPassword("");
      setConfirmDelete(false);
    }
  }, [isCreating, selectedUser]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-coral" />
          <div>
            <h2 className="text-lg font-semibold">Manage users</h2>
            <p className="mt-1 text-sm text-slate-600">Create accounts, edit profiles and roles, or remove users.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={loadUsers} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button type="button" onClick={resetCreateForm} className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm text-white">
            <Plus className="h-4 w-4" /> New user
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[340px_1fr]">
        <aside className="max-h-[32rem] overflow-y-auto rounded-md border border-slate-200 p-3">
          {loading ? <p className="text-sm text-slate-600">Loading users...</p> : null}
          {!loading && users.length === 0 ? <p className="text-sm text-slate-600">No users yet.</p> : null}
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  setSelectedUserId(user.id);
                  setIsCreating(false);
                  setStatus("");
                  setError("");
                }}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                  selectedUser?.id === user.id && !isCreating ? "border-ink bg-ink text-white" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="block truncate font-medium">{user.fullName || user.email}</span>
                <span className={`mt-1 block truncate text-xs ${selectedUser?.id === user.id && !isCreating ? "text-white/80" : "text-slate-500"}`}>
                  {user.email}
                </span>
                <span className={`mt-1 inline-flex items-center gap-1 text-xs ${selectedUser?.id === user.id && !isCreating ? "text-white/80" : "text-slate-500"}`}>
                  <Shield className="h-3 w-3" /> {user.role}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-medium">
              Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-md border p-3 text-sm" />
            </label>
            <label className="block text-sm font-medium">
              Role
              <select value={role} onChange={(event) => setRole(event.target.value as Role)} className="mt-1 w-full rounded-md border p-3 text-sm">
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium">
            Full name
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-1 w-full rounded-md border p-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">
            Goal
            <input value={goal} onChange={(event) => setGoal(event.target.value)} className="mt-1 w-full rounded-md border p-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">
            Password {isCreating ? "" : "(leave blank to keep current password)"}
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border p-3 text-sm"
              type="password"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveUser}
              disabled={saving || !email.trim() || (isCreating && password.length < 8)}
              className="inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? <Plus className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : isCreating ? "Create user" : "Save user"}
            </button>
            {!isCreating ? (
              <button
                type="button"
                onClick={deleteUser}
                disabled={saving || selectedUser?.id === currentUserId}
                className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" /> {confirmDelete ? "Confirm delete" : "Delete user"}
              </button>
            ) : null}
          </div>

          {selectedUser?.id === currentUserId && !isCreating ? (
            <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">You cannot delete the account you are currently using.</p>
          ) : null}
          {status ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p> : null}
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
