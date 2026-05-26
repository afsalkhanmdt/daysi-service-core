// next.config.js
const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_API_HOSTNAME,
      },
      {
        protocol: "https",
        hostname: "daysi.headfitted.in",
      },
    ],
  },
};

module.exports = nextConfig;
