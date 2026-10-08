import { useEffect, useState } from 'react'
import { BASVURU_BELGELER, FORM_API_URL } from '../config'
import type { BasvuruData } from '../basvuruTypes'

type Belge = {
  id: string
  belgeKod: string
  dosyaAdi: string
  yuklemeTarihi: string
}

const MAX_BYTES = 5 * 1024 * 1024
const MAX_FILES_PER_KOD = 5

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

function mapBelge(raw: Record<string, unknown> | Belge): Belge | null {
  const id = String(raw.id ?? (raw as { Id?: unknown }).Id ?? '')
  const belgeKod = String(raw.belgeKod ?? (raw as { BelgeKod?: unknown }).BelgeKod ?? '')
  const dosyaAdi = String(raw.dosyaAdi ?? (raw as { DosyaAdi?: unknown }).DosyaAdi ?? '')
  const yuklemeTarihi = String(
    raw.yuklemeTarihi ?? (raw as { YuklemeTarihi?: unknown }).YuklemeTarihi ?? '',
  )
  if (!id || !belgeKod) return null
  return { id, belgeKod, dosyaAdi, yuklemeTarihi }
}

export function BasvuruProfil({
  data,
  accessToken,
  donemAcik,
  showBelgeler = true,
  onEdit,
  onBackToList,
}: {
  data: BasvuruData
  accessToken: string
  donemAcik: boolean
  showBelgeler?: boolean
  onEdit: () => void
  onBackToList?: () => void
}) {
  const [belgeler, setBelgeler] = useState<Belge[]>([])
  const [error, setError] = useState('')
  const [okMsg, setOkMsg] = useState('')
  const [busy, setBusy] = useState('')
  const [viewer, setViewer] = useState<{ url: string; title: string; image: boolean } | null>(null)

  const durum = data.durum ?? ''
  const guncelYil = new Date().getFullYear()
  const guncelDonemKaydi = data.donemYili === guncelYil
  const kilitli = durum === 'Onaylandi' || durum === 'Reddedildi'
  const canEdit = donemAcik && !kilitli && guncelDonemKaydi
  const onayli = durum === 'Onaylandi'
  const canUpload = onayli && donemAcik && guncelDonemKaydi
  // Belge paneli yalnızca bu yılın onaylı kaydında; eski dönem salt okunur profil
  const showBelgePanel = showBelgeler && onayli && guncelDonemKaydi

  const requiredCodes = BASVURU_BELGELER.flatMap((item) => rowsOf(item))
  const yuklenenSayisi = requiredCodes.filter((kod) => belgeler.some((b) => b.belgeKod === kod)).length
  const toplamGerekli = requiredCodes.length

  async function reloadBelgeler() {
    const response = await fetch(`${FORM_API_URL}/basvuru/me/belgeler`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
    })
    const json = await response.json().catch(() => ({}))
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Belgeler yüklenemedi.')
    }
    const items = Array.isArray(json.items) ? json.items : []
    const mapped = items
      .map((x: Record<string, unknown>) => mapBelge(x))
      .filter((x: Belge | null): x is Belge => x != null)
    setBelgeler(mapped)
    return mapped
  }

  useEffect(() => {
    if (!showBelgeler) return
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch(`${FORM_API_URL}/basvuru/me/belgeler`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
        })
        const json = await response.json().catch(() => ({}))
        if (cancelled) return
        if (!response.ok || !json.success) {
          setError('Belgeler yüklenemedi.')
          return
        }
        const items = Array.isArray(json.items) ? json.items : []
        setBelgeler(
          items
            .map((x: Record<string, unknown>) => mapBelge(x))
            .filter((x: Belge | null): x is Belge => x != null),
        )
      } catch {
        if (!cancelled) setError('Belgeler yüklenemedi.')
      }
    })()
    return () => { cancelled = true }
  }, [accessToken, showBelgeler])

  useEffect(() => () => {
    if (viewer) URL.revokeObjectURL(viewer.url)
  }, [viewer])

  function findBelgeler(kod: string) {
    return belgeler.filter((b) => b.belgeKod === kod)
  }

  async function upload(kod: string, files: File[]) {
    setError('')
    setOkMsg('')

    if (files.length === 0) return

    for (const file of files) {
      if (file.size > MAX_BYTES) {
        setError(`“${file.name}” en fazla 5 MB olabilir.`)
        return
      }
    }

    const mevcut = findBelgeler(kod)
    const kalan = MAX_FILES_PER_KOD - mevcut.length
    if (kalan <= 0) {
      setError(`Bu belge için en fazla ${MAX_FILES_PER_KOD} dosya yükleyebilirsiniz.`)
      return
    }

    const toUpload = files.slice(0, kalan)
    const truncated = files.length > kalan

    setBusy(kod)
    try {
      const body = new FormData()
      body.append('belgeKod', kod)
      for (const file of toUpload) {
        body.append('dosya', file, file.name)
      }
      const response = await fetch(`${FORM_API_URL}/basvuru/me/belgeler`, {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
        body,
      })
      const json = await response.json().catch(() => ({}))
      if (!response.ok || !json.success) {
        throw new Error(json.message || `Belge kaydedilemedi (${response.status})`)
      }
      await reloadBelgeler()
      const savedCount = Array.isArray(json.items) ? json.items.length : toUpload.length
      if (truncated || json.truncated) {
        setError(`En fazla ${MAX_FILES_PER_KOD} dosya yüklenebilir; ${savedCount} dosya eklendi.`)
      }
      setOkMsg(savedCount === 1
        ? 'Belge yüklendi. İsterseniz aynı satırdan daha fazla ekleyebilirsiniz.'
        : `${savedCount} belge yüklendi.`)
    } catch (e) {
      try {
        await reloadBelgeler()
      } catch {
        /* ignore */
      }
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
      await reloadBelgeler()
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

  const tipLabel = data.basvuruTipi === 'Destek' ? 'Yardım' : 'Burs'
  const universiteLabel = data.universite === 'Diğer' ? data.universiteAdi : data.universite
  const fakulteLabel = data.fakulte === 'Diğer' ? data.fakulteAdi : data.fakulte
  const bolumLabel = data.bolum === 'Diğer' ? data.bolumAdi : data.bolum

  return (
    <>
      {onBackToList ? (
        <p className="profil-back">
          <button type="button" className="linkish" onClick={onBackToList}>
            ← Tüm başvurularıma dön
          </button>
        </p>
      ) : null}

      <header className="profil-head">
        <div className="wizard-title-row">
          <h2>Başvurum</h2>
          <span className={`admin-pill durum-${durum.toLowerCase()}`}>
            {DURUM_ETIKET[durum] ?? durum}
          </span>
        </div>
        {(data.basvuruNo || data.donemYili || data.basvuruTipi) ? (
          <ul className="profil-meta">
            {data.basvuruTipi ? (
              <li>
                <span className="profil-meta-label">Tip</span>
                <strong>{tipLabel}</strong>
              </li>
            ) : null}
            {data.basvuruNo ? (
              <li>
                <span className="profil-meta-label">Başvuru no</span>
                <strong>{data.basvuruNo}</strong>
              </li>
            ) : null}
            {data.donemYili ? (
              <li>
                <span className="profil-meta-label">Dönem</span>
                <strong>{data.donemYili}</strong>
              </li>
            ) : null}
          </ul>
        ) : null}
      </header>

      <div className="profil-summary">
        <section className="profil-block">
          <h3 className="profil-block-title">İletişim</h3>
          <dl className="profil-ozet">
            <div>
              <dt>Ad soyad</dt>
              <dd>{data.ad} {data.soyad}</dd>
            </div>
            <div>
              <dt>E-posta</dt>
              <dd>{data.eposta || '—'}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>{data.telefonMasked || '—'}</dd>
            </div>
          </dl>
        </section>

        {showBelgeler ? (
          <section className="profil-block">
            <h3 className="profil-block-title">Eğitim</h3>
            <dl className="profil-ozet">
              <div>
                <dt>Üniversite</dt>
                <dd>{universiteLabel || '—'}</dd>
              </div>
              <div>
                <dt>Fakülte</dt>
                <dd>{fakulteLabel || '—'}</dd>
              </div>
              <div className="profil-ozet-wide">
                <dt>Bölüm</dt>
                <dd>{bolumLabel || '—'}</dd>
              </div>
              <div>
                <dt>Sınıf</dt>
                <dd>{data.sinif || '—'}</dd>
              </div>
            </dl>
          </section>
        ) : (
          <section className="profil-block">
            <h3 className="profil-block-title">Talep</h3>
            <dl className="profil-ozet">
              <div>
                <dt>Kategori</dt>
                <dd>{data.kategori || '—'}</dd>
              </div>
              <div>
                <dt>Talep tutarı</dt>
                <dd>{data.talepTutari ? `${data.talepTutari} ₺` : '—'}</dd>
              </div>
              <div className="profil-ozet-wide">
                <dt>Talep özeti</dt>
                <dd>{data.talepOzeti || '—'}</dd>
              </div>
            </dl>
          </section>
        )}
      </div>

      {canEdit ? (
        <div className="profil-actions">
          <button type="button" className="btn btn-small" onClick={onEdit}>
            Bilgileri güncelle
          </button>
        </div>
      ) : (
        <p className="profil-note">
          {!guncelDonemKaydi
            ? 'Bu başvuru önceki döneme ait. Bilgi ve belge güncellenemez.'
            : durum === 'Reddedildi'
              ? 'Bu başvuru reddedildiği için bilgi ve belge değiştirilemez.'
              : durum === 'Onaylandi'
                ? showBelgeler && canUpload
                  ? 'Başvurunuz onaylandı. Bilgiler değiştirilemez; aşağıdaki belgeleri yüklemeniz yeterlidir.'
                  : 'Başvurunuz onaylandı. Bilgiler değiştirilemez.'
                : 'Başvuru dönemi kapalı olduğu için bilgiler güncellenemez.'}
        </p>
      )}

      {showBelgePanel ? (
        <section className="belge-panel">
          <div className="belge-panel-head">
            <div>
              <h3 className="wizard-sub">İstenen belgeler</h3>
              {canUpload ? (
                <p className="wizard-lead">
                  Her belge türü için en fazla <strong>{MAX_FILES_PER_KOD}</strong> dosya yükleyebilirsiniz.
                </p>
              ) : null}
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
                  const mevcutlar = findBelgeler(kod)
                  const rowBusy = busy === kod
                  const dolu = mevcutlar.length >= MAX_FILES_PER_KOD
                  return (
                    <div
                      className={`belge-upload-card ${mevcutlar.length > 0 ? 'is-done' : 'is-missing'}`}
                      key={kod}
                    >
                      {item.alt ? <span className="belge-alt-label">{kod}</span> : null}

                      <div className="belge-upload-main">
                        <div className="belge-upload-status">
                          {rowBusy ? (
                            <span className="belge-badge is-busy">Yükleniyor…</span>
                          ) : mevcutlar.length > 0 ? (
                            <span className="belge-badge is-done">
                              {mevcutlar.length}/{MAX_FILES_PER_KOD} dosya
                            </span>
                          ) : (
                            <span className="belge-badge is-missing">Eksik</span>
                          )}
                          {mevcutlar.length === 0 && !rowBusy ? (
                            <span className="belge-file-hint">Henüz dosya yok</span>
                          ) : null}
                        </div>
                      </div>

                      {mevcutlar.length > 0 ? (
                        <ul className="belge-file-list">
                          {mevcutlar.map((belge) => (
                            <li key={belge.id} className="belge-file-row">
                              <span className="belge-file-name" title={belge.dosyaAdi}>
                                {belge.dosyaAdi}
                              </span>
                              <div className="belge-upload-actions">
                                <button
                                  type="button"
                                  className="btn btn-ghost-dark btn-small"
                                  disabled={rowBusy}
                                  onClick={() => void openSaved(belge)}
                                >
                                  Görüntüle
                                </button>
                                {canUpload ? (
                                  <button
                                    type="button"
                                    className="btn btn-ghost-dark btn-small"
                                    disabled={rowBusy}
                                    onClick={() => void remove(belge)}
                                  >
                                    Sil
                                  </button>
                                ) : null}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {canUpload ? (
                        <div className="belge-upload-actions belge-upload-add">
                          <label
                            className={`btn btn-small belge-file ${rowBusy || dolu ? 'is-disabled' : ''}`}
                          >
                            {rowBusy
                              ? 'Bekleyin…'
                              : dolu
                                ? 'Limit doldu (5/5)'
                                : mevcutlar.length > 0
                                  ? `Başka dosya ekle (${mevcutlar.length}/${MAX_FILES_PER_KOD})`
                                  : 'Dosya ekle'}
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                              disabled={rowBusy || dolu}
                              onChange={(e) => {
                                // FileList canlıdır; value temizlenmeden önce kopyala
                                const list = Array.from(e.target.files ?? [])
                                e.target.value = ''
                                if (list.length) void upload(kod, list)
                              }}
                            />
                          </label>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </li>
            ))}
          </ul>
        </section>
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
