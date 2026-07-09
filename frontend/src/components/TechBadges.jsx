const STACK = [
  "React",
  "Flask",
  "PostgreSQL",
  "SQLAlchemy",
  "Werkzeug",
  "Tailwind CSS",
];

export default function TechBadges() {
  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {STACK.map((tech) => (
        <span
          key={tech}
          className="text-xs text-fu-muted bg-fu-surface border border-fu-border rounded-full px-3 py-1.5"
        >
          {tech}
        </span>
      ))}
    </div>
  );
}
