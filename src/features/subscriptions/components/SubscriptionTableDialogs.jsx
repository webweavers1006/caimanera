"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SubscriptionForm } from "./SubscriptionForm";
import { SubscriptionDeleteDialog } from "./SubscriptionDeleteDialog";
import { SUBSCRIPTION_CONFIG } from "../config/subscription.constants";

export function SubscriptionTableDialogs({
  open,
  onOpenChange,
  editingItem,
  deletingItem,
  setDeletingItem,
  onSuccess
}) {
  const { LABELS } = SUBSCRIPTION_CONFIG.UI;
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
          <SubscriptionForm
            defaultValues={editingItem}
            onSuccess={() => {
              onOpenChange(false);
              onSuccess?.();
            }}
          />
        </DialogContent>
      </Dialog>

      <SubscriptionDeleteDialog
        item={deletingItem}
        onOpenChange={(isOpen) => !isOpen && setDeletingItem(null)}
        onSuccess={onSuccess}
      />
    </>
  );
}
