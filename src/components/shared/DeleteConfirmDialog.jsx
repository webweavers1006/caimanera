"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

import { SHARED_CONFIG } from "@/features/shared";

const { DELETE } = SHARED_CONFIG.UI.LABELS.DIALOGS;

/**
 * GENERIC SHARED COMPONENT: DeleteConfirmDialog
 * Used across the application to confirm destructive actions.
 */
export function DeleteConfirmDialog({
    isOpen,
    onConfirm,
    onCancel,
    title = DELETE.TITLE,
    description = DELETE.DESCRIPTION,
    confirmLabel = DELETE.CONFIRM,
    cancelLabel = DELETE.CANCEL,
    isPending = false,
}) {
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isPending && onCancel()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel} disabled={isPending}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
