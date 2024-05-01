import "intl-pluralrules";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import es from "./locales/es";

// Function to change the language
export const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
};

i18n.use(initReactI18next).init({
  languaje: "es",
  fallbackLng: "en",
  resources: {
    en: {
      translation: en,
    },
    es: {
      translation: es,
    },
  },
  interpolation: {
    escapeValue: false,
  },

  pluralSeparator: "_",
  pluralRules: {
    en: function (n) {
      return n === 1 ? "one" : "other";
    },
    es: function (n) {
      return n === 1 ? "one" : "other";
    },
  },
});

export default i18n;
