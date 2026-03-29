import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

  const navigate = useNavigate()

  // Google Calendar URL Generator
  const handleAddToCalendar = (s) => {
    const text = encodeURIComponent(`Çalışma Oturumu: ${s.partner.course} (${s.partner.name} ile)`)
    const details = encodeURIComponent(`Ders Partneri uygulamasından detaylara bakabilirsiniz.\n\nPlan:\n${s.study_plan ? s.study_plan.substring(0, 500) + '...' : ''}`)
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}`
    window.open(url, '_blank')
  }

  // Chat State
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef(null)

  const handleOpenChat = () => {
    setChatOpen(!chatOpen)
    if (chatMessages.length === 0 && !chatOpen) {
      setTimeout(() => {
        setChatMessages([{ sender: 'partner', text: 'Merhaba! Ortak çalışma planımızı inceledim. Ne zaman başlayalım?' }])
      }, 400)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if(!chatInput.trim()) return
    setChatMessages(prev => [...prev, { sender: 'me', text: chatInput }])
    setChatInput('')
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'partner', text: 'Harika, anlaştık! 🚀' }])
    }, 1000)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatOpen])

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
                      <button className="primary-button action-btn" onClick={() => navigate(`/session/${s.partner.name}`)}>
                        {t.startSession}
                      </button>
                      <button className="secondary-button action-btn" onClick={() => handleAddToCalendar(s)}>
                        {t.addToCalendar}
                      </button>
                      <button className={`secondary-button action-btn ${chatOpen ? 'active-chat-btn' : ''}`} onClick={handleOpenChat}>
                        {t.sendMessage}
                      </button>
                    </div>

                    {chatOpen && (
                      <div className="chat-box">
                        <div className="chat-history">
                          {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`chat-bubble-wrap ${msg.sender}`}>
                              <div className="chat-bubble">{msg.text}</div>
                            </div>
                          ))}
                          <div ref={chatEndRef} />
                        </div>
                        <form className="chat-input-form" onSubmit={handleSendMessage}>
                          <input 
                            type="text" 
                            className="chat-input"
                            value={chatInput} 
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Mesaj yaz..." 
                          />
                          <button type="submit" className="primary-button chat-send-btn">Gönder</button>
                        </form>
                      </div>
                    )}
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