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
  // Deliberately no themeColor: Safari applies it to its whole chrome as one
  // value — both the top status-bar strip AND its own bottom toolbar — so a
  // color picked to match one edge always mismatches the other. Leaving it
  // unset gives Safari's own neutral light/dark-mode chrome at both edges
  // instead of a swatch that's only ever right on one side.
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
