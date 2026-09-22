"use client";

import { toast } from "sonner";
import { deleteUser } from "../actions/user.write.action";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { USER_CONFIG } from "../config/user.constants";

export function UserDeleteDialog({ user, onOpenChange, onSuccess }) {
  const { UI: { LABELS: { FORM: { DELETE_DIALOG } } } } = USER_CONFIG;

  const handleDelete = async () => {
    if (!user) return;
    const result = await deleteUser(user.id);
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
      isOpen={!!user}
      onConfirm={handleDelete}
      onCancel={() => onOpenChange(false)}
      title={DELETE_DIALOG.TITLE}
      description={DELETE_DIALOG.DESCRIPTION.replace('al usuario', `al usuario "${user?.firstName} ${user?.lastName}"`)}
    />
  );
}
