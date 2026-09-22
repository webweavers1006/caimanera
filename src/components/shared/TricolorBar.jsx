/**
 * TricolorBar — Smooth gradient accent bar for UI elements.
 * Yellow → primary blue → red in a single elegant gradient.
 *
 * @param {Object} props
 * @param {"horizontal" | "vertical"} [props.direction="horizontal"] — bar orientation.
 * @param {string} [props.className] — additional classes for the container.
 */
export function TricolorBar({ direction = "horizontal", className = "" }) {
  const isVertical = direction === "vertical";

  return (
    <div
      className={`rounded-full ${isVertical ? "w-1 h-full min-h-12" : "h-1 w-full"} ${className}`}
      style={{
        background: isVertical
          ? "linear-gradient(180deg, oklch(0.88 0.18 90), var(--primary) 50%, oklch(0.58 0.22 25))"
          : "linear-gradient(90deg, oklch(0.88 0.18 90), var(--primary) 50%, oklch(0.58 0.22 25))",
      }}
      aria-hidden="true"
    />
  );
}
