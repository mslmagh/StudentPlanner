import { useState } from 'react'
import { Link } from 'react-router-dom'
import tr from '../i18n'

const { sessions: t } = tr

// Değerleri Türkçe etiketlere çevirir
function translateSession(session) {
  // session raw objesi match verisiyle geliyorsa
  const partner = session.matched_partner || session
  return {
    ...session,
    partner,
    levelLabel: t.level[partner.level] ?? partner.level,
    timeLabel: t.time[partner.time] ?? partner.time,
    typeLabel: t.type[partner.studyType] ?? partner.studyType,
  }
}

function ActiveSessionsPage({ matches, setMatches }) {
  // primaryIndex: hangi partner "Ana Partner" seçilmiş (null = seçilmedi)
  const [primaryIndex, setPrimaryIndex] = useState(() => {
    const saved = localStorage.getItem('sp_primary')
    return saved !== null ? Number(saved) : null
  })

  const sessions = matches.map(translateSession)

  const handleSetPrimary = (idx) => {
    const newVal = primaryIndex === idx ? null : idx
    setPrimaryIndex(newVal)
    if (newVal === null) {
      localStorage.removeItem('sp_primary')
    } else {
      localStorage.setItem('sp_primary', String(newVal))
    }
  }

  return (
    <section className="card">
      <h2>{t.title}</h2>

      {sessions.length === 0 ? (
        <div className="sessions-empty">
          <p>{t.empty}</p>
          <Link to="/create-request" className="primary-button">
            {t.createLink}
          </Link>
        </div>
      ) : (
        <>
          <p>{t.subtitle}</p>
          <ul className="result-list">
            {sessions.map((s, idx) => (
              <li key={idx} className={`session-item${primaryIndex === idx ? ' primary expanded' : ''}`}>
                <div className="session-header-row">
                  <div className="session-info">
                    {primaryIndex === idx && (
                      <span className="primary-badge">{t.primaryBadge}</span>
                    )}
                    <strong>{s.partner.name}</strong>
                    <span className="session-meta">
                      {s.partner.course} · {s.levelLabel} · {s.timeLabel} · {s.typeLabel}
                    </span>
                  </div>
                  <button
                    className={`set-primary-btn${primaryIndex === idx ? ' active' : ''}`}
                    onClick={() => handleSetPrimary(idx)}
                  >
                    {primaryIndex === idx ? '⭐' : t.setPrimary}
                  </button>
                </div>

                {primaryIndex === idx && (
                  <div className="primary-actions-panel">
                    {s.study_plan ? (
                      <div className="study-plan-box">
                        <h4>{t.planTitle}</h4>
                        <div className="plan-text">{s.study_plan}</div>
                      </div>
                    ) : (
                      <div className="study-plan-box empty">
                         <em>Çalışma planı bulunamadı (eski kayıt).</em>
                      </div>
                    )}
                    <div className="action-buttons">
                      <button className="primary-button action-btn" onClick={() => alert(t.startSession + ' başlatılıyor...')}>
                        {t.startSession}
                      </button>
                      <button className="secondary-button action-btn" onClick={() => alert(t.addToCalendar + ' eklendi!')}>
                        {t.addToCalendar}
                      </button>
                      <button className="secondary-button action-btn" onClick={() => alert(t.sendMessage + ' açılıyor...')}>
                        {t.sendMessage}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default ActiveSessionsPage