"use client";

import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { deleteCountryAction } from "../actions/country.write.action";
import { COUNTRY_CONFIG } from "../config/country.constants";

export function CountryDeleteDialog({ item, onOpenChange, onSuccess }) {
  const { LABELS } = COUNTRY_CONFIG.UI;

  const handleDelete = async () => {
    if (!item) return;
    const result = await deleteCountryAction(item.id);
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
