import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppShell({ user, onLogout, active, onNavigate, children }) {
  return (
    <div className="min-h-screen bg-fu-bg text-fu-text flex">
      <Sidebar active={active} onNavigate={onNavigate} />
      <div className="flex-1 min-w-0">
        <Navbar email={user.email} onLogout={onLogout} />
        <main className="px-5 sm:px-8 py-8 pb-24 sm:pb-8">{children}</main>
      </div>
      <MobileNav active={active} onNavigate={onNavigate} />
    </div>
  );
}
