export interface StripePlanLocaleConfig {
  locale: string;
  languageName: string;
  currency: string;
  currencySymbol: string;
  monthlyDisplayPrice: string;
  yearlyDisplayPrice: string;
  priceId1Month?: string;
  priceId12Month?: string;
  productId1Month?: string;
  productId12Month?: string;
}

// Normalize locale codes (e.g., 'da-DK' -> 'da', 'no' -> 'nb')
export function normalizeLocale(locale?: string | null): string {
  if (!locale) return 'en';
  const clean = locale.toLowerCase().split(/[-_]/)[0];
  if (clean === 'no') return 'nb';
  if (['da', 'en', 'sv', 'nb', 'de'].includes(clean)) {
    return clean;
  }
  return 'en';
}

export const STRIPE_PLANS_BY_LOCALE: Record<string, StripePlanLocaleConfig> = {
  da: {
    locale: 'da',
    languageName: 'Dansk',
    currency: 'DKK',
    currencySymbol: 'kr.',
    monthlyDisplayPrice: '29',
    yearlyDisplayPrice: '249',
    priceId1Month: process.env.STRIPE_PRICE_ID_1_MONTH_DA || process.env.STRIPE_PRICE_ID_1_MONTH,
    priceId12Month: process.env.STRIPE_PRICE_ID_12_MONTH_DA || process.env.STRIPE_PRICE_ID_12_MONTH,
    productId1Month: process.env.STRIPE_PRODUCT_ID_1_MONTH_DA || 'com.familycal.daysi.one.month.da',
    productId12Month: process.env.STRIPE_PRODUCT_ID_12_MONTH_DA || 'com.familycal.daysi.one.year.da',
  },
  en: {
    locale: 'en',
    languageName: 'English',
    currency: 'USD',
    currencySymbol: '$',
    monthlyDisplayPrice: '4.99',
    yearlyDisplayPrice: '39.99',
    priceId1Month: process.env.STRIPE_PRICE_ID_1_MONTH_EN || process.env.STRIPE_PRICE_ID_1_MONTH,
    priceId12Month: process.env.STRIPE_PRICE_ID_12_MONTH_EN || process.env.STRIPE_PRICE_ID_12_MONTH,
    productId1Month: process.env.STRIPE_PRODUCT_ID_1_MONTH_EN || 'com.familycal.daysi.one.month.en',
    productId12Month: process.env.STRIPE_PRODUCT_ID_12_MONTH_EN || 'com.familycal.daysi.one.year.en',
  },
  sv: {
    locale: 'sv',
    languageName: 'Svenska',
    currency: 'SEK',
    currencySymbol: 'kr',
    monthlyDisplayPrice: '45',
    yearlyDisplayPrice: '395',
    priceId1Month: process.env.STRIPE_PRICE_ID_1_MONTH_SV || process.env.STRIPE_PRICE_ID_1_MONTH,
    priceId12Month: process.env.STRIPE_PRICE_ID_12_MONTH_SV || process.env.STRIPE_PRICE_ID_12_MONTH,
    productId1Month: process.env.STRIPE_PRODUCT_ID_1_MONTH_SV || 'com.familycal.daysi.one.month.sv',
    productId12Month: process.env.STRIPE_PRODUCT_ID_12_MONTH_SV || 'com.familycal.daysi.one.year.sv',
  },
  nb: {
    locale: 'nb',
    languageName: 'Norsk',
    currency: 'NOK',
    currencySymbol: 'kr',
    monthlyDisplayPrice: '45',
    yearlyDisplayPrice: '395',
    priceId1Month: process.env.STRIPE_PRICE_ID_1_MONTH_NB || process.env.STRIPE_PRICE_ID_1_MONTH,
    priceId12Month: process.env.STRIPE_PRICE_ID_12_MONTH_NB || process.env.STRIPE_PRICE_ID_12_MONTH,
    productId1Month: process.env.STRIPE_PRODUCT_ID_1_MONTH_NB || 'com.familycal.daysi.one.month.nb',
    productId12Month: process.env.STRIPE_PRODUCT_ID_12_MONTH_NB || 'com.familycal.daysi.one.year.nb',
  },
  de: {
    locale: 'de',
    languageName: 'Deutsch',
    currency: 'EUR',
    currencySymbol: '€',
    monthlyDisplayPrice: '4,49',
    yearlyDisplayPrice: '39,99',
    priceId1Month: process.env.STRIPE_PRICE_ID_1_MONTH_DE || process.env.STRIPE_PRICE_ID_1_MONTH,
    priceId12Month: process.env.STRIPE_PRICE_ID_12_MONTH_DE || process.env.STRIPE_PRICE_ID_12_MONTH,
    productId1Month: process.env.STRIPE_PRODUCT_ID_1_MONTH_DE || 'com.familycal.daysi.one.month.de',
    productId12Month: process.env.STRIPE_PRODUCT_ID_12_MONTH_DE || 'com.familycal.daysi.one.year.de',
  },
};

export function getStripePlanForLocale(rawLocale?: string | null): StripePlanLocaleConfig {
  const norm = normalizeLocale(rawLocale);
  return STRIPE_PLANS_BY_LOCALE[norm] || STRIPE_PLANS_BY_LOCALE.en;
}
