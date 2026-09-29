import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import {
  adminDownloadBasvuruExcel,
  adminDownloadBelge,
  adminOpenBelge,
  adminBelgeBlobUrl,
  adminFetch,
  adminLogin,
  adminLogout,
  clearAdminSession,
  getAdminToken,
  type HeroSlide,
} from './adminApi'
import { isHeroVideo } from '../heroMedia'
import { AdminToastProvider, useAdminToast } from './AdminToast'

export function AdminShell() {
  const token = getAdminToken()
  if (!token) return <Navigate to="/admin/giris" replace />

  return (
    <AdminToastProvider>
      <AdminSessionGuard />
      <div className="admin-app">
        <header className="admin-top">
          <div className="shell admin-top-inner">
            <Link to="/admin" className="admin-brand">AGB Panel</Link>
            <nav className="admin-nav">
              <Link to="/admin">Başvurular</Link>
              <Link to="/admin/hero">Hero / Duyuru</Link>
              <Link to="/admin/ayarlar">Ayarlar</Link>
              <Link to="/admin/kullanicilar">Kullanıcılar</Link>
              <Link to="/" className="muted">Siteye dön</Link>
              <button
                type="button"
                className="linkish"
                onClick={() => {
                  void adminLogout().then(() => {
                    window.location.href = '/admin/giris'
                  })
                }}
              >
                Çıkış
              </button>
            </nav>
          </div>
        </header>
        <main className="shell admin-main">
          <Outlet />
        </main>
      </div>
    </AdminToastProvider>
  )
}

/** Oturum düştüyse paneli açık bırakmaz; periyodik /me kontrolü. */
function AdminSessionGuard() {
  useEffect(() => {
    let cancelled = false
    async function check() {
      if (!getAdminToken() || cancelled) return
      try {
        await adminFetch('/me')
      } catch {
        // adminFetch 401'de zaten giriş sayfasına yönlendirir
      }
    }
    void check()
    const timer = window.setInterval(() => void check(), 60_000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])
  return null
}

export function AdminLogin() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await adminLogin(userName.trim(), password)
      const params = new URLSearchParams(window.location.search)
      const next = params.get('next')
      const target =
        next && next.startsWith('/admin') && !next.startsWith('/admin/giris')
          ? next
          : '/admin'
      navigate(target, { replace: true })
    } catch (err) {
      clearAdminSession()
      setError(err instanceof Error ? err.message : 'Giriş başarısız')
    } finally {
      setLoading(false)
    }
  }

  if (getAdminToken()) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="admin-app admin-login-page">
      <form className="wizard-card admin-login-card" onSubmit={(e) => void onSubmit(e)}>
        <h1>AGB Yönetim Paneli</h1>
        <p className="wizard-lead">Windows hesabınız ile giriş yapın.</p>
        {error ? (
          <div className="form-alert is-error" role="alert">
            <p>{error}</p>
          </div>
        ) : null}
        <label>
          <span>Kullanıcı adı</span>
          <input
            type="text"
            autoComplete="username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="ör. busra.tekel"
            required
          />
        </label>
        <label>
          <span>Şifre</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </button>
      </form>
    </div>
  )
}

export function AdminBasvuruList() {
  const toast = useAdminToast()
  const [q, setQ] = useState('')
  const [durum, setDurum] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState<import('./adminApi').AdminBasvuruListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const pageSize = 25

  async function load(nextPage = page) {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(pageSize),
      })
      if (q.trim()) params.set('q', q.trim())
      if (durum) params.set('durum', durum)
      const json = await adminFetch(`/basvurular?${params}`)
      setItems(json.items ?? [])
      setTotal(json.total ?? 0)
      setPage(json.page ?? nextPage)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Liste alınamadı'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function exportExcel() {
    setExporting(true)
    try {
      await adminDownloadBasvuruExcel({ q, durum })
      toast.success('Excel indirildi.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Excel indirilemedi'
      toast.error(msg)
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    void load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h1>Başvurular</h1>
        <div className="admin-section-actions">
          <p className="muted">{total} kayıt</p>
          <button
            type="button"
            className="btn btn-ghost-dark"
            disabled={exporting || loading || total === 0}
            onClick={() => void exportExcel()}
          >
            {exporting ? 'Excel hazırlanıyor…' : 'Excel’e aktar'}
          </button>
        </div>
      </div>

      <form
        className="admin-filters"
        onSubmit={(e) => {
          e.preventDefault()
          void load(1)
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ad, TC, e-posta, üniversite…"
        />
        <select value={durum} onChange={(e) => setDurum(e.target.value)}>
          <option value="">Tüm durumlar</option>
          {(['Gonderildi', 'Inceleniyor', 'Onaylandi', 'Reddedildi'] as const).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button type="submit" className="btn" disabled={loading}>Filtrele</button>
      </form>

      {error ? (
        <div className="form-alert is-error"><p>{error}</p></div>
      ) : null}

      <div className="admin-table-wrap wizard-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Başvuru no</th>
              <th>Ad Soyad</th>
              <th>T.C.</th>
              <th>Üniversite</th>
              <th>Durum</th>
              <th>Gönderim</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}>Yükleniyor…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7}>Kayıt bulunamadı.</td></tr>
            ) : (
              items.map((row) => (
                <tr key={row.id}>
                  <td>{row.basvuruNo || '—'}</td>
                  <td>{row.ad} {row.soyad}</td>
                  <td>{row.tcKimlikNo}</td>
                  <td>{row.universite || '—'}</td>
                  <td><span className={`admin-pill durum-${(row.durum || '').toLowerCase()}`}>{row.durum}</span></td>
                  <td>{formatDate(row.sonGonderimTarihi || row.guncellemeTarihi)}</td>
                  <td><Link to={`/admin/basvuru/${row.id}`}>Detay</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pager">
        <button
          type="button"
          className="btn btn-ghost-dark"
          disabled={page <= 1 || loading}
          onClick={() => void load(page - 1)}
        >
          ← Önceki
        </button>
        <span>{page} / {totalPages}</span>
        <button
          type="button"
          className="btn btn-ghost-dark"
          disabled={page >= totalPages || loading}
          onClick={() => void load(page + 1)}
        >
          Sonraki →
        </button>
      </div>
    </section>
  )
}

function isImageName(name: string) {
  return /\.(jpe?g|png|gif|webp)$/i.test(name)
}

function AdminBelgeOnizleme({
  basvuruId,
  belgeId,
  dosyaAdi,
}: {
  basvuruId: string
  belgeId: string
  dosyaAdi: string
}) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isImageName(dosyaAdi)) return
    let objectUrl: string | null = null
    let cancelled = false
    ;(async () => {
      try {
        objectUrl = await adminBelgeBlobUrl(basvuruId, belgeId)
        if (!cancelled) setUrl(objectUrl)
        else URL.revokeObjectURL(objectUrl)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [basvuruId, belgeId, dosyaAdi])

  if (!url) return <div className="admin-belge-thumb is-empty" aria-hidden="true" />
  return (
    <a className="belge-thumb-link" href={url} target="_blank" rel="noreferrer">
      <img className="belge-thumb" src={url} alt={dosyaAdi} />
    </a>
  )
}

export function AdminBasvuruDetail() {
  const { id = '' } = useParams()
  const toast = useAdminToast()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [belgeler, setBelgeler] = useState<{
    id: string
    belgeKod: string
    dosyaAdi: string
    saklananAd?: string
    yuklemeTarihi: string
  }[]>([])
  const [durum, setDurum] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const json = await adminFetch(`/basvurular/${id}`)
        if (!cancelled) {
          setData(json.data)
          setBelgeler(json.belgeler ?? [])
          setDurum(String(json.data?.durum ?? ''))
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Detay alınamadı'
        if (!cancelled) {
          setError(msg)
          toast.error(msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  async function saveDurum() {
    setSaving(true)
    setError('')
    try {
      const json = await adminFetch(`/basvurular/${id}/durum`, {
        method: 'PATCH',
        body: JSON.stringify({ durum }),
      })
      setData(json.data)
      setDurum(String(json.data?.durum ?? ''))
      toast.success(
        json.notifyMessage ? String(json.notifyMessage) : 'Durum güncellendi.',
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Durum güncellenemedi'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Yükleniyor…</p>
  if (!data) {
    return (
      <div>
        {error ? <div className="form-alert is-error"><p>{error}</p></div> : null}
        <Link to="/admin">← Listeye dön</Link>
      </div>
    )
  }

  const s = (k: string) => {
    const v = data[k]
    if (v == null || v === '') return '—'
    if (typeof v === 'boolean') return v ? 'Evet' : 'Hayır'
    return String(v)
  }

  const Row = ({ label, value, wide }: { label: string; value: ReactNode; wide?: boolean }) => (
    <div className={`admin-kv ${wide ? 'is-wide' : ''}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )

  const savedDurum = String(data.durum || '')
  const lockedFinal = savedDurum === 'Onaylandi' || savedDurum === 'Reddedildi'

  const durumOptions = (() => {
    const all = ['Gonderildi', 'Inceleniyor', 'Onaylandi', 'Reddedildi'] as const
    const current = savedDurum
    if (current === 'Onaylandi') return ['Onaylandi'] as const
    if (current === 'Reddedildi') return ['Reddedildi'] as const
    return all
  })()

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <Link to="/admin" className="muted">← Başvurular</Link>
          <h1>{s('ad')} {s('soyad')}</h1>
        </div>
        <span className={`admin-pill durum-${savedDurum.toLowerCase()}`}>{s('durum')}</span>
      </div>

      {error ? <div className="form-alert is-error"><p>{error}</p></div> : null}

      <div className="wizard-card admin-detail-actions">
        <label>
          <span>Durum</span>
          <select
            value={durum}
            disabled={lockedFinal || saving}
            onChange={(e) => setDurum(e.target.value)}
          >
            {durumOptions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn"
          disabled={saving || lockedFinal || durum === savedDurum}
          onClick={() => void saveDurum()}
        >
          {saving ? 'Kaydediliyor…' : lockedFinal ? 'Karar kilitli' : 'Durumu kaydet'}
        </button>
        <p className="field-hint" style={{ flexBasis: '100%', margin: 0 }}>
          {lockedFinal
            ? savedDurum === 'Onaylandi'
              ? 'Bu başvuru onaylanmış; reddedilemez ve durum değiştirilemez.'
              : 'Bu başvuru reddedilmiş; onaylanamaz ve durum değiştirilemez.'
            : <>Durumu <strong>Onaylandi</strong> veya <strong>Reddedildi</strong> yaptığınızda başvuru sahibine e-posta ve SMS gider; karar kalıcı kilitlenir.</>}
        </p>
      </div>

      <div className="admin-detail-panel">
        <section className="admin-detail-block">
          <h3>Yüklenen belgeler</h3>
          {belgeler.length === 0 ? (
            <p className="field-hint">Henüz belge yüklenmedi.</p>
          ) : (
            <ul className="admin-belge-list">
              {belgeler.map((b) => (
                <li key={b.id} className="admin-belge-item">
                  <AdminBelgeOnizleme basvuruId={id} belgeId={b.id} dosyaAdi={b.dosyaAdi} />
                  <div className="admin-belge-meta">
                    <span className="admin-belge-kod">{b.belgeKod}</span>
                    <strong className="admin-belge-name">{b.dosyaAdi}</strong>
                    {b.saklananAd ? (
                      <code className="admin-belge-path" title={b.saklananAd}>{b.saklananAd}</code>
                    ) : null}
                    <div className="admin-belge-actions">
                      <button
                        type="button"
                        className="btn btn-ghost-dark btn-small"
                        onClick={() => {
                          void adminOpenBelge(id, b.id).catch((err) => {
                            const msg = err instanceof Error ? err.message : 'Belge açılamadı'
                            setError(msg)
                            toast.error(msg)
                          })
                        }}
                      >
                        Görüntüle
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost-dark btn-small"
                        onClick={() => {
                          void adminDownloadBelge(id, b.id, b.dosyaAdi).catch((err) => {
                            const msg = err instanceof Error ? err.message : 'Belge indirilemedi'
                            setError(msg)
                            toast.error(msg)
                          })
                        }}
                      >
                        İndir
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="admin-detail-panel">
        <section className="admin-detail-block">
          <h3>Kimlik / iletişim</h3>
          <dl className="admin-kv-list">
            <Row label="Başvuru no" value={s('basvuruNo')} />
            <Row label="T.C. kimlik no" value={s('tcKimlikNo')} />
            <Row label="Telefon" value={s('telefon')} />
            <Row label="Doğum tarihi" value={s('dogumTarihi')} />
            <Row label="Doğum yeri" value={s('dogumYeri')} />
            <Row label="Medeni durum" value={s('medeniDurum')} />
            <Row label="E-posta" value={s('eposta')} />
            <Row label="Yakın telefon" value={s('yakinTelefon')} />
            <Row label="Yakınlık / kim olduğu" value={s('yakinKim')} />
            <Row label="İl / İlçe" value={`${s('il')} / ${s('ilce')}`} />
            <Row label="Açık adres" value={s('acikAdres')} wide />
            <Row label="Başvuru sahibi statüsü" value={s('statu')} />
          </dl>
        </section>

        <section className="admin-detail-block">
          <h3>Aile</h3>
          <dl className="admin-kv-list">
            <Row label="Baba adı" value={s('babaAdi')} />
            <Row label="Baba sağ mı?" value={s('babaSagMi')} />
            <Row label="Baba mesleği" value={s('babaMeslegi')} />
            {data.babaSagMi === 'Evet' || data.babaAylikGelir ? (
              <Row label="Baba aylık net geliri" value={`${s('babaAylikGelir')} ₺`} />
            ) : null}
            <Row label="Anne adı" value={s('anneAdi')} />
            <Row label="Anne sağ mı?" value={s('anneSagMi')} />
            <Row label="Anne mesleği" value={s('anneMeslegi')} />
            {data.anneSagMi === 'Evet' || data.anneAylikGelir ? (
              <Row label="Anne aylık net geliri" value={`${s('anneAylikGelir')} ₺`} />
            ) : null}
            <Row label="Anne-baba birlikte mi?" value={s('anneBabaBirlikte')} />
            <Row label="Birlikte yaşadığı kişi sayısı" value={s('birlikteYasadigiKisiler')} />
            {data.medeniDurum === 'Evli' || data.esAylikGelir ? (
              <Row label="Eş aylık net geliri" value={`${s('esAylikGelir')} ₺`} />
            ) : null}
            <Row label="Hane geliri" value={data.haneGeliri ? `${s('haneGeliri')} ₺` : '—'} />
            <Row label="İlk/orta/lisede okuyan kardeş" value={s('kardesIlkokul')} />
            <Row label="Yükseköğretimde okuyan kardeş" value={s('kardesYuksek')} />
            <Row label="Oturduğunuz ev" value={s('oturdugunuzEv')} />
            {data.oturdugunuzEv === 'Kira' || data.evKiraBedeli ? (
              <Row label="Aylık kira bedeli" value={`${s('evKiraBedeli')} ₺`} />
            ) : null}
            <Row label="Ailede araç var mı?" value={s('aracVarMi')} />
            {data.aracVarMi === 'Evet' || data.aracMarkaModel ? (
              <Row label="Araç marka / model" value={s('aracMarkaModel')} />
            ) : null}
            {data.aracVarMi === 'Evet' || data.aracYili ? (
              <Row label="Araç yılı" value={s('aracYili')} />
            ) : null}
            <Row label="Özel durum" value={s('ozelDurumTipi')} />
            {data.ozelDurum ? <Row label="Özel durum açıklaması" value={s('ozelDurum')} wide /> : null}
          </dl>
        </section>

        <section className="admin-detail-block">
          <h3>Eğitim / burs</h3>
          <dl className="admin-kv-list">
            <Row label="Üniversite" value={s('universite')} />
            <Row label="Fakülte" value={s('fakulte')} />
            <Row label="Bölüm" value={s('bolum')} />
            <Row label="Kayıt yılı" value={s('kayitYili')} />
            <Row label="Sınıf" value={s('sinif')} />
            <Row label="Bitirme yılı" value={s('bitirmeYili')} />
            <Row label="Hazırlık" value={s('hazirlik')} />
            <Row label="Aileden uzakta mı?" value={s('ailedenUzakta')} />
            {data.konaklamaDurumu ? <Row label="Konaklama durumu" value={s('konaklamaDurumu')} /> : null}
            {data.konaklamaUcreti ? <Row label="Konaklama ücreti" value={`${s('konaklamaUcreti')} ₺`} /> : null}
            {data.yksSiralamasi ? <Row label="YKS yerleşme sırası" value={s('yksSiralamasi')} /> : null}
            {data.notOrtalamasi ? <Row label="Not ortalaması (GANO)" value={s('notOrtalamasi')} /> : null}
            <Row label="Başka kurumdan burs" value={s('baskaBurs')} />
            {data.baskaBurs === 'Evet' || data.baskaBursMiktari ? (
              <Row label="Burs miktarı" value={`${s('baskaBursMiktari')} ₺`} />
            ) : null}
          </dl>
        </section>

        <section className="admin-detail-block">
          <h3>Beyanlar</h3>
          <dl className="admin-kv-list">
            <Row label="Kazanç getiren işte çalışmıyor" value={s('beyanCalismiyor')} />
            <Row label="Ağır disiplin cezası yok" value={s('beyanDisiplin')} />
            <Row label="Adli sicil yok" value={s('beyanAdliSicil')} />
            <Row label="Örgün öğretim öğrencisi" value={s('beyanOrgunOgretim')} />
            <Row label="KVKK onayı" value={s('kvkkOnay')} />
          </dl>
        </section>

        <section className="admin-detail-block">
          <h3>Kayıt bilgisi</h3>
          <dl className="admin-kv-list">
            <Row label="Oluşturma" value={formatDate(String(data.olusturmaTarihi ?? ''))} />
            <Row label="Güncelleme" value={formatDate(String(data.guncellemeTarihi ?? ''))} />
            <Row label="Gönderim" value={formatDate(String(data.sonGonderimTarihi ?? ''))} />
          </dl>
        </section>
      </div>
    </section>
  )
}

export function AdminConfig() {
  const toast = useAdminToast()
  const [items, setItems] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const json = await adminFetch('/config')
        if (!cancelled) setItems(json.items ?? {})
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Ayarlar alınamadı'
        if (!cancelled) {
          setError(msg)
          toast.error(msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const json = await adminFetch('/config', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      })
      setItems(json.items ?? items)
      toast.success('Ayarlar kaydedildi.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Kayıt başarısız'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  function isPopupOn(value?: string) {
    const v = (value ?? '1').trim().toLowerCase()
    return !(v === '0' || v === 'false' || v === 'hayır' || v === 'kapalı')
  }

  function setField(key: string, value: string) {
    setItems((prev) => ({ ...prev, [key]: value }))
  }

  function Field({
    label,
    hint,
    fieldKey,
    multiline,
  }: {
    label: string
    hint?: string
    fieldKey: string
    multiline?: boolean
  }) {
    return (
      <label className="full">
        <span>{label}</span>
        {multiline ? (
          <textarea
            rows={3}
            value={items[fieldKey] ?? ''}
            onChange={(e) => setField(fieldKey, e.target.value)}
          />
        ) : (
          <input
            value={items[fieldKey] ?? ''}
            onChange={(e) => setField(fieldKey, e.target.value)}
          />
        )}
        {hint ? <small className="field-hint">{hint}</small> : null}
      </label>
    )
  }

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h1>Ayarlar</h1>
      </div>
      {loading ? <p>Yükleniyor…</p> : (
        <form className="admin-config-form" onSubmit={(e) => void save(e)}>
          {error ? <div className="form-alert is-error"><p>{error}</p></div> : null}

          <section className="admin-settings-card">
            <header className="admin-settings-head">
              <h2>Popup ayarları</h2>
              <p>Site açılışında çıkan duyuru penceresi</p>
            </header>
            <div className="form-grid">
              <div className="full admin-toggle-row">
                <div className="admin-toggle-copy">
                  <strong>Açılış popup’ı</strong>
                  <span>Site açıldığında duyuru penceresini göster</span>
                </div>
                <label className="admin-switch">
                  <input
                    type="checkbox"
                    checked={isPopupOn(items.PopupAktif)}
                    onChange={(e) => setField('PopupAktif', e.target.checked ? '1' : '0')}
                  />
                  <span className="admin-switch-track" aria-hidden="true" />
                  <span className="admin-switch-text">
                    {isPopupOn(items.PopupAktif) ? 'Açık' : 'Kapalı'}
                  </span>
                </label>
              </div>
              <Field label="Popup başlığı" fieldKey="PopupBaslik" />
              <Field label="Popup ek metin" fieldKey="PopupMetin" multiline />
            </div>
          </section>

          <section className="admin-settings-card">
            <header className="admin-settings-head">
              <h2>Başvuru dönemi (yeşil bant)</h2>
              <p>Form üstündeki dönem başlığı ve tarih aralığı</p>
            </header>
            <div className="form-grid">
              <Field label="Bant başlığı" fieldKey="BasvuruBaslik" />
              <Field label="Bant notu (isteğe bağlı)" fieldKey="BasvuruBaslikNot" multiline />
              <Field
                label="Başlangıç"
                fieldKey="BasvuruBaslangic"
                hint="örn. 2026-09-07T09:00:00"
              />
              <Field
                label="Bitiş"
                fieldKey="BasvuruBitis"
                hint="örn. 2026-09-30T17:00:00"
              />
              <label>
                <span>En erken doğum tarihi</span>
                <input
                  type="date"
                  value={(items.MinDogumTarihi ?? '').slice(0, 10)}
                  onChange={(e) => setField('MinDogumTarihi', e.target.value)}
                />
                <small className="field-hint">
                  25 yaş kuralı her zaman geçerlidir. Bu tarih doldurulursa, bu tarihten önce doğanlar da başvuru yapamaz.
                </small>
              </label>
            </div>
          </section>

          <section className="admin-settings-card">
            <header className="admin-settings-head">
              <h2>Başvuru formu</h2>
              <p>KVKK adımındaki form başlığı ve açıklama metni</p>
            </header>
            <div className="form-grid">
              <Field label="Form başlığı" fieldKey="BasvuruFormBaslik" />
              <Field label="Form açıklama notu" fieldKey="BasvuruFormBaslikNot" multiline />
            </div>
          </section>

          <div className="wizard-actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Kaydediliyor…' : 'Tüm ayarları kaydet'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export function AdminUsers() {
  const toast = useAdminToast()
  const [adGroups, setAdGroups] = useState<string[]>([])
  const [adDomain, setAdDomain] = useState('')
  const [configUsers, setConfigUsers] = useState<{ userName: string; source: string; canDelete: boolean }[]>([])
  const [panelUsers, setPanelUsers] = useState<{
    userName: string
    source: string
    canDelete: boolean
    olusturan?: string
    olusturmaTarihi?: string
  }[]>([])
  const [newUser, setNewUser] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const json = await adminFetch('/kullanicilar')
      setAdGroups(json.adGroups ?? [])
      setAdDomain(json.adDomain ?? '')
      setConfigUsers(json.configUsers ?? [])
      setPanelUsers(json.panelUsers ?? [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Liste alınamadı'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function addUser(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await adminFetch('/kullanicilar', {
        method: 'POST',
        body: JSON.stringify({ userName: newUser.trim() }),
      })
      setNewUser('')
      toast.success('Kullanıcı eklendi.')
      await load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Eklenemedi'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  async function removeUser(userName: string) {
    if (!confirm(`${userName} panel listesinden silinsin mi?`)) return
    setError('')
    try {
      await adminFetch(`/kullanicilar/${encodeURIComponent(userName)}`, { method: 'DELETE' })
      toast.success('Kullanıcı silindi.')
      await load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Silinemedi'
      setError(msg)
      toast.error(msg)
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h1>Panel kullanıcıları</h1>
      </div>
      <p className="wizard-lead">
        Panele kimlerin girebileceğini yönetin. AD grubu üyeleri + aşağıdaki listeler yetkilidir.
      </p>

      {error ? <div className="form-alert is-error"><p>{error}</p></div> : null}

      <div className="wizard-card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>AD yetkisi</h3>
        <p className="muted" style={{ margin: '0 0 0.5rem' }}>Domain: {adDomain || '—'}</p>
        <p style={{ margin: 0 }}>
          Gruplar:{' '}
          {adGroups.length ? adGroups.join(', ') : 'Tanımlı grup yok (yalnızca kullanıcı listeleri)'}
        </p>
      </div>

      <form className="wizard-card admin-detail-actions" onSubmit={(e) => void addUser(e)}>
        <label style={{ flex: 1, minWidth: 220 }}>
          <span>Yeni kullanıcı (AD hesap adı)</span>
          <input
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            placeholder="ör. ali.veli"
            required
          />
        </label>
        <button type="submit" className="btn" disabled={saving || loading}>
          {saving ? 'Ekleniyor…' : 'Ekle'}
        </button>
      </form>

      <div className="admin-table-wrap wizard-card" style={{ marginTop: '1rem' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Kaynak</th>
              <th>Ekleyen</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4}>Yükleniyor…</td></tr>
            ) : (
              <>
                {configUsers.map((u) => (
                  <tr key={`c-${u.userName}`}>
                    <td>{u.userName}</td>
                    <td>appsettings</td>
                    <td>—</td>
                    <td className="muted">Sabit</td>
                  </tr>
                ))}
                {panelUsers.map((u) => (
                  <tr key={`p-${u.userName}`}>
                    <td>{u.userName}</td>
                    <td>panel</td>
                    <td>{u.olusturan || '—'}{u.olusturmaTarihi ? ` · ${formatDate(u.olusturmaTarihi)}` : ''}</td>
                    <td>
                      <button type="button" className="linkish" onClick={() => void removeUser(u.userName)}>
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
                {!configUsers.length && !panelUsers.length ? (
                  <tr><td colSpan={4}>Henüz kullanıcı yok.</td></tr>
                ) : null}
              </>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

type HeroFormState = {
  baslik: string
  aciklama: string
  ustBaslik: string
  butonMetin: string
  butonLink: string
  sira: string
  aktif: boolean
  resim: File | null
  resimKaldir: boolean
}

const emptyHeroForm = (): HeroFormState => ({
  baslik: '',
  aciklama: '',
  ustBaslik: '',
  butonMetin: '',
  butonLink: '',
  sira: '0',
  aktif: true,
  resim: null,
  resimKaldir: false,
})

const HERO_LINK_OPTIONS = [
  { value: '/basvuru/form', label: 'Burs başvurusu (form)' },
  //{ value: '/basvuru/istatistikler', label: 'İstatistikler' },
  { value: '/basvuru', label: 'Başvuru genel bilgilendirme' },
  { value: '/basvuru/sss', label: 'Burs SSS' },
  { value: '/basvuru/belgeler', label: 'Gerekli belgeler' },
  { value: '/kurumsal/hakkinda', label: 'Kurumsal — Hakkında' },
  { value: '/kurumsal/tarihce', label: 'Kurumsal — Tarihçe' },
  { value: '/medya/faaliyet-raporu', label: 'Medya — Faaliyet raporu' },
  { value: '/medya/haber', label: 'Medya — Haber' },
  { value: '/medya/basin-bultenleri', label: 'Medya — Basın bültenleri' },
  { value: '/medya/kurumsal-kimlik', label: 'Medya — Kurumsal kimlik' },
  { value: '/iletisim', label: 'İletişim' },
  { value: '/yasal/kvkk', label: 'KVKK metni' },
  { value: '/yasal/gizlilik-politikasi', label: 'Gizlilik politikası' },
  { value: '/yasal/cerez-politikasi', label: 'Çerez politikası' },
  { value: '/#ust', label: 'Sayfa başı' },
] as const

const HERO_LINK_CUSTOM = '__custom__'

function heroLinkMode(link: string) {
  const trimmed = link.trim()
  if (!trimmed) return { mode: '' as string, custom: '' }
  if (HERO_LINK_OPTIONS.some((o) => o.value === trimmed)) {
    return { mode: trimmed, custom: '' }
  }
  return { mode: HERO_LINK_CUSTOM, custom: trimmed }
}

export function AdminHero() {
  const toast = useAdminToast()
  const [items, setItems] = useState<HeroSlide[]>([])
  const [form, setForm] = useState<HeroFormState>(emptyHeroForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const json = await adminFetch('/hero')
      setItems(json.items ?? [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Liste alınamadı'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    if (!form.resim) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(form.resim)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [form.resim])

  function startEdit(slide: HeroSlide) {
    setEditingId(slide.id)
    setForm({
      baslik: slide.baslik ?? '',
      aciklama: slide.aciklama ?? '',
      ustBaslik: slide.ustBaslik ?? '',
      butonMetin: slide.butonMetin ?? '',
      butonLink: slide.butonLink ?? '',
      sira: String(slide.sira ?? 0),
      aktif: slide.aktif !== false,
      resim: null,
      resimKaldir: false,
    })
    setError('')
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyHeroForm())
    setError('')
  }

  function buildFormData(from: HeroFormState | HeroSlide, aktifOverride?: boolean) {
    const fd = new FormData()
    if ('baslik' in from && typeof (from as HeroFormState).sira === 'string') {
      const f = from as HeroFormState
      fd.append('baslik', f.baslik.trim())
      fd.append('aciklama', f.aciklama.trim())
      fd.append('ustBaslik', f.ustBaslik.trim())
      fd.append('butonMetin', f.butonMetin.trim())
      fd.append('butonLink', f.butonLink.trim())
      fd.append('sira', f.sira || '0')
      fd.append('aktif', (aktifOverride ?? f.aktif) ? 'true' : 'false')
      if (f.resim) fd.append('resim', f.resim)
      if (f.resimKaldir) fd.append('resimKaldir', 'true')
    } else {
      const s = from as HeroSlide
      fd.append('baslik', (s.baslik ?? '').trim())
      fd.append('aciklama', (s.aciklama ?? '').trim())
      fd.append('ustBaslik', (s.ustBaslik ?? '').trim())
      fd.append('butonMetin', (s.butonMetin ?? '').trim())
      fd.append('butonLink', (s.butonLink ?? '').trim())
      fd.append('sira', String(s.sira ?? 0))
      fd.append('aktif', (aktifOverride ?? s.aktif) ? 'true' : 'false')
    }
    return fd
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        await adminFetch(`/hero/${editingId}`, { method: 'PUT', body: buildFormData(form) })
        toast.success('Slayt güncellendi.')
      } else {
        await adminFetch('/hero', { method: 'POST', body: buildFormData(form) })
        toast.success('Slayt eklendi.')
      }
      resetForm()
      await load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Kaydedilemedi'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  async function toggleAktif(slide: HeroSlide) {
    setError('')
    try {
      await adminFetch(`/hero/${slide.id}`, {
        method: 'PUT',
        body: buildFormData(slide, !slide.aktif),
      })
      toast.success(slide.aktif ? 'Slayt pasife alındı.' : 'Slayt yayına alındı.')
      if (editingId === slide.id) {
        setForm((f) => ({ ...f, aktif: !slide.aktif }))
      }
      await load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Durum güncellenemedi'
      setError(msg)
      toast.error(msg)
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu slayt silinsin mi?')) return
    setError('')
    try {
      await adminFetch(`/hero/${id}`, { method: 'DELETE' })
      toast.success('Slayt silindi.')
      if (editingId === id) resetForm()
      await load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Silinemedi'
      setError(msg)
      toast.error(msg)
    }
  }

  const editingSlide = editingId ? items.find((x) => x.id === editingId) : null

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h1>Hero / Duyuru</h1>
      </div>
      <p className="wizard-lead">
        Ana sayfada otomatik kayan haber ve duyurular. Buton ve notlar isteğe bağlıdır; pasif slaytlar sitede görünmez.
      </p>

      {error ? <div className="form-alert is-error"><p>{error}</p></div> : null}

      <form className="wizard-card admin-settings-card" onSubmit={(e) => void save(e)}>
        <header className="admin-settings-head">
          <h2>{editingId ? 'Slayt düzenle' : 'Yeni slayt'}</h2>
        </header>

        <div className="form-grid">
          <label>
            <span>Üst başlık</span>
            <input
              value={form.ustBaslik}
              onChange={(e) => setForm((f) => ({ ...f, ustBaslik: e.target.value }))}
              placeholder="örn. DUYURU · 2026"
            />
            <small className="field-hint">Sitede en üstte, küçük altın renkli satır.</small>
          </label>
          <label>
            <span>Sıra</span>
            <input
              type="number"
              value={form.sira}
              onChange={(e) => setForm((f) => ({ ...f, sira: e.target.value }))}
            />
          </label>
          <label className="full">
            <span>Başlık</span>
            <input
              value={form.baslik}
              onChange={(e) => setForm((f) => ({ ...f, baslik: e.target.value }))}
              placeholder="örn. Birlikte Çok Daha Güçlüyüz"
            />
            <small className="field-hint">Sitede büyük ana yazı. Ana mesajı buraya yazın.</small>
          </label>
          <label className="full">
            <span>Açıklama</span>
            <textarea
              rows={3}
              value={form.aciklama}
              onChange={(e) => setForm((f) => ({ ...f, aciklama: e.target.value }))}
              placeholder="İsteğe bağlı kısa destek metni"
            />
            <small className="field-hint">Başlığın altında, daha küçük paragraf. Boş bırakılabilir.</small>
          </label>
          <label>
            <span>Buton metni (isteğe bağlı)</span>
            <input
              value={form.butonMetin}
              onChange={(e) => setForm((f) => ({ ...f, butonMetin: e.target.value }))}
              placeholder="Boş bırakılırsa buton gösterilmez"
            />
          </label>
          <label>
            <span>Buton nereye gitsin?</span>
            <select
              value={heroLinkMode(form.butonLink).mode}
              disabled={!form.butonMetin.trim()}
              onChange={(e) => {
                const v = e.target.value
                if (v === HERO_LINK_CUSTOM) {
                  setForm((f) => ({
                    ...f,
                    butonLink: heroLinkMode(f.butonLink).custom || 'https://',
                  }))
                  return
                }
                setForm((f) => ({ ...f, butonLink: v }))
              }}
            >
              <option value="">Seçin…</option>
              {HERO_LINK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
              <option value={HERO_LINK_CUSTOM}>Özel adres (URL)</option>
            </select>
          </label>
          {form.butonMetin.trim() && heroLinkMode(form.butonLink).mode === HERO_LINK_CUSTOM ? (
            <label className="full">
              <span>Özel adres</span>
              <input
                value={form.butonLink}
                onChange={(e) => setForm((f) => ({ ...f, butonLink: e.target.value }))}
                placeholder="https://ornek.com/sayfa"
              />
              <small className="field-hint">Harici bir site veya özel yol yazabilirsiniz.</small>
            </label>
          ) : null}
          <label className="full">
            <span>Arka plan (görsel veya video)</span>
            <input
              key={`hero-resim-${editingId ?? 'new'}-${form.resimKaldir ? 'off' : 'on'}-${form.resim?.name ?? 'empty'}`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  resim: e.target.files?.[0] ?? null,
                  resimKaldir: false,
                }))
              }
            />
            <small className="field-hint">
              Görsel: jpg/png/webp/gif (max 5 MB). Video: mp4/webm (max 40 MB).
            </small>
          </label>
        </div>

        {(previewUrl || (editingSlide?.resimUrl && !form.resimKaldir)) ? (
          <div className="admin-hero-preview">
            {isHeroVideo(previewUrl || editingSlide?.resimUrl) || form.resim?.type.startsWith('video/') ? (
              <video
                src={previewUrl || editingSlide?.resimUrl || ''}
                muted
                loop
                playsInline
                autoPlay
              />
            ) : (
              <img src={previewUrl || editingSlide?.resimUrl || ''} alt="" />
            )}
            <button
              type="button"
              className="linkish admin-hero-remove"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  resim: null,
                  resimKaldir: Boolean(editingId && editingSlide?.resimUrl),
                }))
              }
            >
              Medyayı kaldır
            </button>
          </div>
        ) : null}

        <div className="admin-toggle-row" style={{ marginTop: '1rem' }}>
          <div className="admin-toggle-copy">
            <strong>Aktif</strong>
            <span>Pasif slaytlar sitede görünmez</span>
          </div>
          <label className="admin-switch">
            <input
              type="checkbox"
              checked={form.aktif}
              onChange={(e) => setForm((f) => ({ ...f, aktif: e.target.checked }))}
            />
            <span className="admin-switch-track" />
            <span className="admin-switch-text">{form.aktif ? 'Aktif' : 'Pasif'}</span>
          </label>
        </div>

        <div className="wizard-actions">
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Kaydediliyor…' : editingId ? 'Güncelle' : 'Slayt ekle'}
          </button>
          {editingId ? (
            <button type="button" className="btn btn-ghost-dark" onClick={resetForm}>
              Vazgeç
            </button>
          ) : null}
        </div>
      </form>

      <div className="admin-table-wrap wizard-card" style={{ marginTop: '1.25rem' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Medya</th>
              <th>Başlık</th>
              <th>Sıra</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}>Yükleniyor…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5}>Henüz slayt yok.</td></tr>
            ) : (
              items.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.resimUrl ? (
                      isHeroVideo(s.resimUrl) ? (
                        <video className="admin-hero-thumb" src={s.resimUrl} muted playsInline />
                      ) : (
                        <img className="admin-hero-thumb" src={s.resimUrl} alt="" />
                      )
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    <strong>{s.baslik}</strong>
                    {s.ustBaslik ? <div className="muted">{s.ustBaslik}</div> : null}
                  </td>
                  <td>{s.sira}</td>
                  <td>
                    <label className="admin-switch">
                      <input
                        type="checkbox"
                        checked={s.aktif !== false}
                        onChange={() => void toggleAktif(s)}
                      />
                      <span className="admin-switch-track" />
                      <span className="admin-switch-text">
                        {s.aktif !== false ? 'Aktif' : 'Pasif'}
                      </span>
                    </label>
                  </td>
                  <td className="admin-row-actions">
                    <button type="button" className="linkish" onClick={() => startEdit(s)}>
                      Düzenle
                    </button>
                    <button type="button" className="linkish" onClick={() => void remove(s.id)}>
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function formatDate(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('tr-TR')
}
