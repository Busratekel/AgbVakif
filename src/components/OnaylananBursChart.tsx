import { useEffect, useMemo, useState } from 'react'
import { FORM_API_URL } from '../config'

type ChartItem = { label: string; count: number }

type ChartResponse = {
  yil: number
  years: number[]
  total: number
  items: ChartItem[]
}

const COLORS = [
  '#2f9e88',
  '#3b7ddd',
  '#5bc0de',
  '#e6b84a',
  '#d9534f',
  '#6f42c1',
  '#20c997',
  '#fd7e14',
  '#6610f2',
]

export function OnaylananBursChart() {
  const [yil, setYil] = useState<number | null>(null)
  const [data, setData] = useState<ChartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const qs = yil ? `?yil=${yil}` : ''
        const res = await fetch(`${FORM_API_URL}/basvuru/istatistik${qs}`)
        const json = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok) {
          setError(json.message || 'İstatistik alınamadı')
          return
        }
        setData({
          yil: Number(json.yil) || new Date().getFullYear(),
          years: Array.isArray(json.years) ? json.years.map(Number) : [],
          total: Number(json.total) || 0,
          items: Array.isArray(json.items)
            ? json.items.map((x: ChartItem) => ({
                label: String(x.label || 'Diğer'),
                count: Number(x.count) || 0,
              }))
            : [],
        })
        if (yil == null && json.yil) setYil(Number(json.yil))
      } catch {
        if (!cancelled) setError('İstatistik alınamadı')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [yil])

  const gradient = useMemo(() => {
    if (!data || data.total <= 0 || data.items.length === 0) {
      return 'conic-gradient(#e8eeeb 0deg 360deg)'
    }
    let start = 0
    const parts: string[] = []
    data.items.forEach((item, i) => {
      const sweep = (item.count / data.total) * 360
      const end = start + sweep
      const color = COLORS[i % COLORS.length]
      parts.push(`${color} ${start}deg ${end}deg`)
      start = end
    })
    return `conic-gradient(${parts.join(', ')})`
  }, [data])

  return (
    <section className="burs-chart" aria-labelledby="burs-chart-title">
      <div className="burs-chart-head">
        <h2 id="burs-chart-title">
          {data ? `${data.yil} Yılında Onaylanan Burslar` : 'Onaylanan Burslar'}
        </h2>
        {data && data.years.length > 0 ? (
          <label className="burs-chart-year">
            <span className="sr-only">Yıl</span>
            <select
              value={data.yil}
              onChange={(e) => setYil(Number(e.target.value))}
            >
              {data.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {loading ? <p className="muted">Grafik yükleniyor…</p> : null}
      {error ? <p className="basvuru-status is-closed">{error}</p> : null}

      {!loading && !error && data ? (
        data.total === 0 ? (
          <p className="muted">Bu yılda onaylanmış başvuru bulunmuyor.</p>
        ) : (
          <>
            <ul className="burs-chart-legend">
              {data.items.map((item, i) => (
                <li key={item.label}>
                  <span
                    className="burs-chart-swatch"
                    style={{ background: COLORS[i % COLORS.length] }}
                    aria-hidden="true"
                  />
                  <span>
                    {item.label} ({item.count})
                  </span>
                </li>
              ))}
            </ul>
            <div className="burs-chart-visual">
              <div
                className="burs-chart-donut"
                style={{ background: gradient }}
                role="img"
                aria-label={`${data.yil} yılında onaylanan ${data.total} burs; kategorilere göre dağılım`}
              />
              <div className="burs-chart-center">
                <strong>{data.total}</strong>
                <span>onay</span>
              </div>
            </div>
          </>
        )
      ) : null}
    </section>
  )
}
