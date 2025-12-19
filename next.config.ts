import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:3005/api/:path*", // Proxy to Rust Backend
      },
    ];
  },
};

export default nextConfig;
