"use client";

import { CheckCircle, Clock } from "lucide-react";

/**
 * Reusable table for open/closed/total stats by a named category.
 * Supports forwarded/non-forwarded breakdown columns.
 *
 * @param {{ rows: Array<Object>, nameKey: string, nameLabel: string, labels: Object }} props
 */
export function StatsRowTable({ rows, nameKey, nameLabel, labels }) {
  const showForwarded = rows.some((r) => r.openForwarded !== undefined);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 font-medium text-muted-foreground">{nameLabel}</th>
            {showForwarded && (
              <>
                <th className="py-2 font-medium text-muted-foreground text-right">{labels.OPEN_NOT_FORWARDED}</th>
                <th className="py-2 font-medium text-muted-foreground text-right">{labels.OPEN_FORWARDED}</th>
              </>
            )}
            <th className="py-2 font-medium text-muted-foreground text-right">{labels.OPEN}</th>
            <th className="py-2 font-medium text-muted-foreground text-right">{labels.CLOSED}</th>
            <th className="py-2 font-medium text-muted-foreground text-right">{labels.TOTAL}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id != null ? row.id : `${row[nameKey]}-${i}`} className="border-b last:border-0 hover:bg-muted/50">
              <td className="py-2 max-w-[200px] truncate" title={row[nameKey]}>
                {row[nameKey]}
              </td>
              {showForwarded && (
                <>
                  <td className="py-2 text-right">
                    <span className="text-sky-500">{row.openNotForwarded ?? 0}</span>
                  </td>
                  <td className="py-2 text-right">
                    <span className="text-orange-500">{row.openForwarded ?? 0}</span>
                  </td>
                </>
              )}
              <td className="py-2 text-right">
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <Clock className="h-3 w-3" />
                  {row.open ?? 0}
                </span>
              </td>
              <td className="py-2 text-right">
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="h-3 w-3" />
                  {row.closed ?? 0}
                </span>
              </td>
              <td className="py-2 text-right font-medium">{row.total ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
