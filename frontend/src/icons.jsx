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

export const LockIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="5" y="10.5" width="14" height="9" rx="2.2" />
    <path d="M7.5 10.5V7.8a4.5 4.5 0 0 1 9 0v2.7" />
  </svg>
);

export const DatabaseIcon = (p) => (
  <svg {...base} {...p}>
    <ellipse cx="12" cy="6" rx="7" ry="3" />
    <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
    <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
  </svg>
);

export const UserCheckIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="10" cy="8" r="3.3" />
    <path d="M3.5 20c1.1-3.4 3.7-5.1 6.5-5.1" />
    <path d="m14.5 15.5 2 2 3.5-3.5" />
  </svg>
);

export const StackIcon = (p) => (
  <svg {...base} {...p}>
    <path d="m12 3 8 4.5-8 4.5-8-4.5Z" />
    <path d="m4 12 8 4.5 8-4.5" />
    <path d="m4 16.5 8 4.5 8-4.5" />
  </svg>
);
