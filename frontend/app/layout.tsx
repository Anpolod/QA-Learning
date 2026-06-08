import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { AdminNavLink } from "@/components/auth/AdminNavLink";
import "./globals.css";

export const metadata: Metadata = {
  title: "QA Learning Platform",
  description: "Interactive QA Manual, Automation, and AI for QA courses"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <GraduationCap className="h-6 w-6 text-mint" />
              QA Learning
            </Link>
            <div className="flex items-center gap-4 text-sm text-slate-700">
              <Link href="/courses">Courses</Link>
              <Link href="/docs">Docs</Link>
              <Link href="/api-testing">API Testing</Link>
              <Link href="/interview">Interview</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/game">Game</Link>
              <Link href="/progress">Progress</Link>
              <Link href="/final-projects">Projects</Link>
              <Link href="/profile">Profile</Link>
              <AdminNavLink />
              <Link href="/login">Login</Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
