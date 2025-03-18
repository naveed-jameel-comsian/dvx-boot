import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import nl from "./locales/nl.json";
import fr from "./locales/fr.json";

const resources = {
  en: { translations: en },
  nl: { translations: nl },
  fr: { translations: fr },
};
i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    lng: localStorage.getItem("language") || "nl", // Default before fetching
    fallbackLng: "nl",
    defaultNS: 'translations',
    keySeparator: '.',
    interpolation: { escapeValue: false },
  });

// export const setLanguageFromBackend = (userLanguage) => {
//   const lang = userLanguage || "en"; // Default to English if null
//   i18n.changeLanguage(lang);
//   // localStorage.setItem("language", lang); // Save preference
//   // localStorage.setItem("i18nextLng", lang); 
// };
// export default i18n;