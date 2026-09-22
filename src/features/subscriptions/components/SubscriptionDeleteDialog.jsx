"use client";

import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { deleteSubscriptionAction } from "../actions/subscription.write.action";
import { SUBSCRIPTION_CONFIG } from "../config/subscription.constants";

export function SubscriptionDeleteDialog({ item, onOpenChange, onSuccess }) {
  const { LABELS } = SUBSCRIPTION_CONFIG.UI;

  const handleDelete = async () => {
    if (!item) return;
    const result = await deleteSubscriptionAction(item.id);
    if (result.success) {
      toast.success(result.message);
      onSuccess?.();
    } else {
      toast.error(result.error);
    }
    onOpenChange(false);
  };

  return (
    <DeleteConfirmDialog
      isOpen={!!item}
      onConfirm={handleDelete}
      onCancel={() => onOpenChange(false)}
      title={LABELS.FORM.DELETE_DIALOG.TITLE}
      description={LABELS.FORM.DELETE_DIALOG.DESCRIPTION}
    />
  );
}
