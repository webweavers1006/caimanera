"use client";

/**
 * Generic info item: icon + label + value.
 * Used in slide-overs, detail pages, and anywhere a key-value pair
 * with an icon needs to be displayed.
 *
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.label - Label text (muted, small)
 * @param {string} props.value - Value text (medium weight)
 * @param {string} [props.className] - Additional classes for the root element
 */
export function InfoItem({ icon: Icon, label, value, className }) {
  return (
    <div className={`flex items-start gap-2 min-w-0 ${className || ""}`}>
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-all">{value || "-"}</p>
      </div>
    </div>
  );
}
