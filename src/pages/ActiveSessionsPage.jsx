import fallbackSessions from '../data/mockSessions.json'

function ActiveSessionsPage({ matches }) {
  const activeSessions = matches.length > 0 ? matches : fallbackSessions

  return (
    <section className="card">
      <h2>Active Sessions</h2>
      <p>Current matched partners (mock data):</p>

      <ul className="result-list">
        {activeSessions.map((session) => (
          <li key={session.name}>
            <strong>{session.name}</strong> — {session.course}, {session.level}, {session.time},
            {' '}
            {session.studyType}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ActiveSessionsPage