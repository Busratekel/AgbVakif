import { useEffect, useState } from 'react'
import { BASVURU_BELGELER, FORM_API_URL } from '../config'
import type { BasvuruData } from '../basvuruTypes'

type Belge = {
  id: string
  belgeKod: string
  dosyaAdi: string
  yuklemeTarihi: string
}

const MAX_BYTES = 8 * 1024 * 1024

const DURUM_ETIKET: Record<string, string> = {
  Gonderildi: 'Gönderildi',
  Inceleniyor: 'İnceleniyor',
  Onaylandi: 'Onaylandı',
  Reddedildi: 'Reddedildi',
}

function rowsOf(item: { text: string; alt?: string[] }) {
  if (item.alt && item.alt.length > 0) return item.alt
  return [item.text]
}

function isImageName(name: string) {
  return /\.(jpe?g|png|gif|webp)$/i.test(name)
}

async function readError(response: Response) {
  const raw = await response.text()
  try {
    const json = JSON.parse(raw)
    if (json?.message) return String(json.message)
  } catch {
    /* ignore */
  }
  return `Belge açılamadı (${response.status})`
}

export function BasvuruProfil({
  data,
  accessToken,
  donemAcik,
  showBelgeler = true,
  onEdit,
}: {
  data: BasvuruData
  accessToken: string
  donemAcik: boolean
  showBelgeler?: boolean
  onEdit: () => void
}) {
  const [belgeler, setBelgeler] = useState<Belge[]>([])
  const [error, setError] = useState('')
  const [okMsg, setOkMsg] = useState('')
  const [busy, setBusy] = useState('')
  const [viewer, setViewer] = useState<{ url: string; title: string; image: boolean } | null>(null)

  const durum = data.durum ?? ''
  const kilitli = durum === 'Onaylandi' || durum === 'Reddedildi'
  const canEdit = donemAcik && !kilitli
  const canUpload = durum === 'Onaylandi'

  const requiredCodes = BASVURU_BELGELER.flatMap((item) => rowsOf(item))
  const yuklenenSayisi = requiredCodes.filter((kod) => belgeler.some((b) => b.belgeKod === kod)).length
  const toplamGerekli = requiredCodes.length

  useEffect(() => {
    if (!showBelgeler) return
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch(`${FORM_API_URL}/basvuru/me/belgeler`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
        })
        const json = await response.json()
        if (!cancelled && response.ok && json.success) {
          setBelgeler(json.items ?? [])
        }
      } catch {
        if (!cancelled) setError('Belgeler yüklenemedi.')
      }
    })()
    return () => { cancelled = true }
  }, [accessToken, showBelgeler])

  useEffect(() => () => {
    if (viewer) URL.revokeObjectURL(viewer.url)
  }, [viewer])

  function findBelge(kod: string) {
    return belgeler.find((b) => b.belgeKod === kod)
  }

  async function upload(kod: string, file: File) {
    setError('')
    setOkMsg('')

    if (file.size > MAX_BYTES) {
      setError('Dosya en fazla 8 MB olabilir.')
      return
    }

    setBusy(kod)
    try {
      const body = new FormData()
      body.append('belgeKod', kod)
      body.append('dosya', file)
      const response = await fetch(`${FORM_API_URL}/basvuru/me/belgeler`, {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
        body,
      })
      const json = await response.json().catch(() => ({}))
      if (!response.ok || !json.success) {
        throw new Error(json.message || `Belge kaydedilemedi (${response.status})`)
      }
      setBelgeler((prev) => [...prev.filter((b) => b.belgeKod !== kod), json.item])
      setOkMsg('Belge yüklendi.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Belge kaydedilemedi')
    } finally {
      setBusy('')
    }
  }

  async function remove(belge: Belge) {
    setError('')
    setOkMsg('')
    setBusy(belge.belgeKod)
    try {
      const response = await fetch(`${FORM_API_URL}/basvuru/me/belgeler/${belge.id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
      })
      const json = await response.json().catch(() => ({}))
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Belge silinemedi')
      }
      setBelgeler((prev) => prev.filter((b) => b.id !== belge.id))
      setOkMsg('Belge silindi.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Belge silinemedi')
    } finally {
      setBusy('')
    }
  }

  async function openSaved(belge: Belge) {
    setError('')
    try {
      const response = await fetch(`${FORM_API_URL}/basvuru/me/belgeler/${belge.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!response.ok) throw new Error(await readError(response))
      const blob = await response.blob()
      if (viewer) URL.revokeObjectURL(viewer.url)
      const url = URL.createObjectURL(blob)
      setViewer({
        url,
        title: belge.dosyaAdi,
        image: isImageName(belge.dosyaAdi) || blob.type.startsWith('image/'),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Belge açılamadı')
    }
  }

  return (
    <>
      <div className="wizard-title-row">
        <h2>Başvurum</h2>
        <span className={`admin-pill durum-${durum.toLowerCase()}`}>
          {DURUM_ETIKET[durum] ?? durum}
        </span>
      </div>
      {data.basvuruNo ? (
        <p className="wizard-lead">Başvuru no: <strong>{data.basvuruNo}</strong></p>
      ) : null}

      <dl className="profil-ozet">
        <div><dt>Ad soyad</dt><dd>{data.ad} {data.soyad}</dd></div>
        <div><dt>E-posta</dt><dd>{data.eposta || '—'}</dd></div>
        <div><dt>Telefon</dt><dd>{data.telefonMasked || '—'}</dd></div>
        {showBelgeler ? (
          <>
            <div><dt>Üniversite</dt><dd>{data.universite === 'Diğer' ? data.universiteAdi : data.universite || '—'}</dd></div>
            <div><dt>Fakülte</dt><dd>{data.fakulte === 'Diğer' ? data.fakulteAdi : data.fakulte || '—'}</dd></div>
            <div><dt>Bölüm</dt><dd>{data.bolum === 'Diğer' ? data.bolumAdi : data.bolum || '—'}</dd></div>
            <div><dt>Sınıf</dt><dd>{data.sinif || '—'}</dd></div>
          </>
        ) : (
          <>
            <div><dt>Kategori</dt><dd>{data.kategori || '—'}</dd></div>
            <div><dt>Talep tutarı</dt><dd>{data.talepTutari ? `${data.talepTutari} ₺` : '—'}</dd></div>
            <div><dt>Talep özeti</dt><dd>{data.talepOzeti || '—'}</dd></div>
          </>
        )}
      </dl>

      {canEdit ? (
        <div className="profil-actions">
          <button type="button" className="btn btn-small" onClick={onEdit}>
            Bilgileri güncelle
          </button>
        </div>
      ) : (
        <p className="wizard-lead">
          {durum === 'Reddedildi'
            ? 'Bu başvuru reddedildiği için bilgi ve belge değiştirilemez.'
            : durum === 'Onaylandi'
              ? showBelgeler
                ? 'Başvurunuz onaylandı. Bilgiler değiştirilemez; aşağıdaki belgeleri yüklemeniz yeterlidir.'
                : 'Başvurunuz onaylandı. Bilgiler değiştirilemez.'
              : 'Başvuru dönemi kapalı olduğu için bilgiler güncellenemez.'}
        </p>
      )}

      {showBelgeler && canUpload ? (
        <section className="belge-panel">
          <div className="belge-panel-head">
            <div>
              <h3 className="wizard-sub">İstenen belgeler</h3>
              <p className="wizard-lead">
                Her satırda <strong>Dosya seç</strong>e basıp belgenizi seçin; seçimden hemen sonra otomatik kaydedilir.
                PDF / JPG / PNG · en fazla 8 MB.
              </p>
            </div>
            <p className={`belge-progress ${yuklenenSayisi === toplamGerekli ? 'is-complete' : ''}`}>
              <strong>{yuklenenSayisi}/{toplamGerekli}</strong> yüklendi
            </p>
          </div>

          {error ? <div className="form-alert is-error"><p>{error}</p></div> : null}
          {okMsg ? <div className="form-alert is-success"><p>{okMsg}</p></div> : null}

          <ul className="belge-upload-list">
            {BASVURU_BELGELER.map((item) => (
              <li key={item.text}>
                <p className="belge-card-title">{item.text}</p>
                {rowsOf(item).map((kod) => {
                  const mevcut = findBelge(kod)
                  const rowBusy = busy === kod
                  return (
                    <div className={`belge-upload-card ${mevcut ? 'is-done' : 'is-missing'}`} key={kod}>
                      {item.alt ? <span className="belge-alt-label">{kod}</span> : null}

                      <div className="belge-upload-main">
                        <div className="belge-upload-status">
                          {rowBusy ? (
                            <span className="belge-badge is-busy">Yükleniyor…</span>
                          ) : mevcut ? (
                            <span className="belge-badge is-done">Yüklendi</span>
                          ) : (
                            <span className="belge-badge is-missing">Eksik</span>
                          )}
                          {mevcut ? (
                            <span className="belge-file-name" title={mevcut.dosyaAdi}>{mevcut.dosyaAdi}</span>
                          ) : (
                            <span className="belge-file-hint">Henüz dosya yok</span>
                          )}
                        </div>

                        <div className="belge-upload-actions">
                          {mevcut && !rowBusy ? (
                            <>
                              <button type="button" className="btn btn-ghost-dark btn-small" onClick={() => void openSaved(mevcut)}>
                                Görüntüle
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost-dark btn-small"
                                onClick={() => void remove(mevcut)}
                              >
                                Sil
                              </button>
                            </>
                          ) : null}

                          <label className={`btn btn-small belge-file ${rowBusy ? 'is-disabled' : ''}`}>
                            {rowBusy ? 'Bekleyin…' : mevcut ? 'Değiştir' : 'Dosya seç'}
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                              disabled={rowBusy}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                e.target.value = ''
                                if (file) void upload(kod, file)
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </li>
            ))}
          </ul>
        </section>
      ) : durum !== 'Reddedildi' ? (
        <p className="wizard-lead">
          Belge yükleme, başvurunuz onaylandıktan sonra açılır.
        </p>
      ) : null}

      {viewer ? (
        <div className="belge-viewer-overlay" role="dialog" aria-modal="true">
          <div className="belge-viewer">
            <div className="belge-viewer-head">
              <strong>{viewer.title}</strong>
              <button
                type="button"
                className="btn btn-ghost-dark btn-small"
                onClick={() => {
                  URL.revokeObjectURL(viewer.url)
                  setViewer(null)
                }}
              >
                Kapat
              </button>
            </div>
            {viewer.image ? (
              <img className="belge-viewer-img" src={viewer.url} alt={viewer.title} />
            ) : (
              <iframe className="belge-viewer-frame" title={viewer.title} src={viewer.url} />
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
