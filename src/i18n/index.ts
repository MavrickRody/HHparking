import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {getLocales} from 'react-native-localize';

import en from './locales/en.json';
import de from './locales/de.json';

const resources = {
  en: {
    translation: en,
  },
  de: {
    translation: de,
  },
};

const deviceLanguage = getLocales()[0]?.languageCode || 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;