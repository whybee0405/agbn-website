export const SADC_COUNTRIES = [
  'South Africa',
  'Zimbabwe',
  'Mozambique',
  'Lesotho',
  'Botswana',
  'Namibia',
] as const

export type SadcCountry = (typeof SADC_COUNTRIES)[number]

export const SADC_COUNTRY_OPTIONS = SADC_COUNTRIES.map((country) => ({
  label: country,
  value: country,
}))
