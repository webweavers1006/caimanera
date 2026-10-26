"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { DISCOVERY_CONFIG } from "../config/discovery.constants";

const DiscoveryMapClient = dynamic(
  () => import("./DiscoveryMap").then((module) => module.DiscoveryMap),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        <Skeleton className="h-[520px] w-full rounded-3xl" />
        <p className="text-center text-xs text-muted-foreground">
          {DISCOVERY_CONFIG.UI.MAP.LOADING}
        </p>
      </div>
    ),
  }
);

export function DiscoveryMapWrapper(props) {
  return <DiscoveryMapClient {...props} />;
}
