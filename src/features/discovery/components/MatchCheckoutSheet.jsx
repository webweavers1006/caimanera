"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bitcoin,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Landmark,
  Loader2,
  MapPin,
  ShieldCheck,
  Smartphone,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import { cn } from "@/features/shared";
import { formatPrice, formatVes } from "@/features/shared/lib/format";
import { enrollInMatchAction, leaveInMatchAction } from "@/features/matches/actions/match.enroll.action";
import { payAndEnrollInMatchAction } from "@/features/payments/actions/match.payment.action";
import { PAYMENT_CONFIG, getPaymentMethod } from "@/features/payments/config/payment.constants";
import { DISCOVERY_CONFIG, getSportEmoji } from "../config/discovery.constants";
import { distanceInKm, formatDistance } from "../lib/geo";
import { useDiscoveryLocation } from "../hooks/use-discovery-location";

const METHOD_ICONS = {
  landmark: Landmark,
  smartphone: Smartphone,
  bitcoin: Bitcoin,
  "credit-card": CreditCard,
};

function Progress({ match }) {
  const filled =
    match.capacity > 0
      ? Math.min(100, (Number(match.confirmedCount || 0) / match.capacity) * 100)
      : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{match.slotsLeft ?? 0} cupos libres</span>
        <span>
          {match.confirmedCount || 0}/{match.capacity} confirmados
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", filled >= 100 ? "bg-amber-400" : "bg-primary")}
          style={{ width: `${filled}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Single checkout surface for the public experience:
 * preview → payment method → result. Uses a bottom drawer on mobile.
 */
export function MatchCheckoutSheet({
  match,
  open,
  onOpenChange,
  isAuthenticated = false,
  subscription = null,
  canStaffConfirm = false,
  initialStep = "preview",
  nextPath = "/",
  detailHref = null,
}) {
  const router = useRouter();
  const { location } = useDiscoveryLocation();
  const [step, setStep] = useState(initialStep);
  const [method, setMethod] = useState("BDT");
  const [reference, setReference] = useState("");
  const [result, setResult] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setStep(initialStep);
    setMethod("BDT");
    setReference("");
    setResult(null);
    setConfirmCancel(false);
  }, [open, match?.id, initialStep]);

  const distance = useMemo(() => {
    if (!location || !match?.court) return null;
    const km = distanceInKm(location, match.court);
    return km == null ? null : formatDistance(km);
  }, [location, match?.court]);

  if (!match) return null;

  const price = Number(match.pricePerSlot || 0);
  const vesTotal =
    PAYMENT_CONFIG.VES_RATE > 0 ? price * PAYMENT_CONFIG.VES_RATE : null;
  const hasPass =
    Number(subscription?.remainingMatches || 0) > 0 && Boolean(match.allowSubscription);
  const isClosed =
    match.isPast || ["COMPLETED", "CANCELED", "IN_PROGRESS"].includes(match.status);
  const isFull = Boolean(match.isFull) || Number(match.slotsLeft || 0) <= 0;
  const isEnrolled = Boolean(match.isEnrolled);
  const selectedMethod = getPaymentMethod(method);
  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;

  const handleResponse = (response) => {
    if (!response?.success) {
      toast.error(response?.error || "No se pudo completar la participación.");
      return;
    }
    setResult(response);
    setStep("success");
    router.refresh();
  };

  const handleWaitlist = () => {
    startTransition(async () => {
      handleResponse(await enrollInMatchAction(match.id));
    });
  };

  const handleStaff = () => {
    startTransition(async () => {
      handleResponse(
        await payAndEnrollInMatchAction({ matchId: match.id, method: "STAFF_BYPASS" })
      );
    });
  };

  const handlePass = () => {
    startTransition(async () => {
      handleResponse(
        await payAndEnrollInMatchAction({
          matchId: match.id,
          method: "SUBSCRIPTION_CREDIT",
        })
      );
    });
  };

  const handlePay = () => {
    startTransition(async () => {
      handleResponse(
        await payAndEnrollInMatchAction({
          matchId: match.id,
          method,
          reference: reference.trim() || undefined,
        })
      );
    });
  };

  const handleLeave = () => {
    startTransition(async () => {
      const response = await leaveInMatchAction(match.id);
      if (!response?.success) {
        toast.error(response?.error || "No se pudo cancelar.");
        return;
      }
      toast.success(response.message || "Inscripción cancelada.");
      setConfirmCancel(false);
      onOpenChange(false);
      router.refresh();
    });
  };

  const needsReference = method === "MOBILE_PAYMENT" || method === "BINANCE";
  const paymentPending = result?.paymentStatus === "PENDING";
  const waitlisted = result?.paymentStatus === "WAITLIST" || result?.status === "WAITLIST";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[94vh]">
        <div className="mx-auto flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden">
          <DrawerTitle className="sr-only">Participar en {match.title}</DrawerTitle>
          <DrawerDescription className="sr-only">
            Revisa el partido, confirma tu cupo y elige un método de pago.
          </DrawerDescription>

          {step !== "success" && (
            <div className="flex items-center gap-2 pb-2">
              {step === "payment" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setStep("preview")}
                  aria-label="Volver al detalle"
                  className="shrink-0 rounded-full"
                >
                  <ArrowLeft />
                </Button>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-bold tracking-tight">
                  {step === "payment" ? PAYMENT_CONFIG.UI.TITLE : "Detalle del partido"}
                </h2>
                <p className="truncate text-xs text-muted-foreground">
                  {step === "payment"
                    ? PAYMENT_CONFIG.UI.DESCRIPTION
                    : match.court?.name || "Cancha por confirmar"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                aria-label="Cerrar"
                className="shrink-0 rounded-full"
              >
                <X />
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pr-0.5">
            {step === "preview" && (
              <div className="space-y-4">
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/25 via-primary/5 to-transparent">
                  {match.coverPhoto || match.court?.coverPhoto ? (
                    <img
                      src={match.coverPhoto || match.court?.coverPhoto}
                      alt={match.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-6xl">
                      {getSportEmoji(match.sport)}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-x-3 top-3 flex flex-wrap gap-1.5">
                    <Badge className="bg-black/55 text-white backdrop-blur">
                      {getSportEmoji(match.sport)} {match.sport}
                    </Badge>
                    {isEnrolled && (
                      <Badge className="bg-primary text-primary-foreground">
                        {match.myStatus === "WAITLIST" ? "En espera" : "Confirmado"}
                      </Badge>
                    )}
                    {!isEnrolled && isFull && (
                      <Badge className="bg-amber-400/90 text-amber-950">Lleno</Badge>
                    )}
                  </div>
                  <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-base font-bold text-white">
                        {match.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-white/75">
                        {match.court?.name}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(price)}
                      </p>
                      <p className="text-[10px] text-white/70">por jugador</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-border/70 bg-card p-3">
                    <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      <CalendarDays className="size-3" /> Fecha
                    </p>
                    <p className="mt-1 text-xs font-semibold">{match.dateLabel || "—"}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card p-3">
                    <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      <Clock3 className="size-3" /> Hora
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {match.timeLabel || "—"} · {match.durationMins} min
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card p-3">
                    <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      <MapPin className="size-3" /> Distancia
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold">
                      {distance || "Elige tu ubicación"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card p-3">
                    <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      <Users className="size-3" /> Cupos
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {match.slotsLeft ?? 0} de {match.capacity}
                    </p>
                  </div>
                </div>

                <Progress match={match} />

                {match.court?.address && (
                  <p className="flex items-start gap-1.5 rounded-2xl bg-muted/50 p-3 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" />
                    {match.court.address}
                  </p>
                )}

                {match.court?.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {match.court.description}
                  </p>
                )}

                {hasPass && (
                  <div className="flex items-start gap-2 rounded-2xl border border-primary/25 bg-primary/10 p-3 text-xs">
                    <Ticket className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      Tu pase <strong>{subscription.planName || "activo"}</strong> cubre este
                      partido. Te quedan {subscription.remainingMatches} créditos.
                    </span>
                  </div>
                )}

                {canStaffConfirm && !isEnrolled && (
                  <div className="flex items-start gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-xs">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                    <span>
                      Tu rol puede confirmar la participación sin pasar por la pasarela.
                    </span>
                  </div>
                )}
              </div>
            )}

            {step === "payment" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {PAYMENT_CONFIG.METHODS.map((option) => {
                    const Icon = METHOD_ICONS[option.icon] || CreditCard;
                    const active = method === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setMethod(option.value)}
                        aria-pressed={active}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-primary/60 bg-primary/10"
                            : "border-border/70 bg-card hover:border-primary/30"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-xl",
                            active ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
                          )}
                        >
                          <Icon className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold">
                              {option.label}
                            </span>
                            {option.recommended && (
                              <Badge className="bg-primary/15 text-[9px] text-primary">
                                Recomendado
                              </Badge>
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                            {option.description}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "size-4 shrink-0 rounded-full border-2",
                            active ? "border-primary bg-primary" : "border-muted-foreground/40"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>

                {needsReference && (
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {PAYMENT_CONFIG.UI.REFERENCE_LABEL}
                    </span>
                    <Input
                      value={reference}
                      onChange={(event) => setReference(event.target.value)}
                      placeholder={PAYMENT_CONFIG.UI.REFERENCE_PLACEHOLDER}
                      maxLength={120}
                      className="h-11 rounded-xl"
                    />
                    <span className="block text-[10px] text-muted-foreground">
                      {PAYMENT_CONFIG.UI.REFERENCE_HINT}
                    </span>
                  </label>
                )}

                {(method === "BDT" || method === "CARD") && (
                  <p className="rounded-2xl bg-muted/50 p-3 text-[11px] text-muted-foreground">
                    {method === "BDT"
                      ? PAYMENT_CONFIG.UI.BDT_NOTE
                      : PAYMENT_CONFIG.UI.CARD_NOTE}
                  </p>
                )}

                <div className="rounded-2xl border border-border/70 bg-card p-4">
                  <div className="flex items-end justify-between gap-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      {PAYMENT_CONFIG.UI.TOTAL}
                    </span>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{formatPrice(price)}</p>
                      {vesTotal != null && (
                        <p className="text-[11px] text-muted-foreground">
                          {formatVes(vesTotal)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <p className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {PAYMENT_CONFIG.UI.SECURE_NOTE}
                </p>
              </div>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center px-2 py-6 text-center">
                <span
                  className={cn(
                    "flex size-16 items-center justify-center rounded-full",
                    waitlisted ? "bg-amber-400/15 text-amber-300" : "bg-primary/15 text-primary"
                  )}
                >
                  <CheckCircle2 className="size-8" />
                </span>
                <h2 className="mt-4 text-xl font-bold tracking-tight">
                  {waitlisted
                    ? "Estás en lista de espera"
                    : paymentPending
                      ? PAYMENT_CONFIG.UI.PENDING_TITLE
                      : PAYMENT_CONFIG.UI.CONFIRMED_TITLE}
                </h2>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  {waitlisted
                    ? "Te avisaremos si se libera un cupo."
                    : paymentPending
                      ? PAYMENT_CONFIG.UI.PENDING_DESCRIPTION
                      : result?.usedPass
                        ? "Usaste un crédito de tu pase. Nos vemos en la cancha."
                        : PAYMENT_CONFIG.UI.CONFIRMED_DESCRIPTION}
                </p>

                <div className="mt-5 w-full space-y-2 rounded-2xl border border-border/70 bg-card p-4 text-left">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground">Partido</span>
                    <span className="truncate font-semibold">{match.title}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground">
                      {waitlisted ? "Cobro" : "Total"}
                    </span>
                    <span className="font-semibold">
                      {waitlisted
                        ? "Al confirmar cupo"
                        : result?.usedPass
                          ? "Cubierto por tu pase"
                          : formatPrice(price)}
                    </span>
                  </div>
                  {result?.method && (
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">Método</span>
                      <span className="font-semibold">
                        {getPaymentMethod(result.method)?.label || result.method}
                      </span>
                    </div>
                  )}
                  {result?.reference && (
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">Referencia</span>
                      <span className="max-w-[60%] truncate font-mono text-[11px]">
                        {result.reference}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground">Estado</span>
                    <Badge
                      className={cn(
                        "text-[10px]",
                        waitlisted
                          ? "bg-amber-400/15 text-amber-300"
                          : paymentPending
                            ? "bg-amber-400/15 text-amber-300"
                            : "bg-primary/15 text-primary"
                      )}
                    >
                      {waitlisted
                        ? "Lista de espera"
                        : paymentPending
                          ? "Pago pendiente"
                          : "Confirmado"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-border/70 pb-[calc(0.25rem+env(safe-area-inset-bottom))] pt-3">
            {step === "preview" && (
              <>
                {detailHref && (
                  <Button
                    asChild
                    variant="secondary"
                    className="mb-2 h-11 w-full rounded-full"
                  >
                    <Link href={detailHref} onClick={() => onOpenChange(false)}>
                      {DISCOVERY_CONFIG.UI.CARD.VIEW_FULL}
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                )}

                {!isAuthenticated ? (
                  <Button asChild className="h-12 w-full rounded-full font-semibold">
                    <Link href={loginHref}>Iniciar sesión para participar</Link>
                  </Button>
                ) : isClosed ? (
                  <Button disabled className="h-12 w-full rounded-full">
                    Este partido ya no acepta inscripciones
                  </Button>
                ) : isEnrolled ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-12 w-full rounded-full"
                    onClick={() => setConfirmCancel(true)}
                  >
                    {match.myStatus === "WAITLIST"
                      ? "Salir de la lista de espera"
                      : "Cancelar mi inscripción"}
                  </Button>
                ) : isFull ? (
                  <Button
                    type="button"
                    className="h-12 w-full rounded-full font-semibold"
                    disabled={isPending}
                    onClick={handleWaitlist}
                  >
                    {isPending && <Loader2 className="animate-spin" />}
                    Unirme a la lista de espera
                  </Button>
                ) : canStaffConfirm ? (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      className="h-12 w-full rounded-full font-semibold"
                      disabled={isPending}
                      onClick={handleStaff}
                    >
                      {isPending && <Loader2 className="animate-spin" />}
                      Confirmar como staff
                    </Button>
                    {hasPass && (
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-11 w-full rounded-full"
                        disabled={isPending}
                        onClick={handlePass}
                      >
                        Usar mi pase ({subscription.remainingMatches})
                      </Button>
                    )}
                  </div>
                ) : hasPass ? (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      className="h-12 w-full rounded-full font-semibold"
                      disabled={isPending}
                      onClick={handlePass}
                    >
                      {isPending && <Loader2 className="animate-spin" />}
                      Usar mi pase ({subscription.remainingMatches})
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-11 w-full rounded-full"
                      onClick={() => setStep("payment")}
                    >
                      Pagar con otro método
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    className="h-12 w-full rounded-full font-semibold"
                    onClick={() => setStep("payment")}
                  >
                    Continuar al pago
                  </Button>
                )}
              </>
            )}

            {step === "payment" && (
              <div className="space-y-2">
                <Button
                  type="button"
                  className="h-12 w-full rounded-full font-semibold"
                  disabled={isPending}
                  onClick={handlePay}
                >
                  {isPending && <Loader2 className="animate-spin" />}
                  {isPending
                    ? PAYMENT_CONFIG.UI.PROCESSING
                    : `Pagar ${formatPrice(price)}`}
                </Button>
                <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                  <ShieldCheck className="size-3 text-primary" />
                  Pago protegido · {selectedMethod?.label}
                </p>
              </div>
            )}

            {step === "success" && (
              <Button
                type="button"
                className="h-12 w-full rounded-full font-semibold"
                onClick={() => onOpenChange(false)}
              >
                Listo
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar tu inscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu cupo volverá a estar disponible y, si hay alguien en lista de espera,
              subirá automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mantener inscripción</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleLeave}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  );
}
