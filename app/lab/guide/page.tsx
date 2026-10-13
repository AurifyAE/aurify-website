import type { Metadata } from "next";
import LabViewer from "@/components/guide/LabViewer";

// Internal review page for the guide laptop; removed in Task 14.
export const metadata: Metadata = {
  title: "Guide lab",
  robots: { index: false, follow: false },
};

export default function GuideLabPage() {
  return <LabViewer />;
}
