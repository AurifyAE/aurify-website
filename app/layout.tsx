import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import IconGradientDefs from "@/components/icons/IconGradientDefs";
import { site } from "@/lib/content/site";

/**
 * Brand spec is Product Sans; Poppins is the licensed equivalent the logo
 * uses. Everything reads from --font-sans, so a licensed swap is one line.
 */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "precious metals software",
    "bullion trading platform",
    "refinery management system",
    "risk management system",
    "gold trading technology",
    "Aurify Technology",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#203366",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <IconGradientDefs />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-navy focus:px-5 focus:py-2.5 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        <AppProviders>
          <Navbar />
          <main id="content">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
