"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CountryForm } from "./CountryForm";
import { CountryDeleteDialog } from "./CountryDeleteDialog";
import { COUNTRY_CONFIG } from "../config/country.constants";

export function CountryTableDialogs({
  open,
  onOpenChange,
  editingItem,
  deletingItem,
  setDeletingItem,
  onSuccess
}) {
  const { LABELS } = COUNTRY_CONFIG.UI;
  const { DIALOG } = LABELS.FORM;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? DIALOG.TITLE_EDIT : DIALOG.TITLE_CREATE}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? DIALOG.DESCRIPTION_EDIT : DIALOG.DESCRIPTION_CREATE}
            </DialogDescription>
          </DialogHeader>
          <CountryForm
            defaultValues={editingItem}
            onSuccess={() => {
              onOpenChange(false);
              onSuccess?.();
            }}
          />
        </DialogContent>
      </Dialog>

      <CountryDeleteDialog
        item={deletingItem}
        onOpenChange={(isOpen) => !isOpen && setDeletingItem(null)}
        onSuccess={onSuccess}
      />
    </>
  );
}
