import { catalogs, type TextMessageKey, type TranslateFn, type TranslateParams } from './messages';

export class I18nError extends Error {
  readonly key: TextMessageKey;
  readonly params?: TranslateParams;

  constructor(key: TextMessageKey, params?: TranslateParams) {
    super(key);
    this.name = 'I18nError';
    this.key = key;
    this.params = params;
  }
}

export function isI18nError(error: unknown): error is I18nError {
  if (error instanceof I18nError) {
    return true;
  }

  if (typeof error !== 'object' || error === null || !('key' in error)) {
    return false;
  }

  const key = (error as { key?: unknown }).key;
  return typeof key === 'string' && key in catalogs.en;
}

export function resolveErrorMessage(
  error: unknown,
  t: TranslateFn,
  fallbackKey: TextMessageKey = 'common.unexpectedError',
) {
  if (isI18nError(error) && typeof error.key === 'string') {
    return t(error.key, error.params);
  }

  return t(fallbackKey);
}
