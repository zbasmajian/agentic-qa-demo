import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Bundle a minimal server.js plus only the files it needs into .next/standalone,
  // so the Docker image stays small (see Dockerfile).
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
