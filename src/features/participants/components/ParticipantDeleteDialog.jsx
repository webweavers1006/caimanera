"use client";

import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { deleteParticipantAction } from "../actions/participant.write.action";
import { PARTICIPANT_CONFIG } from "../config/participant.constants";

export function ParticipantDeleteDialog({ item, onOpenChange, onSuccess }) {
  const { LABELS } = PARTICIPANT_CONFIG.UI;

  const handleDelete = async () => {
    if (!item) return;
    const result = await deleteParticipantAction(item.id);
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
