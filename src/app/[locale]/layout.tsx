import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Toaster } from '@/components/ui/sonner';
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ramanujonomics — Wealth is Health",
    template: "%s | Ramanujonomics",
  },
  description: "India's premier career guidance platform for UPSC, SSC, Banking, Private Jobs, and Entrepreneurship.",
  keywords: ["career guidance", "UPSC", "SSC", "banking exam", "career counseling", "Telangana", "Andhra Pradesh"],
  authors: [{ name: "Ramanujonomics" }],
  creator: "Ramanujonomics",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ramanujonomics.com'),
  openGraph: {
    type: "website",
    siteName: "Ramanujonomics",
    locale: "en_IN",
    alternateLocale: ["te_IN"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ramanujonomics",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ramanujonomics",
  },
};

export const viewport = {
  themeColor: "#00296B",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'en' | 'te')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="has-bottom-nav font-body antialiased">
        <NextIntlClientProvider messages={messages}>
          {/* Announcement Banner placeholder — rendered from DB */}
          <Navbar />
          <main id="main-content">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <Toaster position="top-center" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
