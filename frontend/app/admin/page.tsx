"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { AiImageGeneratorPanel } from "@/components/ai/AiImageGeneratorPanel";
import { AiSettingsPanel, type AiSettings } from "@/components/admin/AiSettingsPanel";
import { CourseManagerPanel } from "@/components/admin/CourseManagerPanel";
import { ExampleManagerPanel } from "@/components/admin/ExampleManagerPanel";
import { FinalProjectReviewPanel } from "@/components/admin/FinalProjectReviewPanel";
import { HomeworkManagerPanel } from "@/components/admin/HomeworkManagerPanel";
import { HomeworkReviewPanel } from "@/components/admin/HomeworkReviewPanel";
import { InteractiveTaskManagerPanel } from "@/components/admin/InteractiveTaskManagerPanel";
import { ModuleManagerPanel } from "@/components/admin/ModuleManagerPanel";
import { QuizManagerPanel } from "@/components/admin/QuizManagerPanel";
import { SlideManagerPanel } from "@/components/admin/SlideManagerPanel";
import { StudentProgressPanel } from "@/components/admin/StudentProgressPanel";
import { UserManagerPanel } from "@/components/admin/UserManagerPanel";
import { api, mediaUrl } from "@/lib/api";

type AdminUser = {
  id: number;
  email: string;
  role: string;
  fullName: string;
  goal: string;
};

type AiUsage = {
  textRequestsToday: number;
  imageRequestsToday: number;
  totalRequestsToday: number;
  dailyTextLimitPerUser: number;
  dailyImageLimitAdmin: number;
};

type AiImage = {
  id: number;
  lessonId: number | null;
  prompt: string;
  enhancedPrompt: string;
  imageUrl: string;
  targetType: string;
  style: string;
  provider: string;
  model: string;
  createdAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [usage, setUsage] = useState<AiUsage | null>(null);
  const [images, setImages] = useState<AiImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAdmin() {
      setLoading(true);
      setError("");
      if (!localStorage.getItem("qa_learning_user")) {
        router.replace("/login");
        return;
      }

      try {
        const currentUser = await api.me();
        if (currentUser.role !== "admin") {
          // Keep the user signed in — just deny access instead of logging them out.
          if (isMounted) {
            setError("This account is not an admin. Sign in with an admin account to open the admin panel.");
            setLoading(false);
          }
          return;
        }

        const [adminSettings, adminUsage, generatedImages] = await Promise.all([
          api.aiSettings().catch(() => null),
          api.aiUsage().catch(() => null),
          api.aiImages().catch(() => []),
        ]);

        if (!isMounted) return;
        setUser(currentUser);
        setSettings(adminSettings);
        setUsage(adminUsage);
        setImages(generatedImages);
      } catch {
        if (!isMounted) return;
        setError("Admin session is invalid or expired. Please log in again.");
        localStorage.removeItem("qa_learning_user");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAdmin();
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-mint" />
            <div>
              <p className="text-sm text-coral">Admin access</p>
              <h1 className="text-2xl font-bold">Checking permissions...</h1>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-coral">Admin access</p>
          <h1 className="mt-2 text-2xl font-bold">Login required</h1>
          <p className="mt-3 text-sm text-slate-600">{error || "Please log in with an admin account to open this page."}</p>
          <Link href="/login" className="mt-4 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">
            Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div>
        <p className="text-sm text-coral">Admin panel</p>
        <h1 className="text-3xl font-bold">Course content workspace</h1>
        <p className="mt-2 text-slate-600">
          Manage modules, lessons, slides, examples, interactive practice, homework, quizzes, AI settings, usage, and generated images.
        </p>
        <p className="mt-2 text-xs text-slate-500">Signed in as {user.email}</p>
      </div>
      <div className="mt-6">
        <AiSettingsPanel initialSettings={settings} />
      </div>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">AI usage today</h2>
          {usage ? (
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Text requests</dt><dd>{usage.textRequestsToday}/{usage.dailyTextLimitPerUser}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Image requests</dt><dd>{usage.imageRequestsToday}/{usage.dailyImageLimitAdmin}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Total requests</dt><dd>{usage.totalRequestsToday}</dd></div>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-slate-600">AI usage is unavailable.</p>
          )}
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Admin workflow</h2>
          <p className="mt-2 text-sm text-slate-600">
            Create lesson visuals, review usage, and attach generated assets to lessons, slides, examples, practice tasks, homework, and quizzes.
          </p>
        </article>
      </section>
      <div className="mt-6">
        <UserManagerPanel currentUserId={user.id} />
      </div>
      <div className="mt-6">
        <ModuleManagerPanel />
      </div>
      <div className="mt-6">
        <CourseManagerPanel />
      </div>
      <div className="mt-6">
        <QuizManagerPanel />
      </div>
      <div className="mt-6">
        <SlideManagerPanel />
      </div>
      <div className="mt-6">
        <ExampleManagerPanel />
      </div>
      <div className="mt-6">
        <InteractiveTaskManagerPanel />
      </div>
      <div className="mt-6">
        <AiImageGeneratorPanel lessonId="1" />
      </div>
      <div className="mt-6">
        <HomeworkManagerPanel />
      </div>
      <div className="mt-6">
        <HomeworkReviewPanel />
      </div>
      <div className="mt-6">
        <FinalProjectReviewPanel />
      </div>
      <div className="mt-6">
        <StudentProgressPanel />
      </div>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Generated image history</h2>
        {images.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {images.map((image) => (
              <article key={image.id} className="overflow-hidden rounded-lg border border-slate-200">
                <div className="aspect-square bg-slate-50">
                  <img src={mediaUrl(image.imageUrl)} alt={image.prompt} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-medium">{image.prompt}</p>
                  <p className="mt-2 text-xs text-slate-500">{image.targetType} / {image.style}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600">No generated images yet.</p>
        )}
      </section>
    </main>
  );
}
