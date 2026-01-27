import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEn from '@app/core/locales/en.json';
import translationVi from '@app/core/locales/vi.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEn },
      vi: { translation: translationVi },
    },
    lng: 'vi',
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
