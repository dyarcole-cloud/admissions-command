import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://admissions-command.vercel.app"),
  title: {
    default: "Admissions Command — Northbound Treatment Network",
    template: "%s · Admissions Command",
  },
  description:
    "Live-call cockpit for behavioral health admissions teams. Insurance intel, clinical assessment, payor playbook, AI coaching — built for the way intake actually runs.",
  applicationName: "Admissions Command",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Admissions Cmd",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Admissions Command",
    description:
      "Live-call cockpit for behavioral health admissions. Built on the Northbound Treatment Network platform.",
    type: "website",
    siteName: "Admissions Command",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1a" },
    { media: "(prefers-color-scheme: light)", color: "#0a0e1a" },
  ],
  width: "device-width",
  initialScale: 1,
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
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
