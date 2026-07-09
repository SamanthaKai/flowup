import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const COLUMNS = [
  { key: "todo", label: "To Do", dot: "bg-fu-muted" },
  { key: "in_progress", label: "In Progress", dot: "bg-fu-cyan" },
  { key: "done", label: "Done", dot: "bg-fu-green" },
];

export default function Board() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dragTaskId, setDragTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  useEffect(() => {
    apiFetch("/api/tasks")
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function addTask(e) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setNewTitle("");
    try {
      const task = await apiFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      setTasks((prev) => [...prev, task]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function moveTask(task, status) {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status } : t))
    );
    try {
      const updated = await apiFetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError(err.message);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
    }
  }

  async function deleteTask(task) {
    try {
      await apiFetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      setError(err.message);
    }
  }

  function handleDrop(e, columnKey) {
    e.preventDefault();
    setDragOverCol(null);
    const id = Number(e.dataTransfer.getData("text/plain"));
    const task = tasks.find((t) => t.id === id);
    if (task && task.status !== columnKey) moveTask(task, columnKey);
    setDragTaskId(null);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={addTask} className="flex gap-3 mb-8">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 px-4 py-3 rounded-xl bg-fu-surface border border-fu-border text-fu-text placeholder:text-fu-muted text-sm outline-none focus:border-fu-cyan/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)] transition"
        />
        <button
          type="submit"
          className="bg-fu-cyan text-fu-bg text-sm font-semibold px-6 py-3 rounded-xl hover:brightness-110 hover:shadow-[0_0_16px_rgba(34,211,238,0.35)] transition-all"
        >
          Add
        </button>
      </form>

      {error && <p className="text-sm text-fu-red mb-4">{error}</p>}

      {loading ? (
        <p className="text-fu-muted text-sm">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-3 gap-5">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            const isDragOver = dragOverCol === col.key;
            return (
              <div
                key={col.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverCol(col.key);
                }}
                onDragLeave={() =>
                  setDragOverCol((cur) => (cur === col.key ? null : cur))
                }
                onDrop={(e) => handleDrop(e, col.key)}
                className={`bg-fu-surface border rounded-2xl p-4 transition-colors ${
                  isDragOver
                    ? "border-fu-cyan/60 shadow-[0_0_0_3px_rgba(34,211,238,0.12)]"
                    : "border-fu-border"
                }`}
              >
                <h2 className="flex items-center gap-2 text-sm font-semibold text-fu-text mb-4 px-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                  {col.label}
                  <span className="text-fu-muted font-normal">
                    ({colTasks.length})
                  </span>
                </h2>

                {colTasks.length === 0 ? (
                  <div className="border border-dashed border-fu-border rounded-xl py-8 text-center">
                    <p className="text-fu-muted text-xs">
                      {isDragOver ? "Drop here" : "No tasks yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 min-h-[2rem]">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", String(task.id));
                          e.dataTransfer.effectAllowed = "move";
                          setDragTaskId(task.id);
                        }}
                        onDragEnd={() => {
                          setDragTaskId(null);
                          setDragOverCol(null);
                        }}
                        className={`group bg-fu-bg border border-fu-border rounded-xl p-3.5 cursor-grab active:cursor-grabbing transition-all hover:border-fu-cyan/30 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)] ${
                          dragTaskId === task.id ? "opacity-40" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-fu-text break-words">
                            {task.title}
                          </p>
                          <button
                            onClick={() => deleteTask(task)}
                            className="shrink-0 text-fu-muted hover:text-fu-red opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete task"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
