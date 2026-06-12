"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { AdminNavLink } from "@/components/auth/AdminNavLink";
import { AuthNav } from "@/components/auth/AuthNav";

const LINKS: [string, string][] = [
  ["/courses", "Courses"],
  ["/test-docs", "Test Docs"],
  ["/docs", "Docs"],
  ["/api-testing", "API Testing"],
  ["/interview", "Interview"],
  ["/dashboard", "Dashboard"],
  ["/game", "Game"],
  ["/final-projects", "Projects"],
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
      <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
        <GraduationCap className="h-6 w-6 text-mint" />
        QA Learning
      </Link>

      {/* Desktop links — show inline only at lg+, where all items fit; below that
          the hamburger handles the (now many) nav entries to avoid overflow. */}
      <div className="hidden items-center gap-3 text-sm text-slate-700 lg:flex">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
        <AdminNavLink />
        <AuthNav />
      </div>

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-md border border-slate-200 p-2 text-slate-700 lg:hidden"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile panel */}
      {open ? (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-slate-200 bg-white px-4 py-3 shadow-lg lg:hidden">
          <div className="flex flex-col gap-3 text-sm text-slate-700">
            {LINKS.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="py-1">
                {label}
              </Link>
            ))}
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <AdminNavLink />
              <AuthNav />
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
