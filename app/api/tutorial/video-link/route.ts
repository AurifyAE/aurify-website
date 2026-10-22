import { NextResponse } from "next/server";
import { clientInfo } from "@/lib/tutorial/cookies";
import { logActivity } from "@/lib/tutorial/log";
import { signVideoUrl } from "@/lib/tutorial/r2";
import { getViewer } from "@/lib/tutorial/viewer";

/** Fresh signed link when the player's link expires mid-video; same checks as the page. */
export async function GET(req: Request) {
  const result = await getViewer();
  if (!result.ok) return NextResponse.json({ reason: result.reason }, { status: 401 });

  const url = await signVideoUrl(result.viewer.accessExpiresAt);
  await logActivity({ email: result.viewer.email, action: "link refreshed", ...clientInfo(req.headers) });
  return NextResponse.json({ url });
}
