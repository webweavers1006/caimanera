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
    description = DELETE.DESCRIPTION
}) {
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>{DELETE.CANCEL}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {DELETE.CONFIRM}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
