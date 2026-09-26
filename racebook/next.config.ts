import type { NextConfig } from "next";

const basePath = process.env.BASE_URL || "";

// Webflow Cloud's proxy forwards a host that differs from the public origin, so Next's
// Server Actions CSRF check rejects every action unless the public domain is allowed.
const PUBLIC_ORIGINS = ["racebook-23e161.webflow.io"];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { allowedOrigins: PUBLIC_ORIGINS },
  },
  ...(basePath && {
    basePath,
    assetPrefix: process.env.ASSETS_PREFIX || basePath,
  }),
};

export default nextConfig;

// Enable getCloudflareContext() in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
