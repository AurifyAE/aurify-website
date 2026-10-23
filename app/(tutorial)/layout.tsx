import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";

/**
 * Root layout for the client tutorial, login and admin pages. Kept apart from
 * the site layout so no analytics or tracking scripts ever load here.
 */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Client Tutorial", template: "%s - Aurify" },
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  themeColor: "#203366",
  width: "device-width",
  initialScale: 1,
};

export default function TutorialRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen bg-navy text-white antialiased">{children}</body>
    </html>
  );
}
