"use client";

import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { deleteMatchAction } from "../actions/match.write.action";
import { MATCH_CONFIG } from "../config/match.constants";

export function MatchDeleteDialog({ item, onOpenChange, onSuccess }) {
  const { LABELS } = MATCH_CONFIG.UI;

  const handleDelete = async () => {
    if (!item) return;
    const result = await deleteMatchAction(item.id);
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
