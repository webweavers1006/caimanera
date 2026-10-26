import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/features/shared";

export default function VenueNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MapPinOff className="size-7" />
      </span>
      <h1 className="text-2xl font-bold tracking-tight">Cancha no encontrada</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Puede que ya no esté disponible o que el enlace haya cambiado.
      </p>
      <Button asChild className="mt-6">
        <Link href={ROUTES.PUBLIC.COURTS.path}>Ver otras canchas</Link>
      </Button>
    </div>
  );
}
