import type { NextConfig } from "next";

const apiUrl = process.env.API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@istinny/api"],
  experimental: {
    optimizePackageImports: ["@elysia/eden"],
  },
  async rewrites() {
    return [{ source: "/api-proxy/:path*", destination: `${apiUrl}/:path*` }];
  },
};

export default nextConfig;
