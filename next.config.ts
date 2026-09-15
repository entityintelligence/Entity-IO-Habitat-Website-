import type { NextConfig } from "next";

const enroll = "/?enroll=1";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/join", destination: enroll, permanent: true },
      { source: "/waitlist", destination: enroll, permanent: true },
      { source: "/start", destination: enroll, permanent: true },
      { source: "/pilots", destination: enroll, permanent: true },
      { source: "/get-in-touch", destination: enroll, permanent: true },
      { source: "/habitat", destination: "/product", permanent: true },
      { source: "/blueprint", destination: "/", permanent: true },
      { source: "/schematic", destination: "/", permanent: true },
      { source: "/system", destination: "/", permanent: true },
      { source: "/company", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
