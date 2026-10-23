import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TutorialPlayer from "@/components/tutorial/TutorialPlayer";
import { clientInfo } from "@/lib/tutorial/cookies";
import { logActivity } from "@/lib/tutorial/log";
import { signVideoUrl } from "@/lib/tutorial/r2";
import { formatGulf } from "@/lib/tutorial/rules";
import { getViewer } from "@/lib/tutorial/viewer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tutorial" };

export default async function TutorialPage() {
  const result = await getViewer();
  if (!result.ok) redirect(result.reason === "expired" ? "/login?expired=1" : "/login");
  const { viewer } = result;

  const src = await signVideoUrl(viewer.accessExpiresAt);
  await logActivity({ email: viewer.email, action: "video opened", ...clientInfo(await headers()) });

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium sm:text-2xl">Client tutorial</h1>
          <p className="text-sm text-white/60">
            Access until {formatGulf(viewer.accessExpiresAt)} (Gulf time)
          </p>
        </div>
        <form action="/api/tutorial/logout" method="post">
          <button
            type="submit"
            className="rounded-full border border-white/25 px-5 py-2 text-sm hover:border-white/60"
          >
            Sign out
          </button>
        </form>
      </header>
      <TutorialPlayer src={src} email={viewer.email} />
      <p className="text-xs text-white/50">
        This video is confidential and personal to you. Viewing is watermarked and logged.
      </p>
    </main>
  );
}
