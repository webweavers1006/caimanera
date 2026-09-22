"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { usePermission } from "@/features/permissions/components/PermissionsProvider"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { SIDEBAR_CONFIG } from "@/features/shared";

const { LABELS } = SIDEBAR_CONFIG.UI;
const navItems = SIDEBAR_CONFIG.NAV.items;

/**
 * Pure function to check if an item should be visible based on user permissions.
 * @param {Object} item - Navigation item.
 * @param {Function} can - Permission checking function from hook.
 * @returns {boolean}
 */
function isAuthorized(item, can) {
  // If item explicitly requires a permission, check it.
  if (item.permission && !can(item.permission)) {
    return false
  }

  // If item has sub-items, it's only visible if at least one sub-item is authorized.
  if (item.items?.length > 0) {
    return item.items.some(sub => isAuthorized(sub, can))
  }

  return true
}

export function SidebarNav() {
  const { can } = usePermission()
  const pathname = usePathname()

  // Filter items based on permissions before rendering
  const authorizedItems = navItems
    .filter(item => isAuthorized(item, can))
    .map(item => {
      // If it has children, filter them as well
      if (item.items) {
        return {
          ...item,
          items: item.items.filter(sub => isAuthorized(sub, can))
        }
      }
      return item
    })

  if (authorizedItems.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{LABELS.GROUP_TITLE}</SidebarGroupLabel>
      <SidebarMenu>

        {authorizedItems.map((item) => {
          // Si no tiene items hijos, renderiza un link simple
          if (!item.items?.length) {
            const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} {...(isActive && { isActive })}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // Si tiene items hijos, renderiza el collapsible
          const hasActiveChild = item.items.some(sub => pathname === sub.url || pathname.startsWith(sub.url + "/"))
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={hasActiveChild}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} {...(hasActiveChild && { isActive: hasActiveChild })}>
                    {item.icon && <item.icon />}
                    <span className="min-w-0 truncate">{item.title}</span>
                    <ChevronRight className="ml-auto shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url + "/")
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild {...(isSubActive && { isActive: isSubActive })}>
                            <Link href={subItem.url}>
                              {subItem.icon && <subItem.icon />}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
