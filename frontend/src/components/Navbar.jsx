import Logo from "./Logo";
import { LogoutIcon } from "../icons";

export default function Navbar({ email, onLogout }) {
  return (
    <header className="sticky top-0 z-10 border-b border-fu-border bg-fu-bg/70 backdrop-blur-md">
      <div className="flex items-center justify-between px-5 py-3.5">
        <Logo size={26} />
        <div className="flex items-center gap-3 text-sm">
          <span className="text-fu-muted hidden sm:inline">{email}</span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-fu-muted hover:text-fu-text border border-fu-border hover:border-fu-cyan/40 rounded-full px-3 py-1.5 transition-colors"
          >
            <LogoutIcon width={15} height={15} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
