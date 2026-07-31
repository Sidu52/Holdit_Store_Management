import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Derive backend origin from NEXT_PUBLIC_API_URL (e.g. "https://host.com/api/v1" → "https://host.com")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const backendUrl = apiUrl.replace(/\/api\/v1\/?$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
