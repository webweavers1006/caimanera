"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SidebarNav } from "./SidebarNav"
import { SidebarUser } from "./SidebarUser"
import { SITE_CONFIG } from "@/features/shared"

const SIDEBAR_LABELS = {
  TITLE: SITE_CONFIG.name,
  SUBTITLE: SITE_CONFIG.tagline,
};

export function AppSidebar({ user, ...props }) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex gap-2 py-2 text-sidebar-accent-foreground ">
          <img
            src={SITE_CONFIG.logo}
            alt={SITE_CONFIG.name}
            className="size-8 shrink-0 rounded-lg object-contain"
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{SIDEBAR_LABELS.TITLE}</span>
            <span className="truncate text-xs">{SIDEBAR_LABELS.SUBTITLE}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
