import type { Metadata, Viewport } from "next";
import { Luckiest_Guy, Nunito } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

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
    statusBarStyle: "default",
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
  // The body's base tint (see globals.css) — the dominant colour across
  // nearly the whole page. A flat colour can't match the radial highlight
  // (top-left, lighter) and shadow (bottom-right, darker) it sits under, but
  // the plain base tint is a much closer match at both the top (status bar)
  // and bottom (home-indicator / nav-bar chrome in standalone PWA mode) than
  // a colour lightened for just the one corner would be.
  themeColor: "#e3d2b3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <Toaster
          position="top-center"
          toastOptions={{ className: "font-bold", duration: 2400 }}
        />
      </body>
    </html>
  );
}
