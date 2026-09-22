"use client";

import { Toolbar } from "@/components/shared/Toolbar";

/**
 * Generic toolbar for detail/dashboard pages.
 * Renders info items with icons + separators on the left, action buttons on the right.
 *
 * @param {Object} props
 * @param {ReactNode} props.actions - Action buttons (e.g. back, create).
 * @param {Array} [props.items] - Info items: [{ icon: LucideIcon, label?: string, value: string }].
 *                                Items with falsy value are skipped.
 */
export function DashboardToolbar({ actions, items = [] }) {
  const visibleItems = items.filter((item) => item.value);

  return (
    <Toolbar>
      <Toolbar.Footer>
        {visibleItems.length > 0 && (
          <div className="flex flex-1 items-center gap-3 text-sm min-w-0 flex-wrap">
            {visibleItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <span key={i} className="flex items-center gap-1.5 shrink-0">
                  {i > 0 && <span className="text-border select-none mx-1">|</span>}
                  {Icon && <Icon className="h-4 w-4 text-primary/70 shrink-0" />}
                  {item.label && <span className="text-muted-foreground">{item.label}</span>}
                  <span className={!item.label ? "font-medium text-foreground/80" : ""}>
                    {item.value}
                  </span>
                </span>
              );
            })}
          </div>
        )}
        <Toolbar.Actions>
          {actions}
        </Toolbar.Actions>
      </Toolbar.Footer>
    </Toolbar>
  );
}
