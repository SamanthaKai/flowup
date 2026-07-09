import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Board from "./pages/Board";
import AppShell from "./components/AppShell";
import ComingSoon from "./components/ComingSoon";
import FeatureCards from "./components/FeatureCards";
import TechBadges from "./components/TechBadges";

const SECTION_LABELS = {
  analytics: "Analytics",
  profile: "Profile",
  settings: "Settings",
};

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [view, setView] = useState("login");
  const [section, setSection] = useState("dashboard");

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
    const onLoggedOut = () => {
      setUser(null);
      setView("login");
      setSection("dashboard");
    };

    return (
      <AppShell user={user} onLogout={onLoggedOut} active={section} onNavigate={setSection}>
        {section === "dashboard" && (
          <>
            <Board />
            <div className="max-w-5xl mx-auto">
              <FeatureCards />
              <TechBadges />
            </div>
          </>
        )}
        {section === "tasks" && <Board />}
        {section !== "dashboard" && section !== "tasks" && (
          <ComingSoon label={SECTION_LABELS[section]} />
        )}
      </AppShell>
    );
  }

  return view === "login" ? (
    <Login onLoggedIn={setUser} onSwitchToSignup={() => setView("signup")} />
  ) : (
    <Signup onLoggedIn={setUser} onSwitchToLogin={() => setView("login")} />
  );
}

export default App;
