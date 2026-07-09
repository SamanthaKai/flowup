import {
  AnalyticsIcon,
  DashboardIcon,
  ProfileIcon,
  SettingsIcon,
  TasksIcon,
} from "../icons";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", Icon: DashboardIcon },
  { key: "tasks", label: "My Tasks", Icon: TasksIcon },
  { key: "analytics", label: "Analytics", Icon: AnalyticsIcon },
  { key: "profile", label: "Profile", Icon: ProfileIcon },
  { key: "settings", label: "Settings", Icon: SettingsIcon },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="hidden sm:flex w-56 shrink-0 flex-col bg-fu-surface border-r border-fu-border px-3 py-5">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-fu-cyan/10 text-fu-cyan shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_0_14px_rgba(34,211,238,0.15)]"
                  : "text-fu-muted hover:bg-white/5 hover:text-fu-text"
              }`}
            >
              <Icon
                className={isActive ? "text-fu-cyan" : "text-fu-muted group-hover:text-fu-text"}
              />
              <span className="font-medium">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
