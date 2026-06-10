import type { Course, Lesson, Module } from "@/types/course";

const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const serverApiUrl = process.env.API_INTERNAL_URL ?? publicApiUrl;

export type UserRead = {
  id: number;
  email: string;
  role: string;
  fullName: string;
  goal: string;
};

function apiUrl() {
  return typeof window === "undefined" ? serverApiUrl : publicApiUrl;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    // Send the httpOnly auth cookie with every request (the backend reads it as the bearer token).
    credentials: "include",
    cache: "no-store"
  });
  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = typeof body?.detail === "string" ? body.detail : "";
    } catch {
      // non-JSON error body
    }
    throw new Error(detail || `API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export type DocScenario = {
  id: number;
  doc_type: "test_case" | "bug_report" | "decision_table";
  title: string;
  brief: string;
  context: string;
  source: string;
};

export type DocReview = {
  attempt_id: number;
  score: number;
  summary: string;
  fields: { name: string; rating: string; comment: string }[];
  improvements: string[];
};

export type DocAttempt = {
  id: number;
  scenario_id: number;
  scenario_title: string;
  doc_type: "test_case" | "bug_report" | "decision_table";
  score: number;
  summary: string;
  created_at: string;
};

export function publicApiBase() {
  return publicApiUrl;
}

export function mediaUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${publicApiUrl}${path}`;
}

export const api = {
  register: (body: { email: string; password: string; full_name: string }) =>
    request<{ accessToken: string; tokenType: string; user: { id: number; email: string; role: string; fullName: string; goal: string } }>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify(body) }
    ),
  login: (body: { email: string; password: string }) =>
    request<{ accessToken: string; tokenType: string; user: { id: number; email: string; role: string; fullName: string; goal: string } }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify(body) }
    ),
  logout: () => request<{ status: string }>("/api/auth/logout", { method: "POST" }),
  me: () => request<UserRead>("/api/auth/me"),
  updateProfile: (body: { fullName: string; goal: string }) =>
    request<UserRead>("/api/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(body)
    }),
  adminUsers: () => request<UserRead[]>("/api/auth/admin/users"),
  adminCreateUser: (
    body: { email: string; password: string; fullName: string; goal: string; role: "student" | "admin" }
  ) =>
    request<UserRead>("/api/auth/admin/users", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  adminUpdateUser: (
    userId: number,
    body: Partial<{ email: string; password: string; fullName: string; goal: string; role: "student" | "admin" }>
  ) =>
    request<UserRead>(`/api/auth/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }),
  adminDeleteUser: (userId: number) =>
    request<{ status: string; userId: number }>(`/api/auth/admin/users/${userId}`, {
      method: "DELETE"
    }),
  glossary: () =>
    request<{ slug: string; term: string; definition: string; category: string }[]>("/api/glossary"),
  docScenarios: (type: "test_case" | "bug_report" | "decision_table") =>
    request<DocScenario[]>(`/api/test-docs/scenarios?type=${type}`),
  generateDocScenario: (doc_type: "test_case" | "bug_report" | "decision_table") =>
    request<DocScenario>("/api/test-docs/generate", { method: "POST", body: JSON.stringify({ doc_type }) }),
  reviewDoc: (payload: { scenario_id: number; doc_type: string; fields: Record<string, string> }) =>
    request<DocReview>("/api/test-docs/review", { method: "POST", body: JSON.stringify(payload) }),
  docAttempts: () => request<DocAttempt[]>("/api/test-docs/attempts"),
  courses: () => request<Course[]>("/api/courses"),
  course: (id: string) => request<Course>(`/api/courses/${id}`),
  module: (id: string) => request<Module>(`/api/courses/modules/${id}`),
  lesson: (id: string) => request<Lesson>(`/api/courses/lessons/${id}`),
  finalProjects: () =>
    request<{ id: number; course_id: number; title: string; requirements: string }[]>("/api/courses/final-projects"),
  submitFinalProject: (projectId: number, submissionText: string, fileUrl = "") =>
    request<{
      id: number;
      final_project_id: number;
      user_id: number;
      submission_text: string;
      file_url: string;
      status: string;
      created_at: string;
    }>(`/api/courses/final-projects/${projectId}/submit`, {
      method: "POST",
      body: JSON.stringify({ submission_text: submissionText, file_url: fileUrl })
    }),
  finalProjectSubmissions: () =>
    request<
      {
        id: number;
        final_project_id: number;
        user_id: number;
        submission_text: string;
        file_url: string;
        status: string;
        created_at: string;
      }[]
    >("/api/courses/final-projects/submissions"),
  reviewFinalProjectSubmission: (submissionId: number, status: "approved" | "needs_changes" | "submitted") =>
    request<{
      id: number;
      final_project_id: number;
      user_id: number;
      submission_text: string;
      file_url: string;
      status: string;
      created_at: string;
    }>(`/api/courses/final-projects/submissions/${submissionId}/review`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  createModule: (body: { course_id: number; title: string; description: string; order_index: number }) =>
    request<Module>("/api/courses/admin/modules", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  updateModule: (moduleId: number, body: Partial<{ title: string; description: string; order_index: number }>) =>
    request<Module>(`/api/courses/admin/modules/${moduleId}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }),
  deleteModule: (moduleId: number) =>
    request<{ status: string; moduleId: number }>(`/api/courses/admin/modules/${moduleId}`, {
      method: "DELETE"
    }),
  createLesson: (body: { module_id: number; title: string; short_description: string; theory: string; order_index: number }) =>
    request<Lesson>("/api/courses/admin/lessons", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  updateLesson: (
    lessonId: number,
    body: Partial<{
      title: string;
      short_description: string;
      learning_goals: string;
      theory: string;
      key_terms: string;
      real_world_example: string;
      step_by_step: string;
      common_mistakes: string;
      practical_use_case: string;
      summary: string;
      order_index: number;
    }>
  ) =>
    request<Lesson>(`/api/courses/admin/lessons/${lessonId}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }),
  deleteLesson: (lessonId: number) =>
    request<{ status: string; lessonId: number }>(`/api/courses/admin/lessons/${lessonId}`, {
      method: "DELETE"
    }),
  createSlide: (body: { lesson_id: number; title: string; body: string; order_index: number; image_url: string }) =>
    request<{ id: number; title: string; body: string; order_index: number; image_url: string }>("/api/courses/admin/slides", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  updateSlide: (slideId: number, body: Partial<{ title: string; body: string; order_index: number; image_url: string }>) =>
    request<{ id: number; title: string; body: string; order_index: number; image_url: string }>(
      `/api/courses/admin/slides/${slideId}`,
      {
        method: "PATCH",
        body: JSON.stringify(body)
      }
    ),
  createExample: (body: { lesson_id: number; title: string; content: string }) =>
    request<{ id: number; title: string; content: string }>("/api/courses/admin/examples", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  updateExample: (exampleId: number, body: Partial<{ title: string; content: string }>) =>
    request<{ id: number; title: string; content: string }>(`/api/courses/admin/examples/${exampleId}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }),
  createInteractiveTask: (body: { lesson_id: number; task_type: string; prompt: string; expected_answer: string }) =>
    request<{ id: number; task_type: string; prompt: string; expected_answer: string }>("/api/courses/admin/interactive-tasks", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  updateInteractiveTask: (
    taskId: number,
    body: Partial<{ task_type: string; prompt: string; expected_answer: string }>
  ) =>
    request<{ id: number; task_type: string; prompt: string; expected_answer: string }>(
      `/api/courses/admin/interactive-tasks/${taskId}`,
      {
        method: "PATCH",
        body: JSON.stringify(body)
      }
    ),
  quiz: (lessonId: string) =>
    request<{
      id: number;
      title: string;
      questions: {
        id: number;
        question: string;
        type: string;
        explanation?: string;
        answers: { id: number; answerText: string }[];
      }[];
    }>(`/api/quizzes/lesson/${lessonId}`),
  createQuizQuestion: (body: {
    lesson_id: number;
    question: string;
    question_type: string;
    explanation: string;
    answers: { answer_text: string; is_correct: boolean }[];
  }) =>
    request<{ quiz_id: number; question_id: number; answer_ids: number[] }>("/api/quizzes/admin/questions", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  updateQuizQuestion: (
    questionId: number,
    body: {
      question?: string;
      question_type?: string;
      explanation?: string;
      answers?: { answer_text: string; is_correct: boolean }[];
    }
  ) =>
    request<{ id: number; question: string; question_type: string; explanation: string; answer_ids: number[] }>(
      `/api/quizzes/admin/questions/${questionId}`,
      {
        method: "PATCH",
        body: JSON.stringify(body)
      }
    ),
  deleteQuizQuestion: (questionId: number) =>
    request<{ status: string; questionId: number }>(`/api/quizzes/admin/questions/${questionId}`, {
      method: "DELETE"
    }),
  homework: (lessonId: string) =>
    request<{ id: number; lesson_id: number; task_description: string; expected_result: string; allow_file_upload: boolean }>(
      `/api/homework/lesson/${lessonId}`
    ),
  createHomework: (body: { lesson_id: number; task_description: string; expected_result: string; allow_file_upload: boolean }) =>
    request<{ id: number; lesson_id: number; task_description: string; expected_result: string; allow_file_upload: boolean }>(
      "/api/homework/admin",
      {
        method: "POST",
        body: JSON.stringify(body)
      }
    ),
  updateHomework: (
    homeworkId: number,
    body: Partial<{ task_description: string; expected_result: string; allow_file_upload: boolean }>
  ) =>
    request<{ id: number; lesson_id: number; task_description: string; expected_result: string; allow_file_upload: boolean }>(
      `/api/homework/admin/${homeworkId}`,
      {
        method: "PATCH",
        body: JSON.stringify(body)
      }
    ),
  dashboardProgress: () =>
    request<{
      completedLessons: number;
      openedLessons: number;
      quizCompleted: number;
      homeworkSubmitted: number;
      totalLessons: number;
      currentModule: string;
      currentLesson: string;
      recommendedNextLesson: string;
      recommendedLessonId: number | null;
      aiUsageToday: number;
      aiDailyLimit: number;
      finalProjectsSubmitted: number;
      finalProjectsApproved: number;
      totalFinalProjects: number;
    }>(`/api/progress/dashboard/me`),
  adminStudentProgress: () =>
    request<
      {
        user_id: number;
        email: string;
        lesson_id: number;
        lesson_title: string;
        opened: boolean;
        completed: boolean;
        quiz_completed: boolean;
        homework_submitted: boolean;
        updated_at: string;
      }[]
    >("/api/progress/admin/students"),
  submitQuiz: (quizId: number, answers: Record<number, number[]>) =>
    request<{ score: number; total: number; wrong_answers: { question: string; explanation: string }[] }>(
      `/api/quizzes/${quizId}/submit`,
      {
        method: "POST",
        body: JSON.stringify({ answers })
      }
    ),
  submitHomework: (homeworkId: number, answerText: string) =>
    request<{ status: string; submissionId: number }>(`/api/homework/${homeworkId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answer_text: answerText })
    }),
  homeworkSubmissions: () =>
    request<
      {
        id: number;
        homework_id: number;
        user_id: number;
        answer_text: string;
        file_url: string;
        status: string;
        created_at: string;
      }[]
    >("/api/homework/submissions"),
  reviewHomework: (submissionId: number, status: "approved" | "needs_changes" | "submitted") =>
    request<{
      id: number;
      homework_id: number;
      user_id: number;
      answer_text: string;
      file_url: string;
      status: string;
      created_at: string;
    }>(`/api/homework/submissions/${submissionId}/review`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  updateProgress: (body: {
    lesson_id: number;
    opened?: boolean;
    completed?: boolean;
    quiz_completed?: boolean;
    homework_submitted?: boolean;
  }) =>
    request<{ status: string }>("/api/progress/lesson", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  playerStats: () =>
    request<{
      userId: number;
      email: string;
      fullName: string;
      goal: string;
      xp: number;
      level: number;
      rank: string;
      nextRank: string | null;
      nextRankXp: number | null;
      xpToNextRank: number | null;
      streakDays: number;
      completedLessons: number;
      openedLessons: number;
      quizCompleted: number;
      homeworkSubmitted: number;
      totalLessons: number;
      completionPercent: number;
      achievementsUnlocked: number;
      achievementsTotal: number;
      ranks: { title: string; threshold: number; reached: boolean }[];
      achievements: {
        id: number;
        code: string;
        title: string;
        description: string;
        icon: string;
        category: string;
        xpReward: number;
        unlocked: boolean;
        unlockedAt: string | null;
      }[];
    }>(`/api/gamification/player/me`),
  leaderboard: () =>
    request<
      {
        position: number;
        userId: number;
        email: string;
        fullName: string;
        xp: number;
        level: number;
        rank: string;
        achievementsUnlocked: number;
        completedLessons: number;
      }[]
    >("/api/gamification/leaderboard"),
  aiChat: (body: { message: string; lessonId: string; mode: string }) =>
    request<{ answer: string; type: string }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  aiImage: (body: { prompt: string; lessonId: string; targetType: string; style: string; size: string }) =>
    request<{ imageUrl: string; imageId: string; prompt: string; targetType: string; style: string }>(
      "/api/ai/images/generate",
      { method: "POST", body: JSON.stringify(body) }
    ),
  aiSettings: () =>
    request<{
      provider: string;
      textModel: string;
      imageModel: string;
      temperature: number;
      maxTokens: number;
      dailyTextLimitPerUser: number;
      dailyImageLimitPerUser: number;
      dailyImageLimitAdmin: number;
      openaiConfigured: boolean;
      openrouterConfigured: boolean;
    }>("/api/ai/admin/settings"),
  updateAiSettings: (body: Partial<{
    provider: "openai" | "openrouter";
    textModel: string;
    imageModel: string;
    temperature: number;
    maxTokens: number;
    dailyTextLimitPerUser: number;
    dailyImageLimitPerUser: number;
    dailyImageLimitAdmin: number;
    openaiApiKey: string;
    openrouterApiKey: string;
  }>) =>
    request<{
      provider: string;
      textModel: string;
      imageModel: string;
      temperature: number;
      maxTokens: number;
      dailyTextLimitPerUser: number;
      dailyImageLimitPerUser: number;
      dailyImageLimitAdmin: number;
      openaiConfigured: boolean;
      openrouterConfigured: boolean;
    }>("/api/ai/admin/settings", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  aiUsage: () =>
    request<{
      textRequestsToday: number;
      imageRequestsToday: number;
      totalRequestsToday: number;
      dailyTextLimitPerUser: number;
      dailyImageLimitAdmin: number;
    }>("/api/ai/admin/usage"),
  aiImages: (limit = 12) =>
    request<
      {
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
      }[]
    >(`/api/ai/images?limit=${limit}`)
};
