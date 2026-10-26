"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { confirmTransactionAction } from "../actions/transaction.write.action";
import { TRANSACTION_CONFIG } from "../config/transaction.constants";

const { ACTIONS } = TRANSACTION_CONFIG.UI.LABELS;

export function TransactionConfirmButton({ transactionId }) {
  const router = useRouter();
  const { can } = usePermission();
  const [isPending, startTransition] = useTransition();

  if (!can(TRANSACTION_CONFIG.PERMISSIONS.UPDATE)) return null;

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await confirmTransactionAction(transactionId);

      if (!result?.success) {
        toast.error(result?.error || ACTIONS.CONFIRM_ERROR);
        return;
      }

      toast.success(ACTIONS.CONFIRM_SUCCESS);
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      className="gap-1.5"
      onClick={handleConfirm}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Check className="size-3.5" />
      )}
      {isPending ? ACTIONS.CONFIRMING : ACTIONS.CONFIRM}
    </Button>
  );
}
