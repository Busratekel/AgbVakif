import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Rota değişince (hash yoksa) sayfayı üste alır */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
