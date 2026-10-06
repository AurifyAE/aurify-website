import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 90 is for text-heavy event artwork, where 75 visibly softens small type.
    qualities: [75, 90],
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
