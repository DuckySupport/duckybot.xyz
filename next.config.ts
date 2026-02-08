import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "t0.rbxcdn.com",
      },
      {
        protocol: "https",
        hostname: "t1.rbxcdn.com",
      },
      {
        protocol: "https",
        hostname: "t2.rbxcdn.com",
      },
      {
        protocol: "https",
        hostname: "t3.rbxcdn.com",
      },
      {
        protocol: "https",
        hostname: "t4.rbxcdn.com",
      },
      {
        protocol: "https",
        hostname: "t5.rbxcdn.com",
      },
      {
        protocol: "https",
        hostname: "t6.rbxcdn.com",
      },
      {
        protocol: "https",
        hostname: "t7.rbxcdn.com",
      },
      {
        protocol: "https",
        hostname: "t8.rbxcdn.com",
      },
      {
        protocol: "https",
        hostname: "t9.rbxcdn.com",
      }
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
