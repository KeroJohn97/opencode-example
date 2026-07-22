import { config } from "dotenv";
import { resolve } from "path";
import type { NextConfig } from "next";

config({ path: resolve(__dirname, "../.env.local") });

const nextConfig: NextConfig = {
  env: {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
};

export default nextConfig;
