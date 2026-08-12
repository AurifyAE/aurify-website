"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingContactMenu from "@/components/layout/FloatingContactMenu";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalonePage = pathname === "/dbrg-webinar";

  if (isStandalonePage) {
    return <main id="content">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main id="content">{children}</main>
      <Footer />
      <FloatingContactMenu />
    </>
  );
}
