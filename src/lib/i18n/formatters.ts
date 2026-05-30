import type { Locale } from './messages';

const intlLocaleByLocale: Record<Locale, string> = {
  en: 'en',
  ja: 'ja-JP',
  ko: 'ko-KR',
};

export const intlLocale = (locale: Locale) => intlLocaleByLocale[locale];

export function createDateFormatters(locale: Locale) {
  const currentIntlLocale = intlLocale(locale);

  return {
    todayLabel(date = new Date()) {
      return new Intl.DateTimeFormat(currentIntlLocale, {
        day: '2-digit',
        month: 'short',
        weekday: 'short',
      }).format(date);
    },
    monthTitle(year: number, month: number) {
      return new Intl.DateTimeFormat(currentIntlLocale, {
        month: 'long',
        year: 'numeric',
      }).format(new Date(year, month - 1, 1));
    },
    weekRange(weekStart: string) {
      const start = new Date(`${weekStart}T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCDate(start.getUTCDate() + 6);
      const formatter = new Intl.DateTimeFormat(currentIntlLocale, {
        month: 'short',
        day: 'numeric',
      });
      return `${formatter.format(start)} - ${formatter.format(end)}`;
    },
    weekdayShort(date: string) {
      return new Intl.DateTimeFormat(currentIntlLocale, {
        weekday: 'short',
      }).format(new Date(`${date}T00:00:00.000Z`));
    },
    time(capturedAt: string) {
      return new Intl.DateTimeFormat(currentIntlLocale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(capturedAt));
    },
    date(date: string | Date) {
      const value = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat(currentIntlLocale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(value);
    },
    monthDay(date: string) {
      return new Intl.DateTimeFormat(currentIntlLocale, {
        day: '2-digit',
        month: '2-digit',
      }).format(new Date(`${date}T00:00:00.000Z`));
    },
  };
}
