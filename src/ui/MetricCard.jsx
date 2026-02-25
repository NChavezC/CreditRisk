function MetricCard({ title, value, subtitle, highlight = false }) {
  return (
    <div
      className={`
        rounded-xl border
        p-6
        bg-white
        transition-all duration-200
        ${
          highlight
            ? "border-blue-500 shadow-md"
            : "border-stone-200 hover:shadow-md"
        }
      `}
    >
      {/* Title */}
      <p className="text-sm font-medium text-stone-500 mb-2">{title}</p>

      {/* Main Value */}
      <div className="text-3xl font-semibold text-stone-800 mb-2">{value}</div>

      {/* Subtitle (optional) */}
      {subtitle && <p className="text-sm text-stone-500">{subtitle}</p>}
    </div>
  );
}

export default MetricCard;
