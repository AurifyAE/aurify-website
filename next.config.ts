import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Shareable link that opens the brochure download dialog.
      {
        source: "/brochure",
        destination: "/?brochure=open",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
