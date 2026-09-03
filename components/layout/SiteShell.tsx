import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingContactMenu from "@/components/layout/FloatingContactMenu";
import BrochureDownloadProvider from "@/components/brochure/BrochureDownloadProvider";
import TimedDemoModal from "@/components/contact/TimedDemoModal";

export default function SiteShell({ children }: { children: React.ReactNode }) {
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
