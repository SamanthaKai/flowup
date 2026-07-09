import { DatabaseIcon, LockIcon, StackIcon, UserCheckIcon } from "../icons";

const FEATURES = [
  {
    Icon: LockIcon,
    title: "Secure Auth",
    desc: "Hashed passwords, signed sessions",
  },
  {
    Icon: DatabaseIcon,
    title: "PostgreSQL Database",
    desc: "Real persistence, not a mock",
  },
  {
    Icon: UserCheckIcon,
    title: "Per-User Data",
    desc: "Scoped access, no data leaks",
  },
  {
    Icon: StackIcon,
    title: "React + Flask",
    desc: "Full-stack, end to end",
  },
];

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
      {FEATURES.map(({ Icon, title, desc }) => (
        <div
          key={title}
          className="bg-fu-surface border border-fu-border rounded-2xl p-4"
        >
          <div className="w-8 h-8 rounded-lg bg-fu-cyan/10 text-fu-cyan flex items-center justify-center mb-3">
            <Icon width={16} height={16} />
          </div>
          <p className="text-sm font-medium text-fu-text mb-0.5">{title}</p>
          <p className="text-xs text-fu-muted">{desc}</p>
        </div>
      ))}
    </div>
  );
}
