"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ParticipantForm } from "./ParticipantForm";
import { ParticipantDeleteDialog } from "./ParticipantDeleteDialog";
import { PARTICIPANT_CONFIG } from "../config/participant.constants";

export function ParticipantTableDialogs({
  open,
  onOpenChange,
  editingItem,
  deletingItem,
  setDeletingItem,
  onSuccess
}) {
  const { LABELS } = PARTICIPANT_CONFIG.UI;
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
          <ParticipantForm
            defaultValues={editingItem}
            onSuccess={() => {
              onOpenChange(false);
              onSuccess?.();
            }}
          />
        </DialogContent>
      </Dialog>

      <ParticipantDeleteDialog
        item={deletingItem}
        onOpenChange={(isOpen) => !isOpen && setDeletingItem(null)}
        onSuccess={onSuccess}
      />
    </>
  );
}
