"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { MATCH_UI } from "@/features/shared/config/match-ui.constants";

const MatchesMapClient = dynamic(
  () => import("./MatchesMap").then((module) => module.MatchesMap),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        <Skeleton className="h-[520px] w-full rounded-3xl" />
        <p className="text-center text-xs text-muted-foreground">
          {MATCH_UI.MAP.LOADING}
        </p>
      </div>
    ),
  }
);

export function MatchesMapWrapper(props) {
  return <MatchesMapClient {...props} />;
}
