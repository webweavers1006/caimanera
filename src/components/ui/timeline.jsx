"use client";

import { cn } from "@/features/shared";

/**
 * Vertical timeline container.
 * Renders children with connecting dots and lines.
 *
 * @example
 * <Timeline>
 *   <TimelineItem>First event</TimelineItem>
 *   <TimelineItem>Second event</TimelineItem>
 *   <TimelineItem last>Last event</TimelineItem>
 * </Timeline>
 */
function Timeline({ className, children, ...props }) {
  return (
    <div
      data-slot="timeline"
      className={cn("flex flex-col", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Single item in a timeline.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content of the timeline item
 * @param {boolean} [props.last=false] - If true, hides the connecting line below
 * @param {string} [props.dotClass] - Additional classes for the dot
 */
function TimelineItem({ className, children, last = false, dotClass, ...props }) {
  return (
    <div
      data-slot="timeline-item"
      className={cn("flex gap-2.5 group", className)}
      {...props}
    >
      {/* Dot + line column */}
      <div className="flex flex-col items-center shrink-0 w-3">
        <div
          className={cn(
            "mt-1 size-2 rounded-full bg-primary shrink-0",
            dotClass
          )}
        />
        {!last && <div className="w-px flex-1 bg-border mt-1 min-h-4" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-3">{children}</div>
    </div>
  );
}

export { Timeline, TimelineItem };
