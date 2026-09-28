import agac from './universiteAgaci.json'

/** YÖK Atlas: üniversite → fakülte/yüksekokul → program. Son seçenek Diğer. */
export const UNIVERSITE_AGACI = agac as Record<string, Record<string, string[]>>

export function fakultelerOf(universite: string): string[] {
  const node = UNIVERSITE_AGACI[universite]
  return node ? Object.keys(node) : ['Diğer']
}

export function bolumlerOf(universite: string, fakulte: string): string[] {
  return UNIVERSITE_AGACI[universite]?.[fakulte] ?? ['Diğer']
}
