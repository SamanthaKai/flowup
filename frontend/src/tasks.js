import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "./api";

export const STATUSES = [
  { key: "todo", label: "To Do", dot: "bg-fu-muted", bar: "bg-fu-muted" },
  { key: "in_progress", label: "In Progress", dot: "bg-fu-cyan", bar: "bg-fu-cyan" },
  { key: "done", label: "Done", dot: "bg-fu-green", bar: "bg-fu-green" },
];

export const PRIORITIES = [
  { key: "high", label: "High", badge: "text-fu-red bg-fu-red/10 border-fu-red/25", bar: "bg-fu-red" },
  { key: "medium", label: "Medium", badge: "text-fu-amber bg-fu-amber/10 border-fu-amber/25", bar: "bg-fu-amber" },
  { key: "low", label: "Low", badge: "text-fu-muted bg-white/5 border-fu-border", bar: "bg-fu-muted" },
];

export const priorityMeta = (key) => PRIORITIES.find((p) => p.key === key) || PRIORITIES[1];
export const statusMeta = (key) => STATUSES.find((s) => s.key === key) || STATUSES[0];

/** Local YYYY-MM-DD for today (+ offset days). */
export function isoDay(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isOverdue(task) {
  return task.status !== "done" && task.due_date && task.due_date < isoDay();
}

export function dueLabel(task) {
  if (!task.due_date) return null;
  const today = isoDay();
  if (task.due_date === today) return "Today";
  if (task.due_date === isoDay(1)) return "Tomorrow";
  if (task.due_date === isoDay(-1)) return "Yesterday";
  const [y, m, d] = task.due_date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** All task state + server calls, shared across pages. */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/tasks")
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const createTask = useCallback(async (fields) => {
    setError("");
    try {
      const task = await apiFetch("/api/tasks", { method: "POST", body: JSON.stringify(fields) });
      setTasks((prev) => [...prev, task]);
      return task;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id, fields) => {
    setError("");
    let previous;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        previous = t;
        return { ...t, ...fields };
      })
    );
    try {
      const updated = await apiFetch(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(fields) });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      setError(err.message);
      if (previous) setTasks((prev) => prev.map((t) => (t.id === id ? previous : t)));
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    setError("");
    try {
      await apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const clearCompleted = useCallback(async () => {
    setError("");
    try {
      const res = await apiFetch("/api/tasks/completed", { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.status !== "done"));
      return res.deleted;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return { tasks, loading, error, setError, createTask, updateTask, deleteTask, clearCompleted };
}
