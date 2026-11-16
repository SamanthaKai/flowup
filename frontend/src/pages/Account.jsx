import { useState } from "react";
import { apiFetch } from "../api";

const field =
  "w-full px-3.5 py-2.5 rounded-lg bg-fu-bg border border-fu-border text-fu-text text-sm outline-none focus:border-fu-cyan/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)] transition";
const label = "block text-xs font-medium text-fu-muted mb-1.5";
const btn = "text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60";

function Section({ title, desc, children, danger }) {
  return (
    <section className={`bg-fu-surface border rounded-2xl p-5 sm:p-6 ${danger ? "border-fu-red/30" : "border-fu-border"}`}>
      <h2 className={`text-sm font-semibold ${danger ? "text-fu-red" : "text-fu-text"}`}>{title}</h2>
      {desc && <p className="text-xs text-fu-muted mt-1 mb-4">{desc}</p>}
      {children}
    </section>
  );
}

function Status({ msg }) {
  if (!msg) return null;
  return <p className={`text-sm mt-3 ${msg.ok ? "text-fu-green" : "text-fu-red"}`}>{msg.text}</p>;
}

export default function Account({ user, onUserChange, onDeleted, store }) {
  const [name, setName] = useState(user.name || "");
  const [profileMsg, setProfileMsg] = useState(null);
  const [pw, setPw] = useState({ current_password: "", new_password: "" });
  const [pwMsg, setPwMsg] = useState(null);
  const [clearMsg, setClearMsg] = useState(null);
  const [delPw, setDelPw] = useState("");
  const [delMsg, setDelMsg] = useState(null);
  const [busy, setBusy] = useState("");

  const doneCount = store.tasks.filter((t) => t.status === "done").length;
  const joined = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;
  const initial = (user.name || user.email)[0].toUpperCase();

  async function run(key, setMsg, fn) {
    setBusy(key);
    setMsg(null);
    try {
      await fn();
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy("");
    }
  }

  const saveProfile = (e) => {
    e.preventDefault();
    run("profile", setProfileMsg, async () => {
      const updated = await apiFetch("/api/auth/me", { method: "PATCH", body: JSON.stringify({ name }) });
      onUserChange(updated);
      setProfileMsg({ ok: true, text: "Profile saved." });
    });
  };

  const changePassword = (e) => {
    e.preventDefault();
    run("pw", setPwMsg, async () => {
      await apiFetch("/api/auth/password", { method: "POST", body: JSON.stringify(pw) });
      setPw({ current_password: "", new_password: "" });
      setPwMsg({ ok: true, text: "Password updated." });
    });
  };

  const clearDone = () =>
    run("clear", setClearMsg, async () => {
      const n = await store.clearCompleted();
      setClearMsg({ ok: true, text: `Removed ${n} completed task${n === 1 ? "" : "s"}.` });
    });

  const deleteAccount = (e) => {
    e.preventDefault();
    run("delete", setDelMsg, async () => {
      await apiFetch("/api/auth/me", { method: "DELETE", body: JSON.stringify({ password: delPw }) });
      onDeleted();
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-14 h-14 rounded-full bg-fu-cyan/15 border border-fu-cyan/30 text-fu-cyan flex items-center justify-center text-xl font-semibold">
          {initial}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-fu-text truncate">{user.name || "Your account"}</h1>
          <p className="text-sm text-fu-muted truncate">
            {user.email}
            {joined && ` · Joined ${joined}`}
          </p>
        </div>
      </div>

      <Section title="Profile" desc="Your display name appears in the dashboard greeting.">
        <form onSubmit={saveProfile} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className={label} htmlFor="a-name">Display name</label>
            <input id="a-name" value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="e.g. Alex" maxLength={120} />
          </div>
          <button disabled={busy === "profile"} className={`${btn} bg-fu-cyan text-fu-bg hover:brightness-110`}>
            Save
          </button>
        </form>
        <Status msg={profileMsg} />
      </Section>

      <Section title="Change password" desc="At least 6 characters.">
        <form onSubmit={changePassword} className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={label} htmlFor="a-cur">Current password</label>
            <input id="a-cur" type="password" autoComplete="current-password" value={pw.current_password}
              onChange={(e) => setPw({ ...pw, current_password: e.target.value })} className={field} required />
          </div>
          <div>
            <label className={label} htmlFor="a-new">New password</label>
            <input id="a-new" type="password" autoComplete="new-password" value={pw.new_password}
              onChange={(e) => setPw({ ...pw, new_password: e.target.value })} className={field} required minLength={6} />
          </div>
          <div className="sm:col-span-2">
            <button disabled={busy === "pw"} className={`${btn} bg-white/5 border border-fu-border text-fu-text hover:border-fu-cyan/40`}>
              Update password
            </button>
          </div>
        </form>
        <Status msg={pwMsg} />
      </Section>

      <Section title="Clean up" desc={`Permanently remove all ${doneCount} task${doneCount === 1 ? "" : "s"} in Done.`}>
        <button
          onClick={clearDone}
          disabled={busy === "clear" || doneCount === 0}
          className={`${btn} bg-white/5 border border-fu-border text-fu-text hover:border-fu-cyan/40`}
        >
          Clear completed tasks
        </button>
        <Status msg={clearMsg} />
      </Section>

      <Section danger title="Delete account" desc="Deletes your account and every task in it. This can't be undone.">
        <form onSubmit={deleteAccount} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className={label} htmlFor="a-del">Confirm with your password</label>
            <input id="a-del" type="password" autoComplete="current-password" value={delPw}
              onChange={(e) => setDelPw(e.target.value)} className={field} required />
          </div>
          <button disabled={busy === "delete"} className={`${btn} bg-fu-red/15 border border-fu-red/40 text-fu-red hover:bg-fu-red/25`}>
            Delete account
          </button>
        </form>
        <Status msg={delMsg} />
      </Section>
    </div>
  );
}
