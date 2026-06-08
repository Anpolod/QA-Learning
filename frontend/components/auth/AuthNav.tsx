"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

type StoredUser = { email: string; fullName?: string; role: string } | null;

// Auth-aware nav slot: shows "Login" when signed out, and the user's name + a
// Logout button when signed in. Re-reads localStorage on every route change so it
// reflects login/logout without a full reload (same-tab writes don't fire `storage`).
export function AuthNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<StoredUser>(null);

  useEffect(() => {
    function sync() {
      try {
        setUser(JSON.parse(localStorage.getItem("qa_learning_user") || "null"));
      } catch {
        setUser(null);
      }
    }
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("auth-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-change", sync);
    };
  }, [pathname]);

  function logout() {
    localStorage.removeItem("qa_learning_token");
    localStorage.removeItem("qa_learning_user");
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    router.replace("/");
  }

  if (!user) {
    return <Link href="/login">Login</Link>;
  }

  return (
    <span className="flex items-center gap-3">
      <Link href="/profile" className="max-w-[160px] truncate font-medium text-ink" title={user.email}>
        {user.fullName || user.email}
      </Link>
      <button
        type="button"
        onClick={logout}
        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
      >
        <LogOut className="h-3.5 w-3.5" /> Logout
      </button>
    </span>
  );
}
