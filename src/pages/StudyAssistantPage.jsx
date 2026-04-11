import { useState, useRef, useEffect } from 'react'
import { API_BASE } from '../config'
import tr from '../i18n'

const { assistant: t } = tr
const CHAT_URL = `${API_BASE}/api/assistant/chat`
const RESET_URL = `${API_BASE}/api/assistant/reset`

/**
 * StudyAssistantPage — LangGraph Çalışma Asistanı
 *
 * Kursta (ed-donner/agents/4_langgraph) Gradio chatbot UI vardı.
 * Biz bunu React ile yapıyoruz:
 *   - Mesaj listesi (messages state)
 *   - Input alanı + gönder butonu
 *   - Sıfırla butonu (yeni session)
 *   - thread_id ile konuşma geçmişi korunur
 */
function StudyAssistantPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [threadId, setThreadId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  // Otomatik scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, thread_id: threadId }),
      })

      if (!res.ok) {
        let msg = `HTTP ${res.status}`
        try {
          const d = await res.json()
          msg = d.detail || msg
        } catch { /* ignore */ }
        throw new Error(msg)
      }

      const data = await res.json()
      setThreadId(data.thread_id)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(String(err.message ?? err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    try {
      const res = await fetch(RESET_URL, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setThreadId(data.thread_id)
      }
    } catch { /* ignore */ }
    setMessages([])
    setInput('')
    setError(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="assistant-page">
      <div className="assistant-header">
        <h1>{t.title}</h1>
        <p className="assistant-subtitle">{t.subtitle}</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <p>{t.emptyState}</p>
              <div className="suggestion-chips">
                {t.suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="suggestion-chip"
                    onClick={() => {
                      setInput(s)
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role}`}>
              <div className="bubble-role">{msg.role === 'user' ? t.you : t.assistant}</div>
              <div className="bubble-content">{msg.content}</div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-bubble assistant loading">
              <div className="bubble-role">{t.assistant}</div>
              <div className="bubble-content typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="chat-error">
            {error}
          </div>
        )}

        <div className="chat-input-area">
          <textarea
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            rows={1}
            disabled={isLoading}
          />
          <button className="chat-send-btn" onClick={sendMessage} disabled={isLoading || !input.trim()}>
            {t.send}
          </button>
          <button className="chat-reset-btn" onClick={handleReset} disabled={isLoading}>
            {t.reset}
          </button>
        </div>
      </div>

      {/* LangGraph bilgi kutusu */}
      <div className="langgraph-info">
        <h3>{t.infoTitle}</h3>
        <p>{t.infoDesc}</p>
        <div className="graph-flow">
          <span className="flow-node">START</span>
          <span className="flow-arrow">→</span>
          <span className="flow-node active">Worker</span>
          <span className="flow-arrow">→</span>
          <span className="flow-node">Tools / Evaluator</span>
          <span className="flow-arrow">→</span>
          <span className="flow-node">END</span>
        </div>
      </div>
    </div>
  )
}

export default StudyAssistantPage
