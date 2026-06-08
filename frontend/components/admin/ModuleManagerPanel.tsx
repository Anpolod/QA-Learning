"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, Plus, Save, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Course, Module } from "@/types/course";

export function ModuleManagerPanel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [title, setTitle] = useState("New module");
  const [description, setDescription] = useState("Module description.");
  const [orderIndex, setOrderIndex] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0];
  const modules = useMemo(() => selectedCourse?.modules ?? [], [selectedCourse]);
  const selectedModule = modules.find((module) => module.id === selectedModuleId) ?? modules[0];

  async function load() {
    setError("");
    try {
      const data = await api.courses();
      setCourses(data);
      const firstCourse = data[0];
      const firstModule = firstCourse?.modules[0];
      if (!selectedCourseId && firstCourse) setSelectedCourseId(firstCourse.id);
      if (!selectedModuleId && firstModule) setSelectedModuleId(firstModule.id);
    } catch {
      setError("Modules could not be loaded.");
    }
  }

  async function createModule() {
    if (!selectedCourse) return;
    setStatus("");
    setError("");
    setConfirmDelete(false);
    try {
      const created = await api.createModule({
        course_id: selectedCourse.id,
        title: "New module",
        description: "Draft module created from admin panel.",
        order_index: modules.length + 1
      });
      setCourses((items) =>
        items.map((course) => (course.id === selectedCourse.id ? { ...course, modules: [...course.modules, created] } : course))
      );
      setSelectedModuleId(created.id);
      setStatus("Module created.");
    } catch {
      setError("Module could not be created.");
    }
  }

  async function saveModule() {
    if (!selectedCourse || !selectedModule) return;
    setStatus("");
    setError("");
    try {
      const updated = await api.updateModule(selectedModule.id, {
        title,
        description,
        order_index: orderIndex
      });
      setCourses((items) =>
        items.map((course) =>
          course.id === selectedCourse.id
            ? { ...course, modules: course.modules.map((module) => (module.id === updated.id ? { ...module, ...updated } : module)) }
            : course
        )
      );
      setStatus("Module saved.");
    } catch {
      setError("Module could not be saved.");
    }
  }

  async function deleteModule() {
    if (!selectedCourse || !selectedModule) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      setStatus("Click delete again to confirm.");
      return;
    }
    setStatus("");
    setError("");
    try {
      await api.deleteModule(selectedModule.id);
      const remaining = modules.filter((module) => module.id !== selectedModule.id);
      setCourses((items) =>
        items.map((course) => (course.id === selectedCourse.id ? { ...course, modules: remaining } : course))
      );
      setSelectedModuleId(remaining[0]?.id ?? null);
      setConfirmDelete(false);
      setStatus("Module deleted.");
    } catch {
      setError("Module could not be deleted.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const firstModule = selectedCourse?.modules[0];
    setSelectedModuleId(firstModule?.id ?? null);
    setConfirmDelete(false);
  }, [selectedCourse?.id]);

  useEffect(() => {
    if (selectedModule) {
      setTitle(selectedModule.title);
      setDescription(selectedModule.description);
      setOrderIndex(selectedModule.order_index);
      setConfirmDelete(false);
    }
  }, [selectedModule?.id]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Boxes className="h-5 w-5 text-coral" />
          <div>
            <h2 className="text-lg font-semibold">Manage modules</h2>
            <p className="mt-1 text-sm text-slate-600">Create, edit, and delete course modules.</p>
          </div>
        </div>
        <button type="button" onClick={createModule} className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm text-white">
          <Plus className="h-4 w-4" /> New module
        </button>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_260px_1fr]">
        <label className="block text-sm font-medium">
          Course
          <select
            value={selectedCourse?.id ?? ""}
            onChange={(event) => setSelectedCourseId(Number(event.target.value))}
            className="mt-1 w-full rounded-md border p-3 text-sm"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </label>
        <div className="rounded-md border border-slate-200 p-3">
          <p className="text-sm font-medium">Modules</p>
          <div className="mt-2 space-y-1">
            {modules.map((module: Module) => (
              <button
                key={module.id}
                type="button"
                onClick={() => setSelectedModuleId(module.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${selectedModule?.id === module.id ? "bg-ink text-white" : "hover:bg-slate-50"}`}
              >
                {module.order_index}. {module.title}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Module title
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-md border p-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 min-h-28 w-full rounded-md border p-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">
            Order
            <input
              type="number"
              value={orderIndex}
              onChange={(event) => setOrderIndex(Number(event.target.value))}
              className="mt-1 w-full rounded-md border p-3 text-sm"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={saveModule} className="inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2 text-sm text-white">
              <Save className="h-4 w-4" /> Save module
            </button>
            <button type="button" onClick={deleteModule} className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm text-red-700">
              <Trash2 className="h-4 w-4" /> {confirmDelete ? "Confirm delete" : "Delete module"}
            </button>
          </div>
          {status ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p> : null}
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
