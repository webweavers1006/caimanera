import { ShieldAlert } from "lucide-react";
import { SHARED_CONFIG } from "@/features/shared";

const { ACCESS_DENIED } = SHARED_CONFIG.UI.LABELS;

export function AccessDenied({ 
  title = ACCESS_DENIED.TITLE, 
  message = ACCESS_DENIED.DESCRIPTION 
}) {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <ShieldAlert className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-destructive">{title}</h2>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
