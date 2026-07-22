import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { GoogleTagManager } from "@next/third-parties/google";
import { AnalyticsEvents } from "@/components/AnalyticsEvents";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://retech.id"),
  title: { default: "RETECH — PT. Retech Digital Solution", template: "%s | RETECH" },
  description: "Website & Mobile Development, Managed IT Services, Remote Support, dan Server Solutions untuk bisnis yang terus bergerak.",
  applicationName: "RETECH",
  authors: [{ name: "PT. Retech Digital Solution", url: "https://retech.id" }],
  creator: "PT. Retech Digital Solution",
  publisher: "PT. Retech Digital Solution",
  keywords: ["IT Solution Indonesia", "Website Development", "Mobile App Development", "Managed IT Services", "Server Maintenance", "Remote IT Support"],
  alternates: { canonical: "/" },
  icons: { icon: "/retech-logo-transparent.png", shortcut: "/retech-logo-transparent.png", apple: "/retech-logo-transparent.png" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://retech.id/#organization",
  name: "PT. Retech Digital Solution",
  alternateName: "RETECH",
  url: "https://retech.id",
  logo: "https://retech.id/retech-logo-transparent.png",
  image: "https://retech.id/og.png",
  email: "sales@retech.id",
  description: "Penyedia website dan mobile development, managed IT services, remote support, serta solusi server untuk bisnis.",
  areaServed: { "@type": "Country", name: "Indonesia" },
  knowsAbout: ["Website Development", "Mobile Application Development", "Managed IT Services", "Server Monitoring", "Remote IT Support"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://retech.id/#website",
  url: "https://retech.id",
  name: "RETECH",
  alternateName: "PT. Retech Digital Solution",
  inLanguage: "id-ID",
  publisher: { "@id": "https://retech.id/#organization" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }} />
        {children}
        <AnalyticsEvents />
        <Analytics />
        <GoogleTagManager gtmId="GTM-MX3X63MF" />
      </body>
    </html>
  );
}
