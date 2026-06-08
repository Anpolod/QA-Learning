"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Course } from "@/types/course";

type Quiz = Awaited<ReturnType<typeof api.quiz>>;

type AnswerDraft = {
  answer_text: string;
  is_correct: boolean;
};

export function QuizManagerPanel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonId, setLessonId] = useState<number>(1);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [question, setQuestion] = useState("What should a QA engineer document when reporting a bug?");
  const [questionType, setQuestionType] = useState("single");
  const [explanation, setExplanation] = useState("A useful bug report includes clear evidence and expected versus actual results.");
  const [answers, setAnswers] = useState<AnswerDraft[]>([
    { answer_text: "Steps to reproduce, actual result, expected result, and evidence.", is_correct: true },
    { answer_text: "Only a short message that something is broken.", is_correct: false },
    { answer_text: "A guess about which developer caused the issue.", is_correct: false }
  ]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const lessons = useMemo(() => courses.flatMap((course) => course.modules.flatMap((module) => module.lessons)), [courses]);

  async function loadQuiz(id: number) {
    setError("");
    try {
      const data = await api.quiz(String(id));
      setCurrentQuiz(data);
    } catch {
      setCurrentQuiz(null);
    }
  }

  useEffect(() => {
    api.courses()
      .then((data) => {
        setCourses(data);
        const firstLesson = data[0]?.modules[0]?.lessons[0];
        if (firstLesson) setLessonId(firstLesson.id);
      })
      .catch(() => setError("Course lessons could not be loaded."));
  }, []);

  useEffect(() => {
    loadQuiz(lessonId);
  }, [lessonId]);

  function updateAnswer(index: number, value: Partial<AnswerDraft>) {
    setAnswers((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...value } : item)));
  }

  function addAnswer() {
    setAnswers((items) => [...items, { answer_text: "New answer option", is_correct: false }]);
  }

  function resetDraft() {
    setSelectedQuestionId(null);
    setQuestion("What should a QA engineer document when reporting a bug?");
    setQuestionType("single");
    setExplanation("A useful bug report includes clear evidence and expected versus actual results.");
    setAnswers([
      { answer_text: "Steps to reproduce, actual result, expected result, and evidence.", is_correct: true },
      { answer_text: "Only a short message that something is broken.", is_correct: false },
      { answer_text: "A guess about which developer caused the issue.", is_correct: false }
    ]);
    setConfirmDelete(false);
  }

  function editQuestion(item: Quiz["questions"][number]) {
    setSelectedQuestionId(item.id);
    setQuestion(item.question);
    setQuestionType(item.type);
    setExplanation(item.explanation ?? "Update the explanation for this question.");
    setAnswers(item.answers.map((answer, index) => ({ answer_text: answer.answerText, is_correct: index === 0 })));
    setConfirmDelete(false);
    setStatus("Editing existing question. Mark the correct answers before saving.");
  }

  async function createQuestion() {
    setStatus("");
    setError("");
    try {
      if (selectedQuestionId) {
        const result = await api.updateQuizQuestion(selectedQuestionId, {
          question,
          question_type: questionType,
          explanation,
          answers
        });
        setStatus(`Question #${result.id} saved.`);
      } else {
        const result = await api.createQuizQuestion({
          lesson_id: lessonId,
          question,
          question_type: questionType,
          explanation,
          answers
        });
        setStatus(`Question #${result.question_id} added to quiz #${result.quiz_id}.`);
      }
      await loadQuiz(lessonId);
    } catch {
      setError("Quiz question could not be created. Check that at least one answer is marked correct.");
    }
  }

  async function deleteQuestion() {
    if (!selectedQuestionId) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      setStatus("Click delete again to confirm.");
      return;
    }
    setStatus("");
    setError("");
    try {
      await api.deleteQuizQuestion(selectedQuestionId);
      await loadQuiz(lessonId);
      resetDraft();
      setStatus("Quiz question deleted.");
    } catch {
      setError("Quiz question could not be deleted.");
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <PlusCircle className="h-5 w-5 text-coral" />
        <h2 className="text-lg font-semibold">Manage quiz questions</h2>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Lesson
            <select value={lessonId} onChange={(event) => setLessonId(Number(event.target.value))} className="mt-1 w-full rounded-md border p-3 text-sm">
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
              ))}
            </select>
          </label>
          <div className="rounded-md border border-slate-200 p-3">
            <p className="text-sm font-medium">Current quiz</p>
            <p className="mt-1 text-xs text-slate-500">{currentQuiz ? `${currentQuiz.questions.length} questions` : "No quiz loaded yet."}</p>
            <div className="mt-3 space-y-2">
              {currentQuiz?.questions.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => editQuestion(item)}
                  className={`w-full rounded-md p-3 text-left ${selectedQuestionId === item.id ? "bg-ink text-white" : "bg-slate-50"}`}
                >
                  <p className={`text-xs ${selectedQuestionId === item.id ? "text-white/70" : "text-slate-500"}`}>Question {index + 1} / {item.type}</p>
                  <h3 className="mt-1 text-sm font-semibold">{item.question}</h3>
                  <ul className="mt-2 space-y-1">
                    {item.answers.map((answer) => (
                      <li key={answer.id} className={`text-xs ${selectedQuestionId === item.id ? "text-white/80" : "text-slate-600"}`}>{answer.answerText}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Question type
            <select value={questionType} onChange={(event) => setQuestionType(event.target.value)} className="mt-1 w-full rounded-md border p-3 text-sm">
              <option value="single">Single choice</option>
              <option value="multiple">Multiple choice</option>
              <option value="true_false">True / false</option>
              <option value="scenario">Practical scenario</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Question
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} className="mt-1 min-h-20 w-full rounded-md border p-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">
            Explanation
            <textarea value={explanation} onChange={(event) => setExplanation(event.target.value)} className="mt-1 min-h-20 w-full rounded-md border p-3 text-sm" />
          </label>
          <div className="space-y-2">
            {answers.map((answer, index) => (
              <div key={index} className="grid gap-2 rounded-md border border-slate-200 p-3 sm:grid-cols-[1fr_120px]">
                <input value={answer.answer_text} onChange={(event) => updateAnswer(index, { answer_text: event.target.value })} className="rounded-md border p-2 text-sm" />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={answer.is_correct} onChange={(event) => updateAnswer(index, { is_correct: event.target.checked })} />
                  Correct
                </label>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={addAnswer} className="rounded-md border px-4 py-2 text-sm">Add answer</button>
            <button type="button" onClick={resetDraft} className="rounded-md border px-4 py-2 text-sm">New draft</button>
            <button type="button" onClick={createQuestion} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm text-white">
              {selectedQuestionId ? <Save className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
              {selectedQuestionId ? "Save question" : "Create question"}
            </button>
            {selectedQuestionId ? (
              <button type="button" onClick={deleteQuestion} className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm text-red-700">
                <Trash2 className="h-4 w-4" /> {confirmDelete ? "Confirm delete" : "Delete question"}
              </button>
            ) : null}
          </div>
          {status ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p> : null}
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
