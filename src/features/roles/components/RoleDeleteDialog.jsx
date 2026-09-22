"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteRoleAction } from "../actions/role.write.action";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ROLE_CONFIG } from "../config/role.constants";

export function RoleDeleteDialog({ role, onOpenChange, onSuccess }) {
  const [isPending, startTransition] = useTransition();
  const { UI: { LABELS: { FORM: { DELETE_DIALOG } } } } = ROLE_CONFIG;

  const handleDelete = () => {
    if (!role) return;

    startTransition(async () => {
      const result = await deleteRoleAction(role.id);
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
      isOpen={!!role}
      onConfirm={handleDelete}
      onCancel={() => onOpenChange(false)}
      title={DELETE_DIALOG.TITLE}
      description={DELETE_DIALOG.DESCRIPTION.replace('el rol', `el rol "${role?.name}"`)}
      isLoading={isPending}
    />
  );
}
