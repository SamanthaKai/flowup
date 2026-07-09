export default function Logo({ size = 28, showWordmark = true, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo-64.png"
        alt="FlowUp"
        width={size}
        height={size}
        style={{
          filter: "drop-shadow(0 0 6px rgba(34,211,238,0.35))",
        }}
      />
      {showWordmark && (
        <span className="text-fu-text font-semibold tracking-tight text-lg">
          FlowUp
        </span>
      )}
    </div>
  );
}
