import type { Metadata, Viewport } from "next";
import { Luckiest_Guy, Nunito } from "next/font/google";
import "./globals.css";

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
};

export const viewport: Viewport = {
  // Matches the average colour along the very top of the page, where the body's
  // base tint (#e3d2b3) is lightened by the radial highlight — so the OS status
  // bar blends into the background instead of reading a shade darker.
  themeColor: "#e6d7bb",
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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
