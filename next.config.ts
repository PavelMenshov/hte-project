import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow ngrok (and similar) origins in dev so "npm run share" works without warnings
  allowedDevOrigins: ["*.ngrok-free.dev", "*.ngrok-free.app"],
};

export default nextConfig;
