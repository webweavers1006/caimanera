import { useState, useTransition } from "react";
import { getPermissionDetailsAction } from "../actions/permission.read.action";
import { toast } from "sonner";
import { logger } from "@/features/shared";

export function usePermissionTableDialogs() {
  const [open, setOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [deletingPermission, setDeletingPermission] = useState(null);
  const [isFetching, startFetching] = useTransition();

  const handleCreate = () => {
    setEditingPermission(null);
    setOpen(true);
  };

  const handleEdit = (permission) => {
    startFetching(async () => {
      try {
        const result = await getPermissionDetailsAction(permission.id);
        if (!result || result.success === false) {
          toast.error(result?.error || PERMISSION_CONFIG.UI.LABELS.MESSAGES.LOAD_DETAIL_ERROR);
          return;
        }
        setEditingPermission(result);
        setOpen(true);
      } catch (error) {
        logger.error("Error fetching permission details", { error: error.message, permissionId: permission.id });
        toast.error(PERMISSION_CONFIG.UI.LABELS.MESSAGES.LOAD_DETAIL_ERROR);
      }
    });
  };

  const handleDelete = (permission) => {
    setDeletingPermission(permission);
  };

  const handleSuccess = () => {
    setOpen(false);
    setEditingPermission(null);
  };

  return {
    open,
    onOpenChange: setOpen,
    editingPermission,
    deletingPermission,
    setDeletingPermission,
    isFetching,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSuccess,
  };
}
