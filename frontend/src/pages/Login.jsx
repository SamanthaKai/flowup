import { useState } from "react";
import { apiFetch } from "../api";
import Logo from "../components/Logo";

export default function Login({ onLoggedIn, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onLoggedIn(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-fu-bg px-4">
      <div className="w-full max-w-sm bg-fu-surface border border-fu-border rounded-2xl shadow-xl p-8">
        <Logo size={34} className="mb-5" />
        <p className="text-fu-muted text-sm mb-6">Log in to your board.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-fu-muted mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-fu-bg border border-fu-border rounded-lg text-sm text-fu-text outline-none focus:border-fu-cyan/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)] transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fu-muted mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-fu-bg border border-fu-border rounded-lg text-sm text-fu-text outline-none focus:border-fu-cyan/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)] transition"
            />
          </div>

          {error && <p className="text-sm text-fu-red">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-fu-cyan text-fu-bg text-sm font-semibold py-2.5 rounded-lg hover:brightness-110 hover:shadow-[0_0_16px_rgba(34,211,238,0.35)] transition-all disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-sm text-fu-muted mt-6 text-center">
          New here?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-fu-cyan font-medium underline underline-offset-2"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
