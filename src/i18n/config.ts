import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import ar from './locales/ar.json'
import en from './locales/en.json'

export const defaultNS = 'common'
export const resources = { ar: { [defaultNS]: ar }, en: { [defaultNS]: en } } as const

export const supportedLngs = ['ar', 'en'] as const
export type Locale = (typeof supportedLngs)[number]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: 'ar',
    supportedLngs: [...supportedLngs],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'locale',
    },
  })

export function getDir(lng: string): 'rtl' | 'ltr' {
  return lng === 'ar' ? 'rtl' : 'ltr'
}

export default i18n
