import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import { useTasks } from "./tasks";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import Analytics from "./pages/Analytics";
import Account from "./pages/Account";
import AppShell from "./components/AppShell";

function Workspace({ user, setUser, onLoggedOut }) {
  const [section, setSection] = useState("dashboard");
  const store = useTasks();

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    onLoggedOut();
  }

  return (
    <AppShell user={user} onLogout={logout} active={section} onNavigate={setSection}>
      {section === "dashboard" && <Dashboard store={store} user={user} onNavigate={setSection} />}
      {section === "tasks" && <Board store={store} />}
      {section === "analytics" && <Analytics store={store} />}
      {section === "account" && (
        <Account user={user} store={store} onUserChange={setUser} onDeleted={onLoggedOut} />
      )}
    </AppShell>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [view, setView] = useState("login");

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-fu-bg flex items-center justify-center text-fu-muted text-sm">
        Loading…
      </div>
    );
  }

  if (user) {
    return (
      <Workspace
        key={user.id}
        user={user}
        setUser={setUser}
        onLoggedOut={() => {
          setUser(null);
          setView("login");
        }}
      />
    );
  }

  return view === "login" ? (
    <Login onLoggedIn={setUser} onSwitchToSignup={() => setView("signup")} />
  ) : (
    <Signup onLoggedIn={setUser} onSwitchToLogin={() => setView("login")} />
  );
}

export default App;
