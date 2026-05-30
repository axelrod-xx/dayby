import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { createDateFormatters } from './formatters';
import {
  catalogs,
  localePreferences,
  supportedLocales,
  type Locale,
  type LocalePreference,
  type MessageKey,
  type PluralMessage,
  type PluralMessageKey,
  type TextMessageKey,
  type TranslateFn,
  type TranslateParams,
} from './messages';

export type {
  Locale,
  LocalePreference,
  MessageKey,
  PluralMessageKey,
  TextMessageKey,
  TranslateFn,
  TranslateParams,
};

const storageKey = 'dayby.localePreference';
const fallbackLocale: Locale = 'en';

type I18nContextValue = {
  locale: Locale;
  preference: LocalePreference;
  isReady: boolean;
  setPreference: (preference: LocalePreference) => Promise<void>;
  t: TranslateFn;
  formatters: ReturnType<typeof createDateFormatters>;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}

function isLocalePreference(value: string): value is LocalePreference {
  return localePreferences.includes(value as LocalePreference);
}

function normalizePreference(value: string | null): LocalePreference {
  return value && isLocalePreference(value) ? value : 'system';
}

function resolveSystemLocale(): Locale {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const language = locale.split('-')[0]?.toLowerCase();
    return language && isLocale(language) ? language : fallbackLocale;
  } catch {
    return fallbackLocale;
  }
}

function resolveLocale(preference: LocalePreference): Locale {
  return preference === 'system' ? resolveSystemLocale() : preference;
}

function interpolate(template: string, params?: TranslateParams) {
  if (!params) {
    return template;
  }

  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (match, key: string) => {
    const value = params[key];
    return value === undefined ? match : String(value);
  });
}

function createTranslator(locale: Locale): TranslateFn {
  const messages = catalogs[locale] ?? catalogs[fallbackLocale];
  const fallbackMessages = catalogs[fallbackLocale];

  return ((key: MessageKey, params?: TranslateParams) => {
    const message = messages[key] ?? fallbackMessages[key];

    if (typeof message === 'string') {
      return interpolate(message, params);
    }

    const count = params?.count;
    const plural = (count === 1 ? message.one : message.other) as PluralMessage[keyof PluralMessage];
    return interpolate(plural, params);
  }) as TranslateFn;
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [preference, setPreferenceState] = useState<LocalePreference>('system');
  const [locale, setLocale] = useState<Locale>(fallbackLocale);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(storageKey)
      .then((storedPreference) => {
        if (!mounted) {
          return;
        }

        const nextPreference = normalizePreference(storedPreference);
        setPreferenceState(nextPreference);
        setLocale(resolveLocale(nextPreference));
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setPreferenceState('system');
        setLocale(resolveLocale('system'));
      })
      .finally(() => {
        if (mounted) {
          setIsReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setPreference = useCallback(async (nextPreference: LocalePreference) => {
    const normalized = normalizePreference(nextPreference);
    setPreferenceState(normalized);
    setLocale(resolveLocale(normalized));

    try {
      await AsyncStorage.setItem(storageKey, normalized);
    } catch {
      // Language choice is recoverable; keep the in-memory preference for this session.
    }
  }, []);

  const t = useMemo(() => createTranslator(locale), [locale]);
  const formatters = useMemo(() => createDateFormatters(locale), [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      preference,
      isReady,
      setPreference,
      t,
      formatters,
    }),
    [formatters, isReady, locale, preference, setPreference, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);

  if (!value) {
    throw new Error('useI18n must be used inside I18nProvider.');
  }

  return value;
}
