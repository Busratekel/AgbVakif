/** T.C. kimlik numarası algoritmik doğrulama (11 hane + kontrol basamakları). */
export function validateTCKN(tcno: string): boolean {
  const tc = (tcno || '').replace(/\D/g, '')
  if (tc.length !== 11 || tc[0] === '0' || !/^\d{11}$/.test(tc)) return false

  const digits = tc.split('').map((c) => Number(c))
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7]

  let digit10 = ((oddSum * 7) - evenSum) % 10
  if (digit10 < 0) digit10 += 10
  if (digit10 !== digits[9]) return false

  const sum10 = digits.slice(0, 10).reduce((a, b) => a + b, 0)
  if (sum10 % 10 !== digits[10]) return false

  return true
}
