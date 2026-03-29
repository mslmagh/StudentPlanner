import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import tr from '../i18n'

const { matching: t } = tr
const API_URL = 'http://localhost:8000/api/match'

/* ─── Score bar ─── */
function ScoreBar({ score, label }) {
  const color =
    score >= 75
      ? 'var(--score-green)'
      : score >= 50
      ? 'var(--score-yellow)'
      : 'var(--score-red)'

  return (
    <div className="score-bar-wrap">
      <div className="score-bar-header">
        <span>{label}</span>
        <span>{score}/100</span>
      </div>
      <div className="score-track">
        <div className="score-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  )
}

/* ─── Animated loading ─── */
function LoadingSpinner({ stepIndex }) {
  return (
    <div className="loading-box">
      <div className="spinner-ring" />
      <div className="loading-steps">
        {t.loadingSteps.map((step, i) => {
          const cls =
            i < stepIndex ? 'loading-step done' : i === stepIndex ? 'loading-step active' : 'loading-step'
          return (
            <div key={step} className={cls}>
              <span className="step-dot" />
              {i < stepIndex ? '✓ ' : ''}{step}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Main page ─── */
function MatchingPage({ request, setMatches }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!request) return

    setIsLoading(true)
    setStepIndex(0)
    setResult(null)
    setError(null)

    const stepTimer = window.setInterval(() => {
      setStepIndex((prev) => (prev < t.loadingSteps.length - 1 ? prev + 1 : prev))
    }, 1200)

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(d.detail || 'API error'))
        return res.json()
      })
      .then((data) => {
        clearInterval(stepTimer)
        setResult(data)
        setMatches(data.matched_partner ? [data.matched_partner] : [])
        setIsLoading(false)
      })
      .catch((err) => {
        clearInterval(stepTimer)
        setError(String(err))
        setIsLoading(false)
      })

    return () => clearInterval(stepTimer)
  }, [request])

  if (!request) return <Navigate to="/create-request" replace />

  return (
    <section className="card">
      <h2>{t.title}</h2>

      {isLoading && <LoadingSpinner stepIndex={stepIndex} />}

      {error && (
        <div className="error-box">
          <strong>{t.errorTitle}: </strong>{error}
          <p>
            {t.errorHint} <code>{t.errorCmd}</code>
          </p>
        </div>
      )}

      {!isLoading && !error && result && (
        <div>
          {/* Eşleşen Partner */}
          <div className="result-section partner-box">
            <h3>{t.matchedPartner}</h3>
            <p>
              <strong>{result.matched_partner.name}</strong> — {result.matched_partner.course},{' '}
              {result.matched_partner.level}, {result.matched_partner.time},{' '}
              {result.matched_partner.studyType}
            </p>
          </div>

          {/* Puanlar */}
          <div className="result-section score-section">
            <h3>{t.scores}</h3>
            <ScoreBar score={result.compatibility_score} label={t.compatibilityScore} />
            <ScoreBar score={result.overall_score} label={t.overallScore} />
          </div>

          {/* Beceri Analizi */}
          <div className="result-section">
            <h3>{t.skillAnalysis}</h3>
            <p className="analysis-text">{result.skill_analysis}</p>
          </div>

          <hr className="section-divider" />

          {/* Uyumluluk */}
          <div className="result-section">
            <h3>{t.compatibility}</h3>
            <p className="analysis-text">{result.compatibility_raw}</p>
          </div>

          {/* Çalışma Planı */}
          <div className="result-section">
            <h3>{t.studyPlan}</h3>
            <div className="plan-box">{result.study_plan}</div>
          </div>

          {/* Değerlendirici */}
          <div className="result-section eval-box">
            <h3>{t.evaluation}</h3>
            <p>{result.evaluation_raw}</p>
          </div>

          <Link to="/active-sessions" className="primary-button inline-button">
            {t.viewSessions}
          </Link>
        </div>
      )}
    </section>
  )
}

export default MatchingPage