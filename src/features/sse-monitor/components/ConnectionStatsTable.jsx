"use client";

import { Activity, Users, Wifi, WifiOff, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import { SSE_MONITOR_CONFIG } from "@/features/sse-monitor/config/sse-monitor.constants";
import { useSseMonitor } from "@/features/sse-monitor/hooks/use-sse-monitor";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";

const { UI, STATUS } = SSE_MONITOR_CONFIG;
const { LABELS } = UI;
const { NORMAL, WARNING, ANOMALY, COLORS, BG } = STATUS;

// Icon mappings must stay in the component — they import from lucide-react (React components).
const STATUS_ICONS = {
  [NORMAL]: ShieldCheck,
  [WARNING]: AlertTriangle,
  [ANOMALY]: ShieldAlert,
};

/**
 * ConnectionStatsTable — live SSE connection monitoring dashboard.
 *
 * Pure UI component. All data-fetching logic is in useSseMonitor() hook.
 * Receives initial stats via SSR prop for the first render.
 */
export function ConnectionStatsTable({ initialStats }) {
  const { stats, lastUpdated, isLoading } = useSseMonitor(initialStats);

  const totalConnections = stats?.totalConnections ?? 0;
  const uniqueUsers = stats?.uniqueUsers ?? 0;
  const entries = stats?.connectionsPerUser ?? [];
  const hasAnomalies = entries.some((e) => e.status === ANOMALY);
  const hasWarnings = entries.some((e) => e.status === WARNING);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={SSE_MONITOR_CONFIG.TITLE}
        subtitle={LABELS.DESCRIPTION}
        showNav={false}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={hasAnomalies ? WifiOff : Wifi}
          title={LABELS.TOTAL_CONNECTIONS}
          value={totalConnections}
          subtitle={
            hasAnomalies
              ? `${LABELS.STATUS_ANOMALY} detectada`
              : hasWarnings
                ? `${LABELS.STATUS_WARNING} detectada`
                : LABELS.STATUS_NORMAL
          }
          variant={hasAnomalies ? "open" : "default"}
        />
        <StatCard
          icon={Users}
          title={LABELS.UNIQUE_USERS}
          value={uniqueUsers}
          subtitle={`${totalConnections} ${LABELS.CONNECTIONS.toLowerCase()} totales`}
          variant="default"
        />
      </div>

      {/* Thresholds Legend */}
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <Activity className="h-3 w-3" />
        {LABELS.THRESHOLD_INFO}
      </div>

      {/* Connections Table */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">{LABELS.CONNECTIONS_PER_USER}</h3>
          <span className="text-xs text-muted-foreground">
            {isLoading
              ? LABELS.REFRESHING
              : lastUpdated
                ? `${LABELS.LAST_UPDATED}: ${lastUpdated.toLocaleTimeString("es-VE")}`
                : LABELS.LOADING}
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {LABELS.NO_DATA}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                    {LABELS.USER}
                  </th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">
                    {LABELS.CONNECTIONS}
                  </th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">
                    {LABELS.STATUS}
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const StatusIcon = STATUS_ICONS[entry.status] || ShieldCheck;
                  const colorClass = COLORS[entry.status] || COLORS[NORMAL];
                  const bgClass = BG[entry.status] || BG[NORMAL];

                  return (
                    <tr
                      key={entry.userId}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-sm font-medium">
                        {entry.userName}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-flex items-center gap-1.5 text-sm font-mono font-semibold">
                          {entry.connections}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bgClass} ${colorClass}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {entry.status === ANOMALY
                            ? LABELS.STATUS_ANOMALY
                            : entry.status === WARNING
                              ? LABELS.STATUS_WARNING
                              : LABELS.STATUS_NORMAL}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
