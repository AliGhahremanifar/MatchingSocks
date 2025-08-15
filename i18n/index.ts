import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import fa from "./locales/fa.json";
import nl from "./locales/nl.json";

const resources = {
  en: {
    translation: en,
  },
  fa: {
    translation: fa,
  },
  nl: {
    translation: nl,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getLocales()[0]?.languageCode || "fa", // Default to device language or Farsi
  fallbackLng: "fa",
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v3",
});

export default i18n;
