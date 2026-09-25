import raw from './ilceler.json'

type TurkiyeData = {
  iller: string[]
  ilceler: Record<string, string[]>
}

const data = raw as TurkiyeData

export const ILLER = data.iller

export const ILCELER = data.ilceler

export function ilcelerOf(il: string): string[] {
  return ILCELER[il] ?? []
}
