import { useEffect, useState } from 'react'
import { BASVURU_BELGELER, FORM_API_URL } from '../config'
import type { BasvuruData } from '../basvuruTypes'

type Belge = {
  id: string
  belgeKod: string
  dosyaAdi: string
  yuklemeTarihi: string
}

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

export function BasvuruProfil({
  data,
  accessToken,
  donemAcik,
  onEdit,
}: {
  data: BasvuruData
  accessToken: string
  donemAcik: boolean
  onEdit: () => void
}) {
  const [belgeler, setBelgeler] = useState<Belge[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  const durum = data.durum ?? ''
  const kilitli = durum === 'Onaylandi' || durum === 'Reddedildi'
  const canEdit = donemAcik && !kilitli
  const canUpload = durum === 'Onaylandi'

  useEffect(() => {
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
  }, [accessToken])

  function findBelge(kod: string) {
    return belgeler.find((b) => b.belgeKod === kod)
  }

  async function upload(kod: string, file: File) {
    setError('')
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
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Belge yüklenemedi')
      }
      setBelgeler((prev) => [...prev.filter((b) => b.belgeKod !== kod), json.item])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Belge yüklenemedi')
    } finally {
      setBusy('')
    }
  }

  async function remove(belge: Belge) {
    setError('')
    setBusy(belge.belgeKod)
    try {
      const response = await fetch(`${FORM_API_URL}/basvuru/me/belgeler/${belge.id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Belge silinemedi')
      }
      setBelgeler((prev) => prev.filter((b) => b.id !== belge.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Belge silinemedi')
    } finally {
      setBusy('')
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
        <div><dt>Üniversite</dt><dd>{data.universite === 'Diğer' ? data.universiteAdi : data.universite || '—'}</dd></div>
        <div><dt>Fakülte</dt><dd>{data.fakulte === 'Diğer' ? data.fakulteAdi : data.fakulte || '—'}</dd></div>
        <div><dt>Bölüm</dt><dd>{data.bolum === 'Diğer' ? data.bolumAdi : data.bolum || '—'}</dd></div>
        <div><dt>Sınıf</dt><dd>{data.sinif || '—'}</dd></div>
      </dl>

      {canEdit ? (
        <div className="wizard-actions">
          <button type="button" className="btn" onClick={onEdit}>Bilgileri güncelle</button>
        </div>
      ) : (
        <p className="wizard-lead">
          {durum === 'Reddedildi'
            ? 'Bu başvuru reddedildiği için bilgi ve belge değiştirilemez.'
            : durum === 'Onaylandi'
              ? 'Başvurunuz onaylandı. Bilgiler değiştirilemez; aşağıdaki istenen belgeleri yükleyebilirsiniz.'
              : 'Başvuru dönemi kapalı olduğu için bilgiler güncellenemez.'}
        </p>
      )}

      {canUpload ? (
        <>
          <h3 className="wizard-sub">İstenen belgeler</h3>
          <p className="wizard-lead">
            PDF, JPG veya PNG. Her belge en fazla 8 MB. Aynı belgeyi yeniden yüklerseniz eskisi değişir.
          </p>
          {error ? <div className="form-alert is-error"><p>{error}</p></div> : null}
          <ul className="belge-upload-list">
            {BASVURU_BELGELER.map((item) => (
              <li key={item.text}>
                <p>{item.text}</p>
                {rowsOf(item).map((kod) => {
                  const mevcut = findBelge(kod)
                  const rowBusy = busy === kod
                  return (
                    <div className="belge-upload-row" key={kod}>
                      {item.alt ? <span>{kod}</span> : <span>Dosya</span>}
                      {mevcut ? <strong>{mevcut.dosyaAdi}</strong> : <em>Yüklenmedi</em>}
                      <label className="btn btn-ghost-dark belge-file">
                        {rowBusy ? 'Yükleniyor…' : mevcut ? 'Değiştir' : 'Yükle'}
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
                      {mevcut ? (
                        <button
                          type="button"
                          className="linkish"
                          disabled={rowBusy}
                          onClick={() => void remove(mevcut)}
                        >
                          Sil
                        </button>
                      ) : null}
                    </div>
                  )
                })}
              </li>
            ))}
          </ul>
        </>
      ) : durum !== 'Reddedildi' ? (
        <p className="wizard-lead">
          Belge yükleme, başvurunuz onaylandıktan sonra açılır.
        </p>
      ) : null}
    </>
  )
}
