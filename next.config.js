// next.config.js
const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.daysi.dk",
      },
    ],
  },
};

module.exports = nextConfig;
