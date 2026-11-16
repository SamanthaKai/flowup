import { CalendarIcon } from "../icons";
import { dueLabel, isOverdue, priorityMeta } from "../tasks";

export default function TaskCard({ task, onOpen, draggable, onDragStart, onDragEnd, dimmed }) {
  const prio = priorityMeta(task.priority);
  const overdue = isOverdue(task);
  const due = dueLabel(task);
  const done = task.status === "done";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(task)}
      onKeyDown={(e) => e.key === "Enter" && onOpen(task)}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-fu-bg border border-fu-border rounded-xl p-3.5 cursor-pointer transition-all hover:border-fu-cyan/30 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)] outline-none focus-visible:border-fu-cyan/60 ${
        dimmed ? "opacity-40" : ""
      }`}
    >
      <p className={`text-sm break-words ${done ? "text-fu-muted line-through" : "text-fu-text"}`}>{task.title}</p>
      {task.description && (
        <p className="text-xs text-fu-muted mt-1 line-clamp-2 break-words">{task.description}</p>
      )}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${prio.badge}`}>{prio.label}</span>
        {due && (
          <span
            className={`flex items-center gap-1 text-[11px] ${
              overdue ? "text-fu-red" : done ? "text-fu-muted" : "text-fu-text/80"
            }`}
          >
            <CalendarIcon width={12} height={12} />
            {overdue ? `Overdue · ${due}` : due}
          </span>
        )}
      </div>
    </div>
  );
}
