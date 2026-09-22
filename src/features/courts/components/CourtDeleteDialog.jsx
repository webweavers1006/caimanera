"use client";

import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { deleteCourtAction } from "../actions/court.write.action";
import { COURT_CONFIG } from "../config/court.constants";

export function CourtDeleteDialog({ item, onOpenChange, onSuccess }) {
  const { LABELS } = COURT_CONFIG.UI;

  const handleDelete = async () => {
    if (!item) return;
    const result = await deleteCourtAction(item.id);
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
