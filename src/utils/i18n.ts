import i18n from "i18next";

export function createI18nInstance() {
  return i18n.createInstance();
}

i18n.init({
  lng: "en",
  fallbackLng: "en",
  resources: {},
  interpolation: { escapeValue: false },
});

export default i18n;
