import { getSession } from '@/features/auth/lib/auth'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar/AppSidebar"
import { MobileBottomNav } from "@/components/app-sidebar/MobileBottomNav"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NotificationBell } from "@/features/notifications/components/NotificationBell"
import { SITE_CONFIG } from "@/features/shared"

export default async function DashboardLayout({ children }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <SidebarProvider>
      <TooltipProvider>
        <AppSidebar user={session} />
        <SidebarInset className="overflow-x-hidden">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur">
            <div className="flex items-center gap-2 px-4 flex-1">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 hidden h-4 md:block" />
              <span className="text-sm font-semibold md:hidden">{SITE_CONFIG.name}</span>
            </div>
            <div className="flex items-center gap-2 px-4">
              <NotificationBell />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-4 pb-24 min-w-0 md:pb-4">
            {children}
          </div>
        </SidebarInset>
        <MobileBottomNav />
      </TooltipProvider>
    </SidebarProvider>
  )
}
