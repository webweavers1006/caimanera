"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deletePermissionAction } from "../actions/permission.write.action";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { PERMISSION_CONFIG } from "../config/permission.constants";

export function PermissionDeleteDialog({ permission, onOpenChange, onSuccess }) {
  const [isPending, startTransition] = useTransition();
  const { UI: { LABELS: { FORM: { DELETE_DIALOG } } } } = PERMISSION_CONFIG;

  const handleDelete = () => {
    if (!permission) return;

    startTransition(async () => {
      const result = await deletePermissionAction(permission.id);
      if (result.success) {
        toast.success(result.message);
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
      onOpenChange(false);
    });
  };

  return (
    <DeleteConfirmDialog
      isOpen={!!permission}
      onConfirm={handleDelete}
      onCancel={() => onOpenChange(false)}
      title={DELETE_DIALOG.TITLE}
      description={DELETE_DIALOG.DESCRIPTION}
      isLoading={isPending}
    />
  );
}
