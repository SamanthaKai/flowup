import { useMemo, useState } from "react";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { PlusIcon, SearchIcon } from "../icons";
import { PRIORITIES, STATUSES, isOverdue } from "../tasks";

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
const SORTS = {
  created: { label: "Newest", fn: (a, b) => b.id - a.id },
  due: {
    label: "Due date",
    fn: (a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999"),
  },
  priority: { label: "Priority", fn: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] },
};

const control =
  "px-3 py-2.5 rounded-xl bg-fu-surface border border-fu-border text-fu-text text-sm outline-none focus:border-fu-cyan/60 transition";

export default function Board({ store }) {
  const { tasks, loading, error, createTask, updateTask, deleteTask } = store;
  const [quickTitle, setQuickTitle] = useState("");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("all");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [sort, setSort] = useState("created");
  const [modal, setModal] = useState(null); // { task } | { status }
  const [dragId, setDragId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((t) => priority === "all" || t.priority === priority)
      .filter((t) => !onlyOverdue || isOverdue(t))
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      .sort(SORTS[sort].fn);
  }, [tasks, query, priority, onlyOverdue, sort]);

  const filtering = query || priority !== "all" || onlyOverdue;

  async function quickAdd(e) {
    e.preventDefault();
    const title = quickTitle.trim();
    if (!title) return;
    setQuickTitle("");
    await createTask({ title }).catch(() => {});
  }

  function handleDrop(e, status) {
    e.preventDefault();
    setDragOverCol(null);
    const id = Number(e.dataTransfer.getData("text/plain"));
    const task = tasks.find((t) => t.id === id);
    if (task && task.status !== status) updateTask(id, { status }).catch(() => {});
    setDragId(null);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fu-text">My Tasks</h1>
          <p className="text-sm text-fu-muted mt-1">Drag cards between columns, or click one to edit.</p>
        </div>
        <button
          onClick={() => setModal({ status: "todo" })}
          className="flex items-center gap-1.5 bg-fu-cyan text-fu-bg text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-110 transition"
        >
          <PlusIcon width={16} height={16} /> New task
        </button>
      </div>

      <form onSubmit={quickAdd} className="mb-4">
        <input
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Quick add a task and press Enter…"
          className={`${control} w-full px-4 py-3 placeholder:text-fu-muted focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]`}
        />
      </form>

      <div className="flex flex-wrap gap-2.5 mb-6">
        <div className="relative flex-1 min-w-[180px]">
          <SearchIcon width={15} height={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-fu-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks"
            className={`${control} w-full pl-9 placeholder:text-fu-muted`}
          />
        </div>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={control} aria-label="Filter by priority">
          <option value="all">All priorities</option>
          {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={control} aria-label="Sort">
          {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>Sort: {s.label}</option>)}
        </select>
        <button
          type="button"
          onClick={() => setOnlyOverdue((v) => !v)}
          className={`${control} ${onlyOverdue ? "!border-fu-red/50 text-fu-red bg-fu-red/10" : "text-fu-muted hover:text-fu-text"}`}
        >
          Overdue only
        </button>
      </div>

      {error && <p className="text-sm text-fu-red mb-4">{error}</p>}

      {loading ? (
        <p className="text-fu-muted text-sm">Loading…</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {STATUSES.map((col) => {
            const colTasks = visible.filter((t) => t.status === col.key);
            const isOver = dragOverCol === col.key;
            return (
              <div
                key={col.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverCol(col.key);
                }}
                onDragLeave={() => setDragOverCol((cur) => (cur === col.key ? null : cur))}
                onDrop={(e) => handleDrop(e, col.key)}
                className={`bg-fu-surface border rounded-2xl p-4 transition-colors ${
                  isOver ? "border-fu-cyan/60 shadow-[0_0_0_3px_rgba(34,211,238,0.12)]" : "border-fu-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-fu-text">
                    <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                    {col.label}
                    <span className="text-fu-muted font-normal">({colTasks.length})</span>
                  </h2>
                  <button
                    onClick={() => setModal({ status: col.key })}
                    className="text-fu-muted hover:text-fu-cyan p-1 rounded-md hover:bg-white/5"
                    aria-label={`Add task to ${col.label}`}
                  >
                    <PlusIcon width={16} height={16} />
                  </button>
                </div>

                {colTasks.length === 0 ? (
                  <div className="border border-dashed border-fu-border rounded-xl py-8 text-center">
                    <p className="text-fu-muted text-xs">
                      {isOver ? "Drop here" : filtering ? "No matching tasks" : "No tasks yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onOpen={(t) => setModal({ task: t })}
                        draggable
                        dimmed={dragId === task.id}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", String(task.id));
                          e.dataTransfer.effectAllowed = "move";
                          setDragId(task.id);
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setDragOverCol(null);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <TaskModal
          task={modal.task}
          defaultStatus={modal.status}
          onClose={() => setModal(null)}
          onSave={(fields) => (modal.task ? updateTask(modal.task.id, fields) : createTask(fields))}
          onDelete={modal.task ? () => deleteTask(modal.task.id) : undefined}
        />
      )}
    </div>
  );
}
