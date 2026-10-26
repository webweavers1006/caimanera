"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bitcoin,
  CreditCard,
  Landmark,
  Loader2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/features/shared";
import { formatPrice, formatVes } from "@/features/shared/lib/format";
import {
  PAYMENT_CONFIG,
} from "@/features/payments/config/payment.constants";
import { purchaseSubscriptionAction } from "../../actions/player-subscription.purchase.action";
import { SUBSCRIPTION_CONFIG } from "../../config/subscription.constants";

const METHOD_ICONS = {
  landmark: Landmark,
  smartphone: Smartphone,
  bitcoin: Bitcoin,
  "credit-card": CreditCard,
};

const { PLAYER } = SUBSCRIPTION_CONFIG.UI;

export function PassPurchaseDialog({ plan, open, onOpenChange }) {
  const router = useRouter();
  const [method, setMethod] = useState("BDT");
  const [reference, setReference] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!plan) return null;

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setMethod("BDT");
      setReference("");
    }
    onOpenChange(nextOpen);
  };

  const vesTotal =
    PAYMENT_CONFIG.VES_RATE > 0
      ? Number(plan.price) * PAYMENT_CONFIG.VES_RATE
      : null;

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await purchaseSubscriptionAction({
        planId: plan.id,
        method,
        reference: reference.trim() || undefined,
      });

      if (!result?.success) {
        toast.error(result?.error || PLAYER.PURCHASE.ERROR);
        return;
      }

      toast.success(result.message || PLAYER.PURCHASE.SUCCESS);
      handleOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{PLAYER.PURCHASE.TITLE}</DialogTitle>
          <DialogDescription>
            {PLAYER.PURCHASE.DESCRIPTION(plan.name)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{plan.name}</p>
                <p className="text-xs text-muted-foreground">
                  {PLAYER.INCLUDES(plan.matchesIncluded)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatPrice(plan.price)}</p>
                {vesTotal ? (
                  <p className="text-[11px] text-muted-foreground">
                    {formatVes(vesTotal)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">{PLAYER.PURCHASE.METHOD}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {PAYMENT_CONFIG.METHODS.map((option) => {
                const Icon = METHOD_ICONS[option.icon] || CreditCard;
                const selected = method === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMethod(option.value)}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected
                        ? "border-primary/60 bg-primary/10"
                        : "bg-background/60 hover:border-primary/30"
                    )}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{option.label}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pass-reference" className="text-sm font-medium">
              {PLAYER.PURCHASE.REFERENCE}
            </label>
            <Input
              id="pass-reference"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder={PLAYER.PURCHASE.REFERENCE_PLACEHOLDER}
              maxLength={120}
            />
            <p className="text-[11px] text-muted-foreground">
              {PLAYER.PURCHASE.REFERENCE_HINT}
            </p>
          </div>

          <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            {PLAYER.PURCHASE.SECURE_NOTE}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isPending ? PLAYER.PURCHASE.PROCESSING : PLAYER.PURCHASE.SUBMIT}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
