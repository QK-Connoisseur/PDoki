/**
 * Stylized Veso credit symbol (1 Veso = 1 USD). Single source for the kiss/
 * heart mark so price badges never fall back to a dollar sign or generic coin.
 */
export default function VesoIcon({
  size = 14,
  color = "#f5b63b",
  className = "",
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Veso"
    >
      <path
        d="M8 12c-1-.7-2.7-1.7-3.7-3C3 7.5 3 6.5 4.4 5.7c.7-.4 1.5-.2 2 .4.2.2.3.5.3.8 0-.3.1-.6.3-.8.5-.6 1.3-.8 2-.4C10.4 6.5 10.4 7.5 9 9c-1 1.3-2.7 2.3-3.7 3z"
        fill={color}
      />
    </svg>
  );
}
