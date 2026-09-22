import { Home, Trophy, UserCheck, Crosshair, Image as ImageIcon } from "lucide-react";
import { InfoItem } from "@/components/shared/InfoItem";
import { MATCH_CONFIG } from "../config/match.constants";

const { LABELS } = MATCH_CONFIG.UI;
const { DETAIL } = LABELS;

/**
 * Decorative football-field graphic (pure CSS).
 */
function CourtFieldGraphic() {
  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary to-[oklch(0.28_0.06_165)]">
      <div className="absolute inset-2 rounded-sm border-2 border-white/60" />
      <div className="absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-white/60" />
      <div className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/60" />
      <div className="absolute left-2 top-1/2 h-1/3 w-12 -translate-y-1/2 border-2 border-white/60" />
      <div className="absolute right-2 top-1/2 h-1/3 w-12 -translate-y-1/2 border-2 border-white/60" />
      <div className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
    </div>
  );
}

/**
 * Court tab: compact identity, photo gallery and key-value details.
 */
export function MatchCourtTab({ court }) {
  if (!court) {
    return (
      <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
        Sin cancha asignada.
      </div>
    );
  }

  const coords =
    court.latitude != null && court.longitude != null
      ? `${court.latitude.toFixed(4)}, ${court.longitude.toFixed(4)}`
      : null;

  const photos = court.photos || [];

  return (
    <div className="space-y-5">
      {/* Court identity */}
      <div className="flex items-center gap-4">
        <div className="w-20 shrink-0 sm:w-24">
          <CourtFieldGraphic />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold leading-tight">{court.name}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground truncate">
            {court.sport}
            {court.address ? ` · ${court.address}` : ""}
          </p>
        </div>
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            {DETAIL.SECTIONS.PHOTOS}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-xl border bg-muted aspect-[4/3]">
                <img
                  src={photo.url}
                  alt={court.name}
                  className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="rounded-xl border bg-card p-5">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <InfoItem icon={Trophy} label={DETAIL.FIELDS.COURT_SPORT} value={court.sport} />
          <InfoItem icon={UserCheck} label={DETAIL.FIELDS.COURT_MANAGER} value={court.managerName} />
          <InfoItem icon={Crosshair} label={DETAIL.FIELDS.COURT_COORDS} value={coords} />
          <InfoItem icon={Home} label={DETAIL.FIELDS.COURT_ADDRESS} value={court.address} />
        </div>

        {court.description && (
          <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">{court.description}</p>
        )}
      </div>
    </div>
  );
}
