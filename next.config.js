// next.config.js
const { i18n } = require("./next-i18next.config");

/**
 * ⚠️ FRONTEND-ONLY MODE (TEMPORARY)
 *
 * Backend (MongoDB / API routes) is intentionally NOT active right now.
 * Do NOT import dbConnect / server data in pages or layouts.
 *
 * When backend work resumes:
 *  - Re-enable API routes usage
 *  - Ensure MongoDB Atlas + env vars are configured
 */

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

  // Ensures stable frontend-only builds on Vercel
  output: "standalone",
};

module.exports = nextConfig;
