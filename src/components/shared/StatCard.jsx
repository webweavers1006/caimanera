"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Summary stat card component.
 * Displays an icon, title, numeric value, and optional subtitle.
 * Reusable across dashboard, case-stats, and all reporting modules.
 *
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.title - Card title
 * @param {number} props.value - Numeric value
 * @param {string} [props.subtitle] - Optional subtitle line
 * @param {string} [props.variant] - Preset color: "default" | "open" | "closed"
 * @param {string} [props.color] - Direct CSS color (hex/hsl) from DB; overrides variant
 * @param {string} [props.className] - Extra classes for the Card root
 */
export function StatCard({ icon: Icon, title, value, subtitle, variant = "default", color, className = "" }) {
  const colorClasses = {
    default: "text-primary",
    open: "text-amber-500",
    closed: "text-emerald-500",
  };

  const iconClassName = color ? "" : colorClasses[variant];
  const valueClassName = color ? "" : colorClasses[variant];
  const iconStyle = color ? { color } : undefined;
  const valueStyle = color ? { color } : undefined;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${iconClassName}`} style={iconStyle} />
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${valueClassName}`} style={valueStyle}>
          {value.toLocaleString("es-VE")}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
