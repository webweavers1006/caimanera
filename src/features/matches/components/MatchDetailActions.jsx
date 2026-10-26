"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { MatchForm } from "./MatchForm";
import { deleteMatchAction } from "../actions/match.write.action";
import { MATCH_CONFIG } from "../config/match.constants";

/**
 * Admin actions for the match detail page. Kept client-side so the shared
 * form/dialog behavior is identical to the list page.
 */
export function MatchDetailActions({ match }) {
  const router = useRouter();
  const { can } = usePermission();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { LABELS } = MATCH_CONFIG.UI;

  const canUpdate = can(MATCH_CONFIG.PERMISSIONS.UPDATE);
  const canDelete = can(MATCH_CONFIG.PERMISSIONS.DELETE);

  if (!canUpdate && !canDelete) return null;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteMatchAction(match.id);
      if (result.success) {
        toast.success(result.message);
        setDeleteOpen(false);
        router.push(MATCH_CONFIG.PATH);
      } else {
        toast.error(result.error || "No se pudo eliminar el partido.");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canUpdate && (
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          <Pencil data-icon="inline-start" />
          Editar partido
        </Button>
      )}
      {canDelete && (
        <Button variant="outline" onClick={() => setDeleteOpen(true)}>
          <Trash2 data-icon="inline-start" />
          Eliminar
        </Button>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{LABELS.FORM.DIALOG.TITLE_EDIT}</DialogTitle>
            <DialogDescription>{LABELS.FORM.DIALOG.DESCRIPTION_EDIT}</DialogDescription>
          </DialogHeader>
          <MatchForm
            defaultValues={match}
            onSuccess={() => {
              setEditOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={deleteOpen}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        title={LABELS.FORM.DELETE_DIALOG.TITLE}
        description={LABELS.FORM.DELETE_DIALOG.DESCRIPTION}
        confirmLabel={isPending ? "Eliminando..." : LABELS.FORM.DELETE_DIALOG.SUBMIT}
        isPending={isPending}
      />
    </div>
  );
}
