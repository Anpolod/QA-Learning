import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/SiteNav";
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
          <SiteNav />
        </header>
        {children}
      </body>
    </html>
  );
}
