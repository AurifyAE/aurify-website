import { notFound } from "next/navigation";
import IngotSandbox from "./IngotSandbox";

export const metadata = { robots: { index: false, follow: false } };

// Dev-only workbench for the ingot; deleted in Task 7.
export default function IngotDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <IngotSandbox />;
}
