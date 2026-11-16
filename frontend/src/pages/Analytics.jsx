import { useMemo } from "react";
import { PRIORITIES, STATUSES, isOverdue } from "../tasks";

const DAYS = 14;

function Card({ title, children, className = "" }) {
  return (
    <section className={`bg-fu-surface border border-fu-border rounded-2xl p-5 ${className}`}>
      <h2 className="text-sm font-semibold text-fu-text mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Breakdown({ rows, total }) {
  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const pct = total ? Math.round((r.value / total) * 100) : 0;
        return (
          <div key={r.label}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-fu-text">{r.label}</span>
              <span className="text-fu-muted tabular-nums">
                {r.value} · {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-fu-bg overflow-hidden">
              <div className={`h-full rounded-full ${r.bar}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Analytics({ store }) {
  const { tasks, loading } = store;

  const stats = useMemo(() => {
    const days = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({ start: d.getTime(), date: d, count: 0 });
    }
    const durations = [];
    for (const t of tasks) {
      if (!t.completed_at) continue;
      const doneAt = new Date(t.completed_at).getTime();
      const day = days.find((d, i) => doneAt >= d.start && (i === days.length - 1 || doneAt < days[i + 1].start));
      if (day) day.count++;
      if (t.created_at) durations.push(doneAt - new Date(t.created_at).getTime());
    }
    const open = tasks.filter((t) => t.status !== "done");
    const avgMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null;
    return {
      days,
      max: Math.max(1, ...days.map((d) => d.count)),
      completed14: days.reduce((a, d) => a + d.count, 0),
      open,
      avgMs,
      overdue: open.filter(isOverdue).length,
    };
  }, [tasks]);

  if (loading) return <p className="text-fu-muted text-sm max-w-6xl mx-auto">Loading…</p>;

  const avg =
    stats.avgMs == null
      ? "–"
      : stats.avgMs < 36e5
      ? `${Math.max(1, Math.round(stats.avgMs / 6e4))} min`
      : stats.avgMs < 864e5
      ? `${(stats.avgMs / 36e5).toFixed(1)} h`
      : `${(stats.avgMs / 864e5).toFixed(1)} days`;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold text-fu-text">Analytics</h1>
      <p className="text-sm text-fu-muted mt-1 mb-6">How your work is moving, computed live from your tasks.</p>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
        {[
          ["Completed (14 days)", stats.completed14, "text-fu-green"],
          ["Avg. time to finish", avg, "text-fu-cyan"],
          ["Overdue now", stats.overdue, stats.overdue ? "text-fu-red" : "text-fu-text"],
        ].map(([label, value, color]) => (
          <div key={label} className="bg-fu-surface border border-fu-border rounded-2xl p-4 sm:p-5">
            <p className="text-xs text-fu-muted">{label}</p>
            <p className={`text-xl sm:text-3xl font-semibold mt-1.5 tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <Card title="Tasks completed per day" className="mb-4">
        <div className="flex items-end gap-1.5 sm:gap-2 h-40">
          {stats.days.map((d) => (
            <div key={d.start} className="flex-1 h-full flex flex-col justify-end items-center group">
              <span className="text-[10px] text-fu-muted mb-1 opacity-0 group-hover:opacity-100 tabular-nums">{d.count}</span>
              <div
                className={`w-full rounded-t-md ${d.count ? "bg-fu-cyan" : "bg-fu-border"} transition-all`}
                style={{ height: d.count ? `${(d.count / stats.max) * 100}%` : "3px" }}
                title={`${d.date.toLocaleDateString()}: ${d.count} completed`}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 sm:gap-2 mt-2">
          {stats.days.map((d, i) => (
            <span key={d.start} className="flex-1 text-center text-[10px] text-fu-muted">
              {i % 2 === 1 ? d.date.toLocaleDateString(undefined, { day: "numeric", month: "short" }) : ""}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title={`By status (${tasks.length} total)`}>
          <Breakdown
            total={tasks.length}
            rows={STATUSES.map((s) => ({ label: s.label, bar: s.bar, value: tasks.filter((t) => t.status === s.key).length }))}
          />
        </Card>
        <Card title={`Open tasks by priority (${stats.open.length})`}>
          <Breakdown
            total={stats.open.length}
            rows={PRIORITIES.map((p) => ({ label: p.label, bar: p.bar, value: stats.open.filter((t) => t.priority === p.key).length }))}
          />
        </Card>
      </div>
    </div>
  );
}
