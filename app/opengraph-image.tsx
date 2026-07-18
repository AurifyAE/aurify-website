import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/content/site";

/**
 * Site-wide OG card, generated at build with the real logo asset.
 * White ground so the navy-and-gradient lockup reads at full strength.
 */
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(
    path.join(process.cwd(), "public/logo/aurify-logo.svg")
  );
  const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 160,
            height: 8,
            borderRadius: 4,
            background: "linear-gradient(90deg, #203366, #4067b1, #2fb0e5)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" width={490} height={141} />
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 38,
              color: "rgba(32,51,102,0.85)",
            }}
          >
            {site.tagline}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 6,
            color: "rgba(32,51,102,0.6)",
          }}
        >
          MINE • REFINE • TRADE
        </div>
      </div>
    ),
    { ...size }
  );
}
