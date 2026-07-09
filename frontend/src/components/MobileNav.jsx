import {
  AnalyticsIcon,
  DashboardIcon,
  ProfileIcon,
  SettingsIcon,
  TasksIcon,
} from "../icons";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", Icon: DashboardIcon },
  { key: "tasks", label: "Tasks", Icon: TasksIcon },
  { key: "analytics", label: "Analytics", Icon: AnalyticsIcon },
  { key: "profile", label: "Profile", Icon: ProfileIcon },
  { key: "settings", label: "Settings", Icon: SettingsIcon },
];

export default function MobileNav({ active, onNavigate }) {
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-10 bg-fu-surface/90 backdrop-blur-md border-t border-fu-border flex justify-around py-2">
      {NAV_ITEMS.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`flex flex-col items-center gap-1 px-2 py-1 text-[11px] ${
              isActive ? "text-fu-cyan" : "text-fu-muted"
            }`}
          >
            <Icon />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
