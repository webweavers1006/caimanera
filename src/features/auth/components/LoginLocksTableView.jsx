"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, Gauge, Timer } from "lucide-react";
import { DataTable } from "@/components/shared/table/DataTable";
import { StatCard } from "@/components/shared/StatCard";
import { AUTH_CONFIG } from "../config/auth.constants";
import { getLoginLocksTableColumns } from "../config/login-locks.columns";
import { unlockLoginIpAction } from "../actions/auth.login-locks.action";

const { UI } = AUTH_CONFIG.LOGIN_LOCKS;
const { LABELS } = UI;

/**
 * LoginLocksTableView — client view listing rate-limited IPs with unlock action.
 *
 * Renders StatCards + the generic DataTable (columns come from
 * config/login-locks.columns). Unlock is enforced server-side via
 * permission `auth:unlock`.
 */
export function LoginLocksTableView({ initialBlocks, stats }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleUnlock(item) {
    if (isUnlocking) return;

    setIsUnlocking(true);
    const result = await unlockLoginIpAction({ ip: item.ip });
    setIsUnlocking(false);

    if (result?.success) {
      toast.success(LABELS.UNLOCK_SUCCESS);
      setBlocks((prev) => prev.filter((block) => block.ip !== item.ip));
      startTransition(() => router.refresh());
    } else {
      toast.error(result?.error || LABELS.UNLOCK_ERROR);
    }
  }

  const columns = getLoginLocksTableColumns({
    onUnlock: handleUnlock,
    isPending: isUnlocking,
  });

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Ban}
          title={LABELS.BLOCKED_IPS}
          value={blocks.length}
          variant="open"
        />
        <StatCard
          icon={Gauge}
          title={LABELS.MAX_ATTEMPTS}
          value={stats.maxAttempts}
        />
        <StatCard
          icon={Timer}
          title={LABELS.WINDOW_MINUTES}
          value={Math.round(stats.windowMs / 60000)}
        />
      </div>

      {/* Blocked IPs Table */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">{LABELS.BLOCKED_IPS}</h3>
        </div>
        <DataTable
          data={blocks}
          columns={columns}
          emptyMessage={LABELS.EMPTY}
        />
      </div>

      <p className="text-xs text-muted-foreground">{LABELS.NOTE}</p>
    </>
  );
}
