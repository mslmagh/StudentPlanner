import { useState } from 'react'
import { Link } from 'react-router-dom'
import tr from '../i18n'

const { sessions: t } = tr

// Değerleri Türkçe etiketlere çevirir
function translateSession(session) {
  return {
    ...session,
    levelLabel: t.level[session.level] ?? session.level,
    timeLabel: t.time[session.time] ?? session.time,
    typeLabel: t.type[session.studyType] ?? session.studyType,
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
              <li key={s.name} className={`session-item${primaryIndex === idx ? ' primary' : ''}`}>
                <div className="session-info">
                  {primaryIndex === idx && (
                    <span className="primary-badge">{t.primaryBadge}</span>
                  )}
                  <strong>{s.name}</strong>
                  <span className="session-meta">
                    {s.course} · {s.levelLabel} · {s.timeLabel} · {s.typeLabel}
                  </span>
                </div>
                <button
                  className={`set-primary-btn${primaryIndex === idx ? ' active' : ''}`}
                  onClick={() => handleSetPrimary(idx)}
                >
                  {primaryIndex === idx ? '⭐' : t.setPrimary}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default ActiveSessionsPage