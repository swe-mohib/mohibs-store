import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [new URL("https://res.cloudinary.com/df6ou2hiw/**")],
  },
};

export default nextConfig;
