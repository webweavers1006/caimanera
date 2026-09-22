"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sendCredentialsAction } from "../actions/send-credentials.action";
import { USER_CONFIG } from "../config/user.constants";

const { CREDENTIALS } = USER_CONFIG.UI.LABELS;

export function SendCredentialsDialog({ open, onOpenChange, userIds }) {
  const [isSending, setIsSending] = useState(false);

  const isAll = userIds === null;
  const isSingle = Array.isArray(userIds) && userIds.length === 1;
  const count = Array.isArray(userIds) ? userIds.length : 0;

  const description = isAll
    ? CREDENTIALS.DIALOG_DESCRIPTION_ALL
    : isSingle
      ? CREDENTIALS.DIALOG_DESCRIPTION_SINGLE
      : CREDENTIALS.DIALOG_DESCRIPTION_SELECTED(count);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const result = await sendCredentialsAction({
        userIds: userIds || undefined,
      });

      if (result.success) {
        toast.success(CREDENTIALS.SUCCESS_TITLE, {
          description: result.summary || CREDENTIALS.SUCCESS_DESCRIPTION,
        });
        onOpenChange(false);
      } else if (result.results?.length > 0) {
        const succeeded = result.results.filter((r) => r.success).length;
        const failed = result.results.filter((r) => !r.success).length;
        if (succeeded > 0 && failed > 0) {
          toast.warning(CREDENTIALS.SUCCESS_TITLE, {
            description: `${succeeded} ${CREDENTIALS.RESULT_SENT}, ${failed} ${CREDENTIALS.RESULT_FAILED}.`,
          });
        } else {
          toast.error(CREDENTIALS.ERROR_TITLE, {
            description: result.error || CREDENTIALS.ERROR_DESCRIPTION,
          });
        }
        onOpenChange(false);
      } else {
        toast.error(CREDENTIALS.ERROR_TITLE, {
          description: result.error || CREDENTIALS.ERROR_DESCRIPTION,
        });
      }
    } catch (error) {
      toast.error(CREDENTIALS.ERROR_TITLE, {
        description: CREDENTIALS.ERROR_DESCRIPTION,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{CREDENTIALS.DIALOG_TITLE}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            {CREDENTIALS.CANCEL_BUTTON}
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? CREDENTIALS.SENDING : CREDENTIALS.CONFIRM_BUTTON}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
