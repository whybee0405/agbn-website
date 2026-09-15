export type PricingPlanTone = 'blue' | 'gold' | 'purple'

export const getPricingPlanTone = (name: string): PricingPlanTone => {
  switch (name) {
    case 'CONNECT':
      return 'blue'
    case 'GROW':
      return 'gold'
    case 'GROW PRO MAX':
      return 'purple'
    default:
      return 'blue'
  }
}
