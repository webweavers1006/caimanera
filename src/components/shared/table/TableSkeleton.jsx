import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="h-10 border-b bg-muted/40" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex h-12 items-center space-x-4 border-b px-4 last:border-0">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
