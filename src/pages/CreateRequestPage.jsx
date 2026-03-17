import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const initialForm = {
  course: '',
  level: 'Beginner',
  preferredTime: 'Evening',
  studyType: 'Online',
}

function CreateRequestPage({ setRequest, setMatches }) {
  const [form, setForm] = useState(initialForm)
  const navigate = useNavigate()

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    if (!form.course.trim()) {
      return
    }

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
      <h2>Create Study Request</h2>
      <form className="request-form" onSubmit={onSubmit}>
        <label>
          Course
          <input
            name="course"
            type="text"
            placeholder="e.g. Calculus"
            value={form.course}
            onChange={onChange}
            required
          />
        </label>

        <label>
          Level
          <select name="level" value={form.level} onChange={onChange}>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </label>

        <label>
          Preferred Time
          <select name="preferredTime" value={form.preferredTime} onChange={onChange}>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </label>

        <label>
          Study Type
          <select name="studyType" value={form.studyType} onChange={onChange}>
            <option value="Online">Online</option>
            <option value="In-person">In-person</option>
          </select>
        </label>

        <button type="submit" className="primary-button">
          Submit Request
        </button>
      </form>
    </section>
  )
}

export default CreateRequestPage