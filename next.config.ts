import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/dbrg-webinar": [
      "./public/images/dbrg/email/aurify-logo.png",
      "./public/images/dbrg/email/dbrg-logo.png",
    ],
  },
};

export default nextConfig;
