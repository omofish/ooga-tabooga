import type { Metadata, Viewport } from "next";
import { Luckiest_Guy, Nunito } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import Analytics from "@/components/Analytics";

const displayFont = Luckiest_Guy({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Ooga Tabooga",
  description:
    "A mobile party game — grunt one-syllable clues, guess the words, bonk the club. Ug good!",
  applicationName: "Ooga Tabooga",
  manifest: "manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Ooga Tabooga",
    // "black-translucent" makes the status bar transparent so page content
    // (viewportFit: "cover", below) draws underneath it instead of leaving a
    // separate opaque native strip that doesn't match the app's own colours.
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  // iOS Safari itself ignores this meta tag — it derives chrome colour from
  // actual rendered CSS instead (see docs/architecture.md), so this line
  // does nothing there. But plenty of *other* mobile browsers/in-app
  // WebViews (Telegram's, X's, Discord's own in-app browser, etc.) still
  // read theme-color directly and, with no value here, were falling back to
  // an arbitrary default — observed as a stray green top bar in Telegram's
  // in-app browser. Set to match TopBar's dark-ink strip (the first thing a
  // cold load shows) so those browsers get a real colour instead of guessing.
  themeColor: "#3a2a1b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Extend the page under the notch/status bar and home indicator instead of
  // leaving those areas as separate native chrome — see the paired
  // `env(safe-area-inset-*)` padding at every edge-anchored element (TopBar,
  // Gameplay's header/footer, the bottom action stacks, etc).
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <div className="rotate-lock">
          <div className="text-6xl">🔄</div>
          <h2 className="font-display text-2xl text-ink">Turn it back!</h2>
          <p className="text-sm font-bold text-ink-soft">
            Ooga Tabooga only ugs in portrait mode.
          </p>
        </div>
        <ServiceWorkerRegister />
        <Analytics />
        <Toaster
          position="top-center"
          toastOptions={{ className: "font-bold", duration: 2400 }}
        />
      </body>
    </html>
  );
}
