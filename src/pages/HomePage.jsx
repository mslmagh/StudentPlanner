import { Link } from 'react-router-dom'
import tr from '../i18n'

const { home: t } = tr

function HomePage() {
  return (
    <section className="card">
      <h1>{t.title}</h1>
      <p>{t.desc1}</p>
      <p style={{ marginTop: '0.75rem' }}>{t.desc2}</p>

      <div className="features-grid">
        {t.features.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      <Link to="/create-request" className="primary-button">
        {t.cta}
      </Link>
    </section>
  )
}

export default HomePage