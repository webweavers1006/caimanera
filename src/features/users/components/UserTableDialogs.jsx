"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import { UserDeleteDialog } from "./UserDeleteDialog";
import { USER_CONFIG } from "../config/user.constants";

export function UserTableDialogs({
  open,
  onOpenChange,
  editingUser,
  deletingUser,
  setDeletingUser,
  onSuccess
}) {
  const { DIALOG } = USER_CONFIG.UI.LABELS.FORM;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? DIALOG.TITLE_EDIT : DIALOG.TITLE_CREATE}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? DIALOG.DESCRIPTION_EDIT : DIALOG.DESCRIPTION_CREATE}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={editingUser}
            onSuccess={() => {
              onOpenChange(false);
              onSuccess?.();
            }}
          />
        </DialogContent>
      </Dialog>

      {deletingUser && (
        <UserDeleteDialog
          user={deletingUser}
          onOpenChange={(isOpen) => !isOpen && setDeletingUser(null)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
