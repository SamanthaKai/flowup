export default function ComingSoon({ label }) {
  return (
    <div className="border border-dashed border-fu-border rounded-2xl py-24 text-center">
      <p className="text-fu-text font-medium">{label}</p>
      <p className="text-fu-muted text-sm mt-1">Coming soon.</p>
    </div>
  );
}
