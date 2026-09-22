import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/features/auth/lib/auth";
import { getUserPermissions } from "@/features/permissions/services/permission.authorization.service";
import { PermissionsProvider } from "@/features/permissions/components/PermissionsProvider";
import { ThemeProvider } from "@/components/shared/providers/theme-provider";
import { SseProvider } from "@/components/shared/providers/sse-provider";
import { DevToolsGuard } from "@/components/shared/DevToolsGuard";
import { SITE_CONFIG } from "@/features/shared";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"),
  title: {
    default: SITE_CONFIG.name,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  icons: {
    icon: "/icon.svg",
    apple: "/img/apple-touch-icon.png",
  },
  appleWebApp: {
    title: SITE_CONFIG.name,
    statusBarStyle: "default",
  },
};

export default async function RootLayout({ children }) {
  const session = await getSession();
  const permissions = session ? await getUserPermissions(session.role) : [];

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable}`}
    >
      <head />
      <body className="antialiased">
        <DevToolsGuard />
        <ThemeProvider>
          <SseProvider>
            <PermissionsProvider permissions={permissions}>
              {children}
            </PermissionsProvider>
          </SseProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
