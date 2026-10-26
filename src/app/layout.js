import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/shared/providers/theme-provider";
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

/**
 * Root layout: technical providers only.
 * Session, permissions and SSE are resolved by each surface:
 * - `(app)` for the player shell.
 * - `(admin)` for the administrative panel.
 */
export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${geistMono.variable} ${inter.variable}`}
    >
      <head />
      <body className="antialiased">
        <DevToolsGuard />
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
