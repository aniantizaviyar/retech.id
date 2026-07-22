import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { GoogleTagManager } from "@next/third-parties/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://retech.id"),
  title: { default: "RETECH — PT. Retech Digital Solution", template: "%s | RETECH" },
  description: "Website & Mobile Development, Managed IT Services, Remote Support, dan Server Solutions untuk bisnis yang terus bergerak.",
  icons: { icon: "/retech-logo-transparent.png", shortcut: "/retech-logo-transparent.png", apple: "/retech-logo-transparent.png" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "RETECH",
    title: "RETECH — IT Solutions That Move Business Forward",
    description: "Build, manage, and support every layer of your IT with RETECH.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "RETECH Digital Solution" }],
  },
  twitter: { card: "summary_large_image", title: "RETECH — IT Solutions That Move Business Forward", images: ["/og.png"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <Analytics />
        <GoogleTagManager gtmId="GTM-MX3X63MF" />
      </body>
    </html>
  );
}
