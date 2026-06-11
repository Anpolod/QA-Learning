import { readFileSync } from "fs";
import path from "path";
import Link from "next/link";
import { BookMarked, BookOpen, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const metadata = {
  title: "Project Docs | QA Learning",
  description: "Project documentation: architecture, requirements, course plan, AI assistant, and seed data."
};

const DOCS: { slug: string; title: string; file: string; blurb: string }[] = [
  { slug: "architecture", title: "Architecture", file: "ARCHITECTURE.md", blurb: "System design, monorepo layout, data flow." },
  { slug: "business-requirements", title: "Business Requirements", file: "BUSINESS_REQUIREMENTS.md", blurb: "Goals, audience, scope." },
  { slug: "functional-requirements", title: "Functional Requirements", file: "FUNCTIONAL_REQUIREMENTS.md", blurb: "Features and behaviors." },
  { slug: "course-plan", title: "Course Plan", file: "COURSE_PLAN.md", blurb: "Courses, modules, and lesson structure." },
  { slug: "ai-assistant", title: "AI Assistant", file: "AI_ASSISTANT.md", blurb: "AI modes, prompts, and limits." },
  { slug: "seed-data", title: "Seed Data", file: "SEED_DATA.md", blurb: "Demo content and how it is seeded." }
];

function readDoc(file: string): string {
  try {
    return readFileSync(path.join(process.cwd(), "content/project-docs", file), "utf-8");
  } catch {
    return `_Document not found: ${file}_`;
  }
}

export default function DocsPage() {
  const docs = DOCS.map((d) => ({ ...d, content: readDoc(d.file) }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-coral" />
          <h1 className="text-3xl font-bold">Project Docs</h1>
        </div>
        <p className="mt-3 max-w-3xl text-slate-600">
          Internal documentation for the QA Learning Platform — how it is built, what it must do, and how content is structured.
        </p>
      </section>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start space-y-3">
          <Link
            href="/glossary"
            className="flex items-start gap-2 rounded-lg border border-coral/30 bg-coral/5 p-3 transition hover:border-coral"
          >
            <BookMarked className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
            <span>
              <span className="block text-sm font-semibold text-ink">QA Glossary</span>
              <span className="block text-xs text-slate-500">Core testing terms + flashcards</span>
            </span>
          </Link>
          <nav className="space-y-1 rounded-lg border border-slate-200 bg-white p-3">
            {docs.map((d) => (
              <a
                key={d.slug}
                href={`#${d.slug}`}
                className="flex items-start gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-50"
              >
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                <span>
                  <span className="block font-medium text-slate-800">{d.title}</span>
                  <span className="block text-xs text-slate-500">{d.blurb}</span>
                </span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-8">
          {docs.map((d) => (
            <section key={d.slug} id={d.slug} className="scroll-mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <article className="prose prose-slate max-w-none prose-headings:scroll-mt-8 prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-a:text-coral">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{d.content}</ReactMarkdown>
              </article>
            </section>
          ))}
          {/* Spacer so the last (short) sections can still scroll to the top when their
              anchor is clicked, instead of stopping mid-page. */}
          <div aria-hidden className="h-[60vh]" />
        </div>
      </div>
    </main>
  );
}
