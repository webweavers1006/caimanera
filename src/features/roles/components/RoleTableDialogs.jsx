"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RoleForm } from "./RoleForm";
import { RoleDeleteDialog } from "./RoleDeleteDialog";
import { ROLE_CONFIG } from "../config/role.constants";

export function RoleTableDialogs({
  open,
  onOpenChange,
  editingRole,
  deletingRole,
  setDeletingRole,
  onSuccess
}) {
  const { LABELS } = ROLE_CONFIG.UI;
  const { DIALOG } = LABELS.FORM;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? DIALOG.TITLE_EDIT : DIALOG.TITLE_CREATE}
            </DialogTitle>
            <DialogDescription>
              {editingRole ? DIALOG.DESCRIPTION_EDIT : DIALOG.DESCRIPTION_CREATE}
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            role={editingRole}
            onSuccess={() => {
              onOpenChange(false);
              onSuccess?.();
            }}
          />
        </DialogContent>
      </Dialog>

      {deletingRole && (
        <RoleDeleteDialog
          role={deletingRole}
          onOpenChange={(open) => !open && setDeletingRole(null)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
