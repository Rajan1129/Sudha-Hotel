export default function Icon({ name, className = '', style, filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}), ...style }}
    >
      {name}
    </span>
  );
}
