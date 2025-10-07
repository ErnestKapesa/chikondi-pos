// African and International Currencies
export const CURRENCIES = [
  // Major African Currencies
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', country: 'Malawi' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', country: 'Kenya' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', country: 'Uganda' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', country: 'Tanzania' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', country: 'South Africa' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', country: 'Nigeria' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', country: 'Ghana' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£E', country: 'Egypt' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', country: 'Morocco' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', country: 'Ethiopia' },
  
  // West Africa
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', country: 'West Africa' },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', country: 'Central Africa' },
  { code: 'SLL', name: 'Sierra Leonean Leone', symbol: 'Le', country: 'Sierra Leone' },
  { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$', country: 'Liberia' },
  
  // East Africa
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF', country: 'Rwanda' },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', country: 'Burundi' },
  { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', country: 'Djibouti' },
  { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk', country: 'Eritrea' },
  
  // Southern Africa
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P', country: 'Botswana' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', country: 'Namibia' },
  { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'E', country: 'Eswatini' },
  { code: 'LSL', name: 'Lesotho Loti', symbol: 'M', country: 'Lesotho' },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', country: 'Mozambique' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', country: 'Zambia' },
  { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: 'Z$', country: 'Zimbabwe' },
  
  // International Currencies (commonly used in Africa)
  { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States' },
  { code: 'EUR', name: 'Euro', symbol: '€', country: 'European Union' },
  { code: 'GBP', name: 'British Pound', symbol: '£', country: 'United Kingdom' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', country: 'Switzerland' },
];

export const DEFAULT_CURRENCY = 'MWK';

export function getCurrencyByCode(code) {
  return CURRENCIES.find(currency => currency.code === code) || CURRENCIES.find(c => c.code === DEFAULT_CURRENCY);
}

export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY) {
  const currency = getCurrencyByCode(currencyCode);
  return `${currency.symbol} ${amount.toLocaleString()}`;
}

export function getCurrencySymbol(currencyCode = DEFAULT_CURRENCY) {
  const currency = getCurrencyByCode(currencyCode);
  return currency.symbol;
}

// Popular currencies for quick selection
export const POPULAR_CURRENCIES = ['MWK', 'KES', 'UGX', 'TZS', 'ZAR', 'NGN', 'USD', 'EUR'];

// Regional groupings
export const CURRENCY_REGIONS = {
  'East Africa': ['KES', 'UGX', 'TZS', 'RWF', 'BIF', 'ETB'],
  'West Africa': ['NGN', 'GHS', 'XOF', 'SLL', 'LRD'],
  'Southern Africa': ['ZAR', 'BWP', 'NAD', 'SZL', 'LSL', 'MZN', 'ZMW', 'MWK'],
  'North Africa': ['EGP', 'MAD', 'TND', 'DZD'],
  'International': ['USD', 'EUR', 'GBP', 'CHF']
};