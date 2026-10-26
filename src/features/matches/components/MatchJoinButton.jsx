"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Clock, Loader2, LogIn, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { PARTICIPANT_CONFIG } from "@/features/participants/config/participant.constants";
import {
  enrollInMatchAction,
  leaveInMatchAction,
} from "../actions/match.enroll.action";
import { payAndEnrollInMatchAction } from "@/features/payments/actions/match.payment.action";
import { MATCH_CONFIG } from "../config/match.constants";

/**
 * Self-service enrollment CTA used by discovery cards and match details.
 * All rules are enforced server-side; this component only renders the
 * appropriate state and calls the action.
 */
export function MatchJoinButton({
  match,
  isAuthenticated,
  loginPath = "/",
  size = "default",
  className = "",
  waitlistLabel,
}) {
  const router = useRouter();
  const { can } = usePermission();
  const [isPending, startTransition] = useTransition();
  const [confirmLeave, setConfirmLeave] = useState(false);
  const { UI } = MATCH_CONFIG;
  const labels = UI.LABELS.CARD;

  const canEnroll = can(PARTICIPANT_CONFIG.PERMISSIONS.SELF_ENROLL);
  const canStaffConfirm = can(PARTICIPANT_CONFIG.PERMISSIONS.WRITE);
  const isClosed =
    match.isPast ||
    ["COMPLETED", "CANCELED", "IN_PROGRESS"].includes(match.status);

  if (isClosed) {
    const closedLabel =
      match.status === "CANCELED"
        ? "Cancelado"
        : match.status === "IN_PROGRESS"
          ? "En curso"
          : "Finalizado";
    return (
      <Button variant="secondary" size={size} disabled className={className}>
        <XCircle data-icon="inline-start" />
        {closedLabel}
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button asChild size={size} className={className}>
        <Link href={`/login?next=${encodeURIComponent(loginPath)}`}>
          <LogIn data-icon="inline-start" />
          {labels.LOGIN}
        </Link>
      </Button>
    );
  }

  if (!canEnroll) return null;

  if (match.isEnrolled) {
    const label =
      match.myStatus === "WAITLIST" ? labels.WAITLISTED : labels.JOINED;
    return (
      <>
        <div className={`flex flex-col gap-2 ${className}`}>
          <Button
            type="button"
            variant="outline"
            size={size}
            onClick={() => setConfirmLeave(true)}
            disabled={isPending || isClosed}
            className="w-full"
          >
            {isPending ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : match.myStatus === "WAITLIST" ? (
              <Clock data-icon="inline-start" />
            ) : (
              <CheckCircle2 data-icon="inline-start" />
            )}
            {label}
          </Button>
        </div>

        <AlertDialog open={confirmLeave} onOpenChange={setConfirmLeave}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{labels.CANCEL_TITLE}</AlertDialogTitle>
              <AlertDialogDescription>
                {labels.CANCEL_DESCRIPTION}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{labels.KEEP}</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={(event) => {
                  event.preventDefault();
                  startTransition(async () => {
                    const result = await leaveInMatchAction(match.id);
                    if (result.success) {
                      toast.success(result.message || labels.CANCEL_SUCCESS);
                      setConfirmLeave(false);
                      router.refresh();
                    } else {
                      toast.error(result.error || "No se pudo cancelar.");
                    }
                  });
                }}
              >
                {isPending ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : null}
                {labels.CONFIRM_CANCEL}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  const isFull = match.isFull || match.slotsLeft === 0;
  const label = isFull
    ? waitlistLabel || labels.JOIN_WAITLIST
    : labels.JOIN;

  return (
    <Button
      type="button"
      size={size}
      className={className}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = canStaffConfirm
            ? await payAndEnrollInMatchAction({
                matchId: match.id,
                method: "STAFF_BYPASS",
              })
            : await enrollInMatchAction(match.id);
          if (result.success) {
            toast.success(result.message || "Inscripción realizada.");
            router.refresh();
          } else {
            toast.error(result.error || "No se pudo inscribir.");
          }
        })
      }
    >
      {isPending ? (
        <Loader2 data-icon="inline-start" className="animate-spin" />
      ) : null}
      {label}
    </Button>
  );
}
