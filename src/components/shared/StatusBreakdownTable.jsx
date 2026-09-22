"use client";

import { useMemo } from "react";

/**
 * Clean table showing cases per direction broken down by individual case status.
 * Replaces the stacked bar chart for multi-status data (4-5 statuses).
 *
 * Columns: Direction name | Status 1 | Status 2 | ... | Status N | TOTAL
 * Each status column header has a colored dot matching the DB color.
 * Zero-count cells show "—" for visual clarity.
 *
 * @param {{ data: Array<{ name: string, statuses: Array<{ statusId: number, status: string, color: string, count: number }>, total: number }>, labels: Object }} props
 */
export function StatusBreakdownTable({ data = [], labels }) {
  // Build column definitions from the union of all statuses across all rows
  const columns = useMemo(() => {
    const map = new Map();
    for (const row of data) {
      for (const s of row.statuses || []) {
        if (!map.has(s.statusId)) {
          map.set(s.statusId, { statusId: s.statusId, status: s.status, color: s.color });
        }
      }
    }
    return [...map.values()].sort((a, b) => a.statusId - b.statusId);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
        {labels?.NO_DATA || "No hay datos disponibles."}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left font-medium text-muted-foreground py-2 pr-3 whitespace-nowrap">
              {labels?.DIRECTION || "Dirección"}
            </th>
            {columns.map((col) => (
              <th
                key={col.statusId}
                className="text-right font-medium text-muted-foreground py-2 px-2 whitespace-nowrap"
              >
                <span className="flex items-center justify-end gap-1.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  {col.status}
                </span>
              </th>
            ))}
            <th className="text-right font-semibold text-foreground py-2 pl-3 whitespace-nowrap">
              {labels?.TOTAL || "Total"}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            // Build a lookup: statusId → count for this row
            const countMap = Object.fromEntries(
              (row.statuses || []).map((s) => [s.statusId, s.count])
            );

            return (
              <tr
                key={row.name}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                {/* Direction name */}
                <td
                  className="py-2 pr-3 text-muted-foreground max-w-[160px] truncate whitespace-nowrap"
                  title={row.name}
                >
                  {row.name}
                </td>

                {/* Per-status counts */}
                {columns.map((col) => {
                  const count = countMap[col.statusId] || 0;
                  return (
                    <td
                      key={col.statusId}
                      className="text-right py-2 px-2 tabular-nums whitespace-nowrap"
                    >
                      {count > 0 ? count.toLocaleString("es-VE") : "—"}
                    </td>
                  );
                })}

                {/* Total */}
                <td className="text-right py-2 pl-3 font-semibold tabular-nums whitespace-nowrap">
                  {row.total.toLocaleString("es-VE")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
