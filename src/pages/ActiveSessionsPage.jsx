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

function ActiveSessionsPage({ matches }) {
  const sessions = matches.map(translateSession)

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
            {sessions.map((s) => (
              <li key={s.name}>
                <strong>{s.name}</strong> — {s.course}, {s.levelLabel}, {s.timeLabel}, {s.typeLabel}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default ActiveSessionsPage