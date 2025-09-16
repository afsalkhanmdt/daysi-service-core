module.exports = {
  i18n: {
    defaultLocale: "en", // fallback to English or whatever you want as safe default
    locales: ["en", "da", "sv", "nb"],
  },
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
