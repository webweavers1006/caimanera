import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/shared/providers/theme-provider";
import { DevToolsGuard } from "@/components/shared/DevToolsGuard";
import { PwaRegister } from "@/components/shared/PwaRegister";
import { SITE_CONFIG, PWA_CONFIG } from "@/features/shared";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4000"),
  title: {
    default: SITE_CONFIG.name,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/img/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: SITE_CONFIG.name,
    statusBarStyle: "black-translucent",
  },
  // Legacy iOS (before `mobile-web-app-capable` support) still needs the
  // apple-prefixed tag to launch in standalone mode.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

/** Theme color for the browser UI / standalone status bar (dark theme). */
export const viewport = {
  themeColor: PWA_CONFIG.themeColor,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        <PwaRegister />
      </body>
    </html>
  );
}
