import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import tr from '../i18n'
import { API_BASE } from '../config'

const { matching: t } = tr
const CANDIDATES_URL = `${API_BASE}/api/match/candidates`
const ANALYZE_URL = `${API_BASE}/api/match/analyze`

/* ─── Çevrimiçi Durum Hesaplayıcı ─── */
export function getOnlineStatus(partnerTime) {
  const currentHour = new Date().getHours()
  let isOnline = false
  if (partnerTime === 'Morning' && currentHour >= 6 && currentHour < 12) isOnline = true
  else if (partnerTime === 'Afternoon' && currentHour >= 12 && currentHour < 18) isOnline = true
  else if (partnerTime === 'Evening' && currentHour >= 18 && currentHour < 24) isOnline = true
  else if (partnerTime === 'Night' && currentHour >= 0 && currentHour < 6) isOnline = true

  if (isOnline) {
    return { isOnline: true, text: '🟢 Şu an Çevrimiçi', className: 'online' }
  } else {
    const map = { Morning: 'Sabahları', Afternoon: 'Öğleden Sonraları', Evening: 'Akşamları', Night: 'Geceleri' }
    return { isOnline: false, text: `⚪ Genelde ${map[partnerTime] || partnerTime} aktif`, className: 'offline' }
  }
}

/* ─── Puan rengini hesapla ─── */
function scoreColor(score) {
  if (typeof score !== 'number') return 'yellow'
  return score >= 75 ? 'green' : score >= 50 ? 'yellow' : 'red'
}

/* ─── Tek bir puan çubuğu ─── */
function ScoreBar({ score, label }) {
  const safeScore = typeof score === 'number' ? score : 0
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-header">
        <span>{label}</span>
        <span>{safeScore}/100</span>
      </div>
      <div className="score-track">
        <div
          className="score-fill"
          style={{
            width: `${safeScore}%`,
            background: safeScore >= 75 ? 'var(--score-green)' : safeScore >= 50 ? 'var(--score-yellow)' : 'var(--score-red)',
          }}
        />
      </div>
    </div>
  )
}

/* ─── Aday kartı (AI analizi istekle yapılır) ─── */
function MatchCard({ match, rank, defaultOpen, onAnalyze, isAnalyzing }) {
  const [open, setOpen] = useState(defaultOpen)
  const aiReady = Boolean(match.ai_ready)
  const isBest = rank === 1

  return (
    <div className={`match-card${isBest ? ' best' : ''}${open ? ' open' : ''}`}>
      {/* Başlık satırı */}
      <div
        className="match-card-header"
        onClick={() => {
          if (aiReady) setOpen((p) => !p)
        }}
      >
        <div className="rank-badge">{t.rankLabel(rank)}</div>

        <div className="match-header-info">
          <div className="match-partner-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {match.matched_partner.name}
            {(() => {
              const status = getOnlineStatus(match.matched_partner.time)
              return <span className={`status-dot ${status.className}`}>{status.text}</span>
            })()}
          </div>
          <div className="match-partner-meta">
            {match.matched_partner.course} · {match.matched_partner.level} ·{' '}
            {match.matched_partner.time} · {match.matched_partner.studyType}
          </div>
        </div>

        <div className="match-header-scores">
          {aiReady ? (
            <span className={`score-pill ${scoreColor(match.compatibility_score)}`}>
              {t.pillCompat} {match.compatibility_score}/100
            </span>
          ) : (
            <span className="score-pill yellow">AI analizi bekleniyor</span>
          )}
        </div>

        {aiReady ? (
          <span className="toggle-chevron">▼</span>
        ) : (
          <button
            className="secondary-button"
            disabled={isAnalyzing}
            onClick={(e) => {
              e.stopPropagation()
              onAnalyze(match)
            }}
          >
            {isAnalyzing ? 'Analiz Ediliyor...' : 'AI ile Analiz Et'}
          </button>
        )}
      </div>

      {/* Detaylar — açıldığında görünür */}
      {aiReady && open && (
        <div className="match-card-body">
          <div className="score-section">
            <h3>{t.scores}</h3>
            <ScoreBar score={match.compatibility_score} label={t.compatibilityScore} />
          </div>

          <div className="result-section">
            <h3>{t.skillAnalysis}</h3>
            <p className="analysis-text">{match.skill_analysis}</p>
          </div>

          <hr className="section-divider" />

          <div className="result-section">
            <h3>{t.compatibility}</h3>
            <p className="analysis-text">{match.compatibility_raw}</p>
          </div>

          <div className="result-section">
            <h3>{t.studyPlan}</h3>
            <div className="plan-box">{match.study_plan}</div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Hata mesajını kullanıcı dostu hale getir ─── */
function friendlyError(rawError) {
  if (!rawError) return ''
  const lower = rawError.toLowerCase()

  if (
    lower.includes('authenticationerror') ||
    lower.includes('authentication fails') ||
    lower.includes('invalid api key') ||
    lower.includes('governor') ||
    lower.includes('unauthorized') ||
    lower.includes('401')
  ) {
    return 'OpenRouter kimlik doğrulama hatası. OPENROUTER_API_KEY, model adı ve OpenRouter bakiye/kredi durumunu kontrol et.'
  }

  if (
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('resource_exhausted') ||
    lower.includes('429')
  ) {
    return 'LLM API kotası/dakika limiti aşıldı. Biraz bekleyip tekrar dene veya farklı bir API key/model kullan.'
  }

  if (
    lower.includes('apiconnectionerror') ||
    lower.includes('getaddrinfo failed') ||
    lower.includes('connection error') ||
    lower.includes('name resolution')
  ) {
    return 'API bağlantısı kurulamadı (DNS/ağ hatası). İnternet, VPN/proxy ve güvenlik duvarını kontrol edip tekrar dene.'
  }

  
  if (
    lower.includes('not_found') ||
    lower.includes('model') && lower.includes('is not found')
  ) {
    return 'Seçilen model desteklenmiyor. Geçerli bir model adı kullan (örn: deepseek/deepseek-v3.2 veya gemini/gemini-2.0-flash-lite).'
  }

  // Backend 500 olduğunda "detail" anahtarı JSON içinde gelebilir
  // Ancak bizim fetch zaten d.detail'i exception message'a koyuyor.
  // "Internal Server Error" ya da çok uzun string ise basit mesaj göster.
  if (
    lower.includes('internal server error') ||
    lower.includes('500')
  ) {
    return t.serverError
  }
  return rawError
}

/* ─── Ana sayfa ─── */
function MatchingPage({ request, setMatches }) {
  const [matches, setLocalMatches] = useState([])
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [analyzingPartnerId, setAnalyzingPartnerId] = useState(null)
  const [error, setError] = useState(null)

  const fetchCandidates = (req) => {
    if (!req) return

    setIsLoadingCandidates(true)
    setError(null)

    ;(async () => {
      try {
        const res = await fetch(CANDIDATES_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req),
        })

        if (!res.ok) {
          let msg = `HTTP ${res.status}`
          try {
            const d = await res.json()
            msg = d.detail || msg
          } catch { /* parse hatası */ }
          throw new Error(msg)
        }

        const data = await res.json()
        setLocalMatches(data)
        setMatches(data)
      } catch (err) {
        setLocalMatches([])
        setMatches([])
        setError(String(err.message ?? err))
      } finally {
        setIsLoadingCandidates(false)
      }
    })()
  }

  const handleAnalyze = async (match) => {
    if (!request || !match?.matched_partner?.id) return

    setAnalyzingPartnerId(match.matched_partner.id)
    setError(null)

    try {
      const res = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, partnerId: match.matched_partner.id }),
      })

      if (!res.ok) {
        let msg = `HTTP ${res.status}`
        try {
          const d = await res.json()
          msg = d.detail || msg
        } catch { /* parse hatası */ }
        throw new Error(msg)
      }

      const analyzed = await res.json()
      setLocalMatches((prev) => {
        const updated = prev.map((item) => {
          if (item.matched_partner?.id !== match.matched_partner.id) return item
          return {
            ...item,
            ...analyzed,
            ai_ready: true,
            matched_partner: analyzed.matched_partner || item.matched_partner,
          }
        })
        setMatches(updated)
        return updated
      })
    } catch (err) {
      setError(String(err.message ?? err))
    } finally {
      setAnalyzingPartnerId(null)
    }
  }

  useEffect(() => {
    fetchCandidates(request)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request])

  // Yeniden eşleştir: aynı form verisiyle aday listesi tazele
  const handleRematch = () => {
    if (!request) return
    fetchCandidates(request)
  }

  if (!request) return <Navigate to="/create-request" replace />

  const analyzedCount = matches.filter((m) => m.ai_ready).length

  return (
    <section className="card">
      <h2>{t.title}</h2>

      {isLoadingCandidates && (
        <div className="loading-box">
          <div className="spinner-ring" />
          <div className="loading-steps">
            {['Kriterlere uygun partnerler veritabanında aranıyor...'].map((step) => (
              <div key={step} className="loading-step active">
                <span className="step-dot" />
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="stream-status done">
          {`✅ ${matches.length} aday bulundu — analiz için bir adaya tıkla (${analyzedCount} analiz tamamlandı)`}
        </div>
      )}

      {/* Hata */}
      {error && (
        <div className="error-box">
          <strong>{t.errorTitle}: </strong>{friendlyError(error)}
          <p>
            {t.errorHint} <code>{t.errorCmd}</code>
          </p>
        </div>
      )}

      {/* Aday kartları */}
      {matches.length > 0 && (
        <div className="matches-list">
          {matches.map((match, idx) => (
            <MatchCard
              key={match.matched_partner?.id || match.rank}
              match={match}
              rank={idx + 1}
              defaultOpen={idx === 0}
              onAnalyze={handleAnalyze}
              isAnalyzing={analyzingPartnerId === match.matched_partner?.id}
            />
          ))}
        </div>
      )}

      {/* Aksiyon butonları */}
      {(matches.length > 0 || error) && (
        <div className="matching-actions">
          <button className="secondary-button" onClick={handleRematch}>
            {t.rematch}
          </button>
          {analyzedCount > 0 && (
            <Link to="/active-sessions" className="primary-button inline-button">
              {t.viewSessions}
            </Link>
          )}
        </div>
      )}
    </section>
  )
}

export default MatchingPage