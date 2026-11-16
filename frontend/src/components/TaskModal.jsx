import { useEffect, useState } from "react";
import { PRIORITIES, STATUSES } from "../tasks";

const field =
  "w-full px-3.5 py-2.5 rounded-lg bg-fu-bg border border-fu-border text-fu-text text-sm outline-none focus:border-fu-cyan/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)] transition";
const label = "block text-xs font-medium text-fu-muted mb-1.5";

/** Create (task = null) or edit an existing task. */
export default function TaskModal({ task, defaultStatus = "todo", onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || defaultStatus,
    priority: task?.priority || "medium",
    due_date: task?.due_date || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ ...form, due_date: form.due_date || null });
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={submit}
        className="w-full sm:max-w-lg bg-fu-surface border border-fu-border rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-fu-text">{task ? "Edit task" : "New task"}</h2>
          <button type="button" onClick={onClose} className="text-fu-muted hover:text-fu-text text-xl leading-none" aria-label="Close">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={label} htmlFor="t-title">Title</label>
            <input id="t-title" autoFocus value={form.title} onChange={set("title")} className={field} placeholder="What needs doing?" />
          </div>
          <div>
            <label className={label} htmlFor="t-desc">Description</label>
            <textarea id="t-desc" rows={3} value={form.description} onChange={set("description")} className={`${field} resize-y`} placeholder="Optional details" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={label} htmlFor="t-status">Status</label>
              <select id="t-status" value={form.status} onChange={set("status")} className={field}>
                {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="t-prio">Priority</label>
              <select id="t-prio" value={form.priority} onChange={set("priority")} className={field}>
                {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="t-due">Due date</label>
              <input id="t-due" type="date" value={form.due_date} onChange={set("due_date")} className={`${field} [color-scheme:dark]`} />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-fu-red mt-4">{error}</p>}

        <div className="flex items-center gap-3 mt-6">
          {task && onDelete && (
            <button
              type="button"
              onClick={remove}
              disabled={saving}
              className="text-sm text-fu-red hover:bg-fu-red/10 border border-fu-red/30 rounded-lg px-3.5 py-2 transition-colors"
            >
              {confirmDelete ? "Confirm delete" : "Delete"}
            </button>
          )}
          <div className="flex-1" />
          <button type="button" onClick={onClose} className="text-sm text-fu-muted hover:text-fu-text px-3.5 py-2">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-fu-cyan text-fu-bg text-sm font-semibold px-5 py-2 rounded-lg hover:brightness-110 disabled:opacity-60 transition"
          >
            {saving ? "Saving…" : task ? "Save" : "Create task"}
          </button>
        </div>
      </form>
    </div>
  );
}
