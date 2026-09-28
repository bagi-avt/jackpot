export interface Money {
  currency: string;
  locale: string;
}

const ALIASES: Record<string, string> = {
  ru: 'ru-RU', rus: 'ru-RU', rf: 'ru-RU',
  kz: 'kk-KZ', kk: 'kk-KZ', kaz: 'kk-KZ',
  by: 'be-BY', be: 'be-BY',
  ua: 'uk-UA', uk: 'uk-UA',
  uz: 'uz-UZ', kg: 'ky-KG', ky: 'ky-KG', tj: 'tg-TJ', tg: 'tg-TJ',
  am: 'hy-AM', hy: 'hy-AM', az: 'az-AZ', ge: 'ka-GE', ka: 'ka-GE',
  us: 'en-US', en: 'en-US', gb: 'en-GB',
  de: 'de-DE', fr: 'fr-FR', it: 'it-IT', es: 'es-ES',
  tr: 'tr-TR', cn: 'zh-CN', zh: 'zh-CN', jp: 'ja-JP', ja: 'ja-JP',
  in: 'hi-IN', ae: 'ar-AE', pl: 'pl-PL',
};

const REGION_CURRENCY: Record<string, string> = {
  RU: 'RUB', KZ: 'KZT', BY: 'BYN', UA: 'UAH', UZ: 'UZS', KG: 'KGS', TJ: 'TJS',
  AM: 'AMD', AZ: 'AZN', GE: 'GEL', US: 'USD', GB: 'GBP', CN: 'CNY', JP: 'JPY',
  TR: 'TRY', IN: 'INR', AE: 'AED', PL: 'PLN', CH: 'CHF', CA: 'CAD', AU: 'AUD',
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', AT: 'EUR', FI: 'EUR',
  PT: 'EUR', IE: 'EUR', BE: 'EUR', GR: 'EUR',
};

const CURRENCY_LOCALE: Record<string, string> = {
  RUB: 'ru-RU', KZT: 'kk-KZ', BYN: 'be-BY', UAH: 'uk-UA', UZS: 'uz-UZ', KGS: 'ky-KG',
  TJS: 'tg-TJ', AMD: 'hy-AM', AZN: 'az-AZ', GEL: 'ka-GE', USD: 'en-US', GBP: 'en-GB',
  EUR: 'de-DE', CNY: 'zh-CN', JPY: 'ja-JP', TRY: 'tr-TR', INR: 'hi-IN', AED: 'ar-AE',
  PLN: 'pl-PL',
};

export const DEFAULT_MONEY: Money = { currency: 'RUB', locale: 'ru-RU' };

export function parseMoneyToken(value: string | null): Partial<Money> {
  if (!value) return {};
  let s = value.trim().replace('_', '-');
  const alias = ALIASES[s.toLowerCase()];
  if (alias) s = alias;
  else if (/^[a-z]{3}$/i.test(s)) return { currency: s.toUpperCase() };

  const m = /^([a-z]{2,3})-([a-z]{2})$/i.exec(s);
  if (!m?.[1] || !m[2]) return {};
  const region = m[2].toUpperCase();
  const currency = REGION_CURRENCY[region];
  if (!currency) return {};
  return { locale: `${m[1].toLowerCase()}-${region}`, currency };
}

export function resolveMoney(currencyParam: string | null, localeParam: string | null): Money {
  const fromLocale = parseMoneyToken(localeParam);
  const fromCurrency = parseMoneyToken(currencyParam);

  const currency = fromCurrency.currency ?? fromLocale.currency ?? DEFAULT_MONEY.currency;
  const locale =
    fromLocale.locale ?? fromCurrency.locale ?? CURRENCY_LOCALE[currency] ?? DEFAULT_MONEY.locale;

  try {
    new Intl.NumberFormat(locale, { style: 'currency', currency });
    return { currency, locale };
  } catch {
    return DEFAULT_MONEY;
  }
}

export function formatMoney(amount: number, { currency, locale }: Money): string {
  const base: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };
  try {
    return new Intl.NumberFormat(locale, { ...base, currencyDisplay: 'narrowSymbol' }).format(amount);
  } catch {
    try {
      return new Intl.NumberFormat(locale, base).format(amount);
    } catch {
      return `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currency}`;
    }
  }
}

export function maskMoney(formatted: string): string {
  return formatted.replace(/\d/g, '?');
}
