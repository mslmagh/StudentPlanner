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

function CreateRequestPage({ setRequest, setMatches }) {
  const [form, setForm] = useState(initialForm)
  const navigate = useNavigate()

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!form.course.trim()) return

    setRequest({
      course: form.course.trim(),
      level: form.level,
      preferredTime: form.preferredTime,
      studyType: form.studyType,
    })
    setMatches([])
    navigate('/matching')
  }

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
    </section>
  )
}

export default CreateRequestPage