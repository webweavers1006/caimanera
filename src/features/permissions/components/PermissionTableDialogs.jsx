"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PermissionForm } from "./PermissionForm";
import { PermissionDeleteDialog } from "./PermissionDeleteDialog";
import { PERMISSION_CONFIG } from "../config/permission.constants";

export function PermissionTableDialogs({
  open,
  onOpenChange,
  editingPermission,
  deletingPermission,
  setDeletingPermission,
  onSuccess,
}) {
  const { LABELS } = PERMISSION_CONFIG.UI;
  const { DIALOG } = LABELS.FORM;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPermission ? DIALOG.TITLE_EDIT : DIALOG.TITLE_CREATE}
            </DialogTitle>
            <DialogDescription>
              {editingPermission ? DIALOG.DESCRIPTION_EDIT : DIALOG.DESCRIPTION_CREATE}
            </DialogDescription>
          </DialogHeader>
          <PermissionForm
            permission={editingPermission}
            onSuccess={() => {
              onOpenChange(false);
              onSuccess?.();
            }}
          />
        </DialogContent>
      </Dialog>

      {deletingPermission && (
        <PermissionDeleteDialog
          permission={deletingPermission}
          onOpenChange={(open) => !open && setDeletingPermission(null)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
