import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 90 is for text-heavy event artwork, where 75 visibly softens small type.
    qualities: [75, 90],
  },
  // Client tutorial pages: never cached, indexed, or leaking a referrer.
  async headers() {
    const privateHeaders = [
      { key: "Cache-Control", value: "no-store" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ];
    return ["/tutorial", "/login", "/admin/:path*", "/api/tutorial/:path*"].map(
      (source) => ({ source, headers: privateHeaders })
    );
  },
  async redirects() {
    return [
      // Shareable link that opens the brochure download dialog.
      {
        source: "/brochure",
        destination: "/?brochure=open",
        permanent: false,
      },
      // Shareable link that opens the book a demo dialog.
      {
        source: "/book-a-demo",
        destination: "/?demo=open",
        permanent: false,
      },
      // Webinars became Events; keep links already shared working. The AKW
      // seminar also changed slug, so it must match before the wildcard.
      {
        source: "/webinars/akw-seminar",
        destination: "/events/e-invoicing-seminar",
        permanent: true,
      },
      {
        source: "/webinars/:path*",
        destination: "/events/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
