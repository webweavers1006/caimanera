import { TableSkeleton } from "@/components/shared/table/TableSkeleton";

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-96 animate-pulse rounded-md bg-muted" />
      </div>
      <TableSkeleton rows={10} columns={4} />
    </div>
  );
}
