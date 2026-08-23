import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { GoogleTagManager } from "@next/third-parties/google";
import { AnalyticsEvents } from "@/components/AnalyticsEvents";
import { companyContact } from "@/lib/company";
import { localeConfig } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { headers } from "next/headers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const en = locale === "en";
  return {
    metadataBase: new URL("https://retech.id"),
    title: { default: "RETECH — PT. Retech Digital Solution", template: "%s | RETECH" },
    description: en
      ? "Website and mobile development, Managed IT Services, remote support, and server solutions for growing businesses."
      : "Website & Mobile Development, Managed IT Services, Remote Support, dan Server Solutions untuk bisnis yang terus bergerak.",
    applicationName: "RETECH",
    authors: [{ name: "PT. Retech Digital Solution", url: "https://retech.id" }],
    creator: "PT. Retech Digital Solution",
    publisher: "PT. Retech Digital Solution",
    keywords: ["IT Solution Indonesia", "Website Development", "Mobile App Development", "Managed IT Services", "Server Maintenance", "Remote IT Support"],
    icons: { icon: "/retech-logo-transparent.png", shortcut: "/retech-logo-transparent.png", apple: "/retech-logo-transparent.png" },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    openGraph: {
      type: "website",
      locale: en ? "en_US" : "id_ID",
      siteName: "RETECH",
      title: en ? "RETECH — IT Solutions That Move Business Forward" : "RETECH — Solusi IT untuk Bisnis yang Terus Bergerak",
      description: en ? "Build, manage, and support every layer of your IT with RETECH." : "Bangun, kelola, dan dukung setiap lapisan IT bisnis Anda bersama RETECH.",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "RETECH Digital Solution" }],
    },
    twitter: { card: "summary_large_image", title: en ? "RETECH — IT Solutions That Move Business Forward" : "RETECH — Solusi IT untuk Bisnis yang Terus Bergerak", images: ["/og.png"] },
  };
}

function getOrganizationSchema(english: boolean) {
  return {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://retech.id/#organization",
  name: "PT. Retech Digital Solution",
  alternateName: "RETECH",
  url: "https://retech.id",
  logo: "https://retech.id/retech-logo-transparent.png",
  image: "https://retech.id/og.png",
  email: companyContact.email,
  telephone: companyContact.whatsappE164,
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "EasyOffice Bekasi, Emerald Commercial Bekasi, UF-10, Jl. Boulevard Selatan, RT 004 / RW 011, Margamulya, Bekasi Utara",
    addressLocality: "Kota Bekasi",
    addressRegion: "Jawa Barat",
    postalCode: "17142",
    addressCountry: "ID",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    telephone: companyContact.whatsappE164,
    email: companyContact.email,
    url: english ? companyContact.whatsappUrlEn : companyContact.whatsappUrl,
    availableLanguage: ["Indonesian", "English"],
  },
  description: english
    ? "Provider of website and mobile development, managed IT services, remote support, and server solutions for businesses."
    : "Penyedia website dan mobile development, managed IT services, remote support, serta solusi server untuk bisnis.",
  areaServed: { "@type": "Country", name: "Indonesia" },
  knowsAbout: ["Website Development", "Mobile Application Development", "Managed IT Services", "Server Monitoring", "Remote IT Support"],
  };
}

function getWebsiteSchema(english: boolean) {
  return {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://retech.id/#website",
  url: "https://retech.id",
  name: "RETECH",
  alternateName: "PT. Retech Digital Solution",
  inLanguage: english ? "en-US" : "id-ID",
  publisher: { "@id": "https://retech.id/#organization" },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const isAdmin = requestHeaders.get("x-retech-admin") === "true";
  const locale = await getLocale();
  const english = locale === "en";
  const organizationSchema = getOrganizationSchema(english);
  const websiteSchema = getWebsiteSchema(english);
  return (
    <html lang={localeConfig[locale].htmlLang}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {!isAdmin && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }} />}
        {!isAdmin && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }} />}
        {children}
        {!isAdmin && <AnalyticsEvents />}
        {!isAdmin && <Analytics />}
        {!isAdmin && <GoogleTagManager gtmId="GTM-MX3X63MF" />}
      </body>
    </html>
  );
}
