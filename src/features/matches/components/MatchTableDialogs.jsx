"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MatchForm } from "./MatchForm";
import { MatchDeleteDialog } from "./MatchDeleteDialog";
import { MATCH_CONFIG } from "../config/match.constants";

export function MatchTableDialogs({
  open,
  onOpenChange,
  editingItem,
  deletingItem,
  setDeletingItem,
  onSuccess
}) {
  const { LABELS } = MATCH_CONFIG.UI;
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
          <MatchForm
            defaultValues={editingItem}
            onSuccess={() => {
              onOpenChange(false);
              onSuccess?.();
            }}
          />
        </DialogContent>
      </Dialog>

      <MatchDeleteDialog
        item={deletingItem}
        onOpenChange={(isOpen) => !isOpen && setDeletingItem(null)}
        onSuccess={onSuccess}
      />
    </>
  );
}
