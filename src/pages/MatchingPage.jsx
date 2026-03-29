import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import tr from '../i18n'
import { API_BASE } from '../config'

const { matching: t } = tr
const STREAM_URL = `${API_BASE}/api/match/stream`

/* ─── Puan rengini hesapla ─── */
function scoreColor(score) {
  return score >= 75 ? 'green' : score >= 50 ? 'yellow' : 'red'
}

/* ─── Tek bir puan çubuğu ─── */
function ScoreBar({ score, label }) {
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-header">
        <span>{label}</span>
        <span>{score}/100</span>
      </div>
      <div className="score-track">
        <div
          className="score-fill"
          style={{
            width: `${score}%`,
            background: score >= 75 ? 'var(--score-green)' : score >= 50 ? 'var(--score-yellow)' : 'var(--score-red)',
          }}
        />
      </div>
    </div>
  )
}

/* ─── Açılır/kapanır match kartı ─── */
function MatchCard({ match, rank, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const isBest = rank === 1

  return (
    <div className={`match-card${isBest ? ' best' : ''}${open ? ' open' : ''}`}>
      {/* Başlık satırı — tıklanabilir */}
      <div className="match-card-header" onClick={() => setOpen((p) => !p)}>
        <div className="rank-badge">{t.rankLabel(rank)}</div>

        <div className="match-header-info">
          <div className="match-partner-name">{match.matched_partner.name}</div>
          <div className="match-partner-meta">
            {match.matched_partner.course} · {match.matched_partner.level} ·{' '}
            {match.matched_partner.time} · {match.matched_partner.studyType}
          </div>
        </div>

        <div className="match-header-scores">
          {/* i18n'den alınan pill etiketleri */}
          <span className={`score-pill ${scoreColor(match.compatibility_score)}`}>
            {t.pillCompat} {match.compatibility_score}/100
          </span>
          <span className={`score-pill ${scoreColor(match.overall_score)}`}>
            {t.pillOverall} {match.overall_score}/100
          </span>
        </div>

        <span className="toggle-chevron">▼</span>
      </div>

      {/* Detaylar — açıldığında görünür */}
      {open && (
        <div className="match-card-body">
          <div className="score-section">
            <h3>{t.scores}</h3>
            <ScoreBar score={match.compatibility_score} label={t.compatibilityScore} />
            <ScoreBar score={match.overall_score} label={t.overallScore} />
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

          <div className="result-section eval-box">
            <h3>{t.evaluation}</h3>
            <p>{match.evaluation_raw}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── "Yükleniyor" ghost kartı ─── */
function GhostCard({ rank }) {
  return (
    <div className="match-card-ghost">
      <div className="ghost-spinner" />
      <span className="ghost-label">{t.loadingMatch(rank)}</span>
    </div>
  )
}

/* ─── Hata mesajını kullanıcı dostu hale getir ─── */
function friendlyError(rawError) {
  if (!rawError) return ''
  // Backend 500 olduğunda "detail" anahtarı JSON içinde gelebilir
  // Ancak bizim fetch zaten d.detail'i exception message'a koyuyor.
  // "Internal Server Error" ya da çok uzun string ise basit mesaj göster.
  if (
    rawError.toLowerCase().includes('internal server error') ||
    rawError.toLowerCase().includes('500') ||
    rawError.length > 200
  ) {
    return t.serverError
  }
  return rawError
}

/* ─── Ana sayfa ─── */
function MatchingPage({ request, setMatches, setRequest }) {
  const [matches, setLocalMatches] = useState([])
  const [nextRank, setNextRank] = useState(1)
  const [isDone, setIsDone] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const navigate = useNavigate()

  const startStream = (req) => {
    if (!req) return

    // Sıfırla
    setLocalMatches([])
    setNextRank(1)
    setIsDone(false)
    setError(null)

    // Önceki isteği iptal et
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    ;(async () => {
      try {
        const res = await fetch(STREAM_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req),
          signal: controller.signal,
        })

        if (!res.ok) {
          let msg = `HTTP ${res.status}`
          try {
            const d = await res.json()
            msg = d.detail || msg
          } catch { /* parse hatası */ }
          throw new Error(msg)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') {
              setIsDone(true)
              continue
            }
            try {
              const match = JSON.parse(payload)
              if (match.error) {
                console.warn(`Rank ${match.rank} hatası:`, match.error)
                setNextRank((p) => p + 1)
                continue
              }
              setLocalMatches((prev) => {
                const updated = [...prev, match]
                setMatches(updated.map((m) => m.matched_partner))
                return updated
              })
              setNextRank(match.rank + 1)
            } catch {
              /* parse hatası — yoksay */
            }
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(String(err.message ?? err))
        }
      }
    })()
  }

  useEffect(() => {
    startStream(request)
    return () => abortRef.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request])

  // Yeniden eşleştir: aynı form verisiyle yeni stream başlat
  const handleRematch = () => {
    if (!request) return
    // request ref'ini değişmeden bırak ama etkiyi tetikle:
    setMatches([])
    setLocalMatches([])
    setNextRank(1)
    setIsDone(false)
    setError(null)
    startStream(request)
  }

  if (!request) return <Navigate to="/create-request" replace />

  const isStreaming = !isDone && !error
  const TOTAL = 3

  return (
    <section className="card">
      <h2>{t.title}</h2>

      {/* Durum çubuğu */}
      {isStreaming && matches.length === 0 && (
        <div className="loading-box">
          <div className="spinner-ring" />
          <div className="loading-steps">
            {t.loadingSteps.map((step, i) => (
              <div key={step} className={i === 0 ? 'loading-step active' : 'loading-step'}>
                <span className="step-dot" />
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className={`stream-status${isDone ? ' done' : ''}`}>
          {isDone ? `✅ ${t.allDone(matches.length)}` : `⏳ ${t.loadingMatch(nextRank)}`}
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

      {/* Match kartları */}
      {matches.length > 0 && (
        <div className="matches-list">
          {matches.map((match) => (
            <MatchCard
              key={match.rank}
              match={match}
              rank={match.rank}
              defaultOpen={match.rank === 1}
            />
          ))}

          {/* Ghost kartlar — bekleyen eşleşmeler */}
          {isStreaming &&
            Array.from({ length: TOTAL - matches.length }, (_, i) => (
              <GhostCard key={`ghost-${matches.length + i + 1}`} rank={matches.length + i + 1} />
            ))}
        </div>
      )}

      {/* Aksiyon butonları */}
      {(isDone || error) && (
        <div className="matching-actions">
          <button className="secondary-button" onClick={handleRematch}>
            {t.rematch}
          </button>
          {isDone && matches.length > 0 && (
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