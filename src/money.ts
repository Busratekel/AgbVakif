/** Türk lirası giriş formatı: 15.000 veya 15.000,50 */
export function formatMoneyInput(raw: string): string {
  const cleaned = raw.replace(/[^\d,]/g, '')
  if (!cleaned) return ''

  const commaIndex = cleaned.indexOf(',')
  let integerPart = cleaned
  let decimalPart = ''

  if (commaIndex >= 0) {
    integerPart = cleaned.slice(0, commaIndex)
    decimalPart = cleaned.slice(commaIndex + 1).replace(/,/g, '').slice(0, 2)
  }

  integerPart = integerPart.replace(/^0+(?=\d)/, '')
  if (!integerPart && (commaIndex >= 0 || decimalPart)) integerPart = '0'

  const withDots = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  if (commaIndex >= 0) {
    return `${withDots},${decimalPart}`
  }

  return withDots
}

export function moneyDisplayWithCurrency(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return `${trimmed} TL`
}
