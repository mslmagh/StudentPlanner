import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import tr from '../i18n'

export default function SessionRoomPage() {
  const { partnerName } = useParams()
  const navigate = useNavigate()
  
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [sessionTime, setSessionTime] = useState(0)

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleEndSession = () => {
    navigate('/active-sessions')
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="session-room-container">
      <div className="session-header">
        <h2 className="session-title">
          <span className="live-dot"></span> Canlı Çalışma Oturumu
        </h2>
        <div className="session-timer">{formatTime(sessionTime)}</div>
      </div>

      <div className="video-grid">
        {/* Partner Video */}
        <div className="video-box partner-video">
            <div className="avatar-placeholder">{partnerName?.charAt(0) || 'P'}</div>
            <div className="video-label">{partnerName}</div>
        </div>
        
        {/* My Video */}
        <div className={`video-box my-video ${!camOn ? 'cam-off' : ''}`}>
            {camOn ? (
              <div className="cam-placeholder">You (Camera On)</div>
            ) : (
              <div className="avatar-placeholder">ME</div>
            )}
            <div className="video-label">Sen {micOn ? '' : '(Sessiz)'}</div>
        </div>
      </div>

      <div className="session-controls">
        <button 
          className={`control-btn ${!micOn ? 'off' : ''}`}
          onClick={() => setMicOn(!micOn)}
        >
          {micOn ? '🎙️ Mikrofon Kapat' : '🔇 Mikrofon Aç'}
        </button>
        <button 
          className={`control-btn ${!camOn ? 'off' : ''}`}
          onClick={() => setCamOn(!camOn)}
        >
          {camOn ? '📹 Kamera Kapat' : '🚫 Kamera Aç'}
        </button>
        <button className="control-btn end-call" onClick={handleEndSession}>
          📞 Oturumu Bitir
        </button>
      </div>
    </div>
  )
}
