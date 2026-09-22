import { useState } from "react";

export function useUserTableDialogs() {
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const handleCreate = () => {
    setEditingUser(null);
    setOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setOpen(true);
  };

  const handleDelete = (user) => {
    setDeletingUser(user);
  };

  const handleSuccess = () => {
    setOpen(false);
    setEditingUser(null);
    setDeletingUser(null);
  };

  return {
    open,
    onOpenChange: setOpen,
    editingUser,
    deletingUser,
    setDeletingUser,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSuccess
  };
}
