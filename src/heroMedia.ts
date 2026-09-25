/** Hero medya URL'sinin video olup olmadığını uzantıdan kontrol eder. */
export function isHeroVideo(url?: string | null): boolean {
  if (!url) return false
  const path = url.split('?')[0].toLowerCase()
  return path.endsWith('.mp4') || path.endsWith('.webm') || path.endsWith('.ogg')
}
