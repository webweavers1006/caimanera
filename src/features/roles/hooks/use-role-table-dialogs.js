import { useState, useTransition } from "react";
import { getRoleDetailsAction } from "../actions/role.read.action";
import { toast } from "sonner";
import { logger } from "@/features/shared";

export function useRoleTableDialogs() {
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deletingRole, setDeletingRole] = useState(null);
  const [isFetching, startFetching] = useTransition();

  const handleCreate = () => {
    setEditingRole(null);
    setOpen(true);
  };

  const handleEdit = (role) => {
    startFetching(async () => {
      try {
        const result = await getRoleDetailsAction(role.id);
        // createProtectedFunction returns raw object on success, or { success: false } on error
        if (!result || result.success === false) {
          toast.error(result?.error || "No se pudieron cargar los detalles del rol");
          return;
        }
        setEditingRole(result);
        setOpen(true);
      } catch (error) {
        logger.error("Error fetching role details", { error: error.message, roleId: role.id });
        toast.error("No se pudieron cargar los detalles del rol");
      }
    });
  };

  const handleDelete = (role) => {
    setDeletingRole(role);
  };

  const handleSuccess = () => {
    setOpen(false);
    setEditingRole(null);
  };

  return {
    open,
    onOpenChange: setOpen,
    editingRole,
    deletingRole,
    setDeletingRole,
    isFetching,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSuccess
  };
}
