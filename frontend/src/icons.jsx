const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
  width: 18,
  height: 18,
};

export const DashboardIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
);

export const TasksIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 6h16M4 12h16M4 18h10" />
    <path d="m17 16 1.5 1.5L21 15" />
  </svg>
);

export const AnalyticsIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 20V10M11 20V4M18 20v-6" />
  </svg>
);

export const ProfileIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.3" />
    <path d="M5 20c1.2-3.6 4-5.4 7-5.4s5.8 1.8 7 5.4" />
  </svg>
);

export const SettingsIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.5v2.2M12 18.3v2.2M4.6 7.2l1.9 1.1M17.5 15.7l1.9 1.1M4.6 16.8l1.9-1.1M17.5 8.3l1.9-1.1M2.5 12h2.2M19.3 12h2.2" />
  </svg>
);

export const LogoutIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    <path d="M14 16l4-4-4-4M18 12H9" />
  </svg>
);

export const PlusIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const SearchIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
);

export const CalendarIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);
