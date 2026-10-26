import { getSession } from '@/features/auth/lib/auth'
import { validateSessionUser } from '@/features/auth/services/auth.read.service'
import { getUserPermissions } from '@/features/permissions/services/permission.authorization.service'
import { PermissionsProvider } from '@/features/permissions/components/PermissionsProvider'
import { SseProvider } from '@/components/shared/providers/sse-provider'
import { isManagementRole } from '@/features/auth/config/auth.constants'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar/AppSidebar"
import { MobileBottomNav } from "@/components/app-sidebar/MobileBottomNav"
import { HeaderBreadcrumb } from "@/components/app-sidebar/HeaderBreadcrumb"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NotificationBell } from "@/features/notifications/components/NotificationBell"
import { SITE_CONFIG } from "@/features/shared"

export default async function DashboardLayout({ children }) {
  const jwtSession = await getSession()
  if (!jwtSession) redirect('/login')

  const session = await validateSessionUser(jwtSession)
  if (!session) redirect('/login')

  // Players never enter the administrative shell. Their account lives at /cuenta.
  if (!isManagementRole(session.role)) redirect('/')

  const permissions = await getUserPermissions(session.role)
  const canReadNotifications = permissions.includes('notifications:read')

  return (
    <PermissionsProvider permissions={permissions}>
      <SseProvider enabled={canReadNotifications}>
        <SidebarProvider>
          <TooltipProvider>
            <AppSidebar user={session} />
            <SidebarInset className="overflow-x-hidden">
              <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur">
                <div className="flex items-center gap-2 px-4 flex-1 min-w-0">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 hidden h-4 md:block" />
                  <span className="text-sm font-semibold md:hidden">{SITE_CONFIG.name}</span>
                  <div className="hidden min-w-0 md:block">
                    <HeaderBreadcrumb />
                  </div>
                </div>
                {canReadNotifications && (
                  <div className="flex items-center gap-2 px-4">
                    <NotificationBell />
                  </div>
                )}
              </header>
              <div className="flex flex-1 flex-col gap-4 p-4 pt-4 pb-24 min-w-0 md:pb-4">
                {children}
              </div>
            </SidebarInset>
            <MobileBottomNav />
          </TooltipProvider>
        </SidebarProvider>
      </SseProvider>
    </PermissionsProvider>
  )
}
