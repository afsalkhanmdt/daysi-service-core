import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: undefined, // let i18next decide based on browser or later changeLanguage
    fallbackLng: "en", // fallback to English if translation not found
    supportedLngs: ["en", "da","sv","nb"],
    interpolation: { escapeValue: false },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    ns: ["common"],
    defaultNS: "common",
  });

