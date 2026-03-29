import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tr from '../i18n'

const { create: t } = tr

const initialForm = {
  course: '',
  level: 'Beginner',
  preferredTime: 'Evening',
  studyType: 'Online',
}

function CreateRequestPage({ setRequest, setMatches, searchHistory = [], clearHistory }) {
  const [form, setForm] = useState(initialForm)
  const navigate = useNavigate()

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!form.course.trim()) return

    const req = {
      course: form.course.trim(),
      level: form.level,
      preferredTime: form.preferredTime,
      studyType: form.studyType,
    }
    setRequest(req)
    setMatches([])
    navigate('/matching')
  }

  // Geçmiş aramayı forma yükle ve hemen gönder
  const applyHistory = (h) => {
    const req = {
      course: h.course,
      level: h.level,
      preferredTime: h.preferredTime,
      studyType: h.studyType,
    }
    setRequest(req)
    setMatches([])
    navigate('/matching')
  }

  const levelLabel = (v) => t.levels.find((l) => l.value === v)?.label ?? v
  const timeLabel  = (v) => t.times.find((l) => l.value === v)?.label ?? v
  const typeLabel  = (v) => t.types.find((l) => l.value === v)?.label ?? v

  return (
    <section className="card">
      <h2>{t.title}</h2>
      <p className="form-subtitle">{t.subtitle}</p>

      <form className="request-form" onSubmit={onSubmit}>
        <label>
          {t.courseLabel}
          <select name="course" value={form.course} onChange={onChange} required>
            <option value="" disabled>{t.coursePlaceholder}</option>
            {t.courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          {t.levelLabel}
          <select name="level" value={form.level} onChange={onChange}>
            {t.levels.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label>
          {t.timeLabel}
          <select name="preferredTime" value={form.preferredTime} onChange={onChange}>
            {t.times.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label>
          {t.typeLabel}
          <select name="studyType" value={form.studyType} onChange={onChange}>
            {t.types.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <button type="submit" className="primary-button">
          {t.submit}
        </button>
      </form>

      {/* ─── Geçmiş aramalar ─────────────────────────────────────────── */}
      {searchHistory.length > 0 && (
        <div className="history-box">
          <div className="history-header">
            <span className="history-title">{t.recentSearches}</span>
            <button className="history-clear-btn" onClick={clearHistory}>{t.clearHistory}</button>
          </div>
          <ul className="history-list">
            {searchHistory.map((h, i) => (
              <li key={i} className="history-item" onClick={() => applyHistory(h)}>
                <span className="history-course">{h.course}</span>
                <span className="history-meta">
                  {levelLabel(h.level)} · {timeLabel(h.preferredTime)} · {typeLabel(h.studyType)}
                </span>
                <span className="history-arrow">→</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default CreateRequestPage