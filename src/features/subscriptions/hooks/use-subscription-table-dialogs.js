"use client";

import { useState, useCallback } from "react";
import { invalidateSelectOptionsCache } from "@/features/shared/lib/select-options-cache";

export function useSubscriptionDialogs() {
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const handleCreate = useCallback(() => {
    setEditingItem(null);
    setOpen(true);
  }, []);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setOpen(true);
  }, []);

  const handleDelete = useCallback((item) => {
    setDeletingItem(item);
  }, []);

  const handleSuccess = useCallback(() => {
    setOpen(false);
    setEditingItem(null);
    setDeletingItem(null);
    invalidateSelectOptionsCache();
  }, []);

  const onOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) setEditingItem(null);
  };

  return {
    open,
    onOpenChange,
    editingItem,
    deletingItem,
    setDeletingItem,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSuccess,
  };
}
