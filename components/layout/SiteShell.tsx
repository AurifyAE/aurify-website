"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingContactMenu from "@/components/layout/FloatingContactMenu";
import BrochureDownloadProvider from "@/components/brochure/BrochureDownloadProvider";
import TimedDemoModal from "@/components/contact/TimedDemoModal";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalonePage = pathname === "/webinars/dbrg-webinar";

  if (isStandalonePage) {
    return <main id="content">{children}</main>;
  }

  return (
    <BrochureDownloadProvider>
      <Navbar />
      <main id="content">{children}</main>
      <Footer />
      <FloatingContactMenu />
      <TimedDemoModal />
    </BrochureDownloadProvider>
  );
}
