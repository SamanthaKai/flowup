import { useMemo, useState } from "react";
import TaskModal from "../components/TaskModal";
import { PlusIcon } from "../icons";
import { dueLabel, isOverdue, isoDay, priorityMeta, statusMeta } from "../tasks";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Stat({ label, value, hint, accent = "text-fu-text" }) {
  return (
    <div className="bg-fu-surface border border-fu-border rounded-2xl p-4 sm:p-5">
      <p className="text-xs text-fu-muted">{label}</p>
      <p className={`text-2xl sm:text-3xl font-semibold mt-1.5 tabular-nums ${accent}`}>{value}</p>
      {hint && <p className="text-xs text-fu-muted mt-1">{hint}</p>}
    </div>
  );
}

function TaskRow({ task, onOpen, onToggle }) {
  const prio = priorityMeta(task.priority);
  const overdue = isOverdue(task);
  const done = task.status === "done";
  return (
    <li className="flex items-center gap-3 py-2.5 border-b border-fu-border last:border-0">
      <button
        onClick={() => onToggle(task)}
        aria-label={done ? "Mark as not done" : "Mark as done"}
        className={`w-[18px] h-[18px] shrink-0 rounded-md border flex items-center justify-center transition ${
          done ? "bg-fu-green border-fu-green text-fu-bg" : "border-fu-muted/50 hover:border-fu-green"
        }`}
      >
        {done && <span className="text-[11px] font-bold leading-none">✓</span>}
      </button>
      <button onClick={() => onOpen(task)} className="flex-1 min-w-0 text-left">
        <span className={`block text-sm truncate ${done ? "line-through text-fu-muted" : "text-fu-text"}`}>{task.title}</span>
        <span className="text-[11px] text-fu-muted">
          {statusMeta(task.status).label}
          {task.due_date && (
            <span className={overdue ? "text-fu-red" : ""}> · {overdue ? "Overdue, " : "Due "}{dueLabel(task)}</span>
          )}
        </span>
      </button>
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${prio.badge}`}>{prio.label}</span>
    </li>
  );
}

function Panel({ title, count, children, empty }) {
  return (
    <section className="bg-fu-surface border border-fu-border rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-fu-text mb-2">
        {title} {count != null && <span className="text-fu-muted font-normal">({count})</span>}
      </h2>
      {count === 0 ? <p className="text-sm text-fu-muted py-6 text-center">{empty}</p> : <ul>{children}</ul>}
    </section>
  );
}

export default function Dashboard({ store, user, onNavigate }) {
  const { tasks, loading, error, createTask, updateTask, deleteTask } = store;
  const [modal, setModal] = useState(null);

  const data = useMemo(() => {
    const open = tasks.filter((t) => t.status !== "done");
    const weekAgo = Date.now() - 7 * 864e5;
    const in7 = isoDay(7);
    return {
      open: open.length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      doneWeek: tasks.filter((t) => t.completed_at && new Date(t.completed_at).getTime() >= weekAgo).length,
      overdue: open.filter(isOverdue).length,
      rate: tasks.length ? Math.round(((tasks.length - open.length) / tasks.length) * 100) : 0,
      upcoming: open
        .filter((t) => t.due_date && t.due_date <= in7)
        .sort((a, b) => a.due_date.localeCompare(b.due_date))
        .slice(0, 6),
      focus: open.filter((t) => t.priority === "high").slice(0, 6),
    };
  }, [tasks]);

  const toggle = (t) => updateTask(t.id, { status: t.status === "done" ? "todo" : "done" }).catch(() => {});
  const name = user.name || user.email.split("@")[0];

  if (loading) return <p className="text-fu-muted text-sm max-w-6xl mx-auto">Loading…</p>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fu-text">
            {greeting()}, {name}
          </h1>
          <p className="text-sm text-fu-muted mt-1">
            {data.overdue
              ? `You have ${data.overdue} overdue task${data.overdue > 1 ? "s" : ""}.`
              : data.open
              ? `${data.open} open task${data.open > 1 ? "s" : ""}, nothing overdue.`
              : "All clear. Add a task to get started."}
          </p>
        </div>
        <button
          onClick={() => setModal({})}
          className="flex items-center gap-1.5 bg-fu-cyan text-fu-bg text-sm font-semibold px-4 py-2.5 rounded-xl hover:brightness-110 transition shrink-0"
        >
          <PlusIcon width={16} height={16} /> New task
        </button>
      </div>

      {error && <p className="text-sm text-fu-red mb-4">{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat label="Open tasks" value={data.open} hint={`${data.inProgress} in progress`} />
        <Stat label="Completed this week" value={data.doneWeek} accent="text-fu-green" />
        <Stat label="Overdue" value={data.overdue} accent={data.overdue ? "text-fu-red" : "text-fu-text"} />
        <Stat label="Completion rate" value={`${data.rate}%`} accent="text-fu-cyan" hint={`${tasks.length} tasks total`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Due in the next 7 days" count={data.upcoming.length} empty="Nothing due this week.">
          {data.upcoming.map((t) => (
            <TaskRow key={t.id} task={t} onOpen={(task) => setModal({ task })} onToggle={toggle} />
          ))}
        </Panel>
        <Panel title="High priority" count={data.focus.length} empty="No open high-priority tasks.">
          {data.focus.map((t) => (
            <TaskRow key={t.id} task={t} onOpen={(task) => setModal({ task })} onToggle={toggle} />
          ))}
        </Panel>
      </div>

      <button onClick={() => onNavigate("tasks")} className="mt-5 text-sm text-fu-cyan hover:underline">
        Open the full board →
      </button>

      {modal && (
        <TaskModal
          task={modal.task}
          onClose={() => setModal(null)}
          onSave={(fields) => (modal.task ? updateTask(modal.task.id, fields) : createTask(fields))}
          onDelete={modal.task ? () => deleteTask(modal.task.id) : undefined}
        />
      )}
    </div>
  );
}
