import { useState, useEffect, useCallback } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import CreateRequestPage from './pages/CreateRequestPage'
import MatchingPage from './pages/MatchingPage'
import ActiveSessionsPage from './pages/ActiveSessionsPage'
import SessionRoomPage from './pages/SessionRoomPage'
import { API_BASE } from './config'
import tr from './i18n'

const { health: ht } = tr

// ─── localStorage yardımcıları ───────────────────────────────────────────────
function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* storage dolu olabilir */ }
}

const MAX_HISTORY = 5

function App() {
  // ─── Oturum kalıcılığı: request + matches localStorage'dan yüklenir ───────
  const [request, setRequestState] = useState(() => loadLS('sp_request', null))
  const [matches, setMatchesState] = useState(() => loadLS('sp_matches', []))

  // ─── Geçmiş aramalar ─────────────────────────────────────────────────────
  const [searchHistory, setSearchHistory] = useState(() => loadLS('sp_history', []))

  // ─── Tema ────────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  // ─── Backend sağlık durumu ───────────────────────────────────────────────
  const [backendStatus, setBackendStatus] = useState('checking') // 'checking' | 'online' | 'offline'

  // data-theme attribute'ünü <html> elementine uygula
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Backend sağlık kontrolü — uygulama açılırken ve her 30 saniyede bir
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) })
      setBackendStatus(res.ok ? 'online' : 'offline')
    } catch {
      setBackendStatus('offline')
    }
  }, [])

  useEffect(() => {
    checkHealth()
    const timer = setInterval(checkHealth, 30_000)
    return () => clearInterval(timer)
  }, [checkHealth])

  // ─── Wrapper'lar: state + localStorage'ı birlikte güncelle ───────────────
  const setRequest = useCallback((req) => {
    setRequestState(req)
    saveLS('sp_request', req)

    if (req) {
      setSearchHistory((prev) => {
        const filtered = prev.filter(
          (h) => !(h.course === req.course && h.level === req.level &&
                   h.preferredTime === req.preferredTime && h.studyType === req.studyType)
        )
        const updated = [req, ...filtered].slice(0, MAX_HISTORY)
        saveLS('sp_history', updated)
        return updated
      })
    }
  }, [])

  const setMatches = useCallback((m) => {
    setMatchesState(m)
    saveLS('sp_matches', m)
  }, [])

  const clearHistory = useCallback(() => {
    setSearchHistory([])
    saveLS('sp_history', [])
  }, [])

  return (
    <div className="app-shell">
      <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((prev) => !prev)} />

      {/* Backend offline banner */}
      {backendStatus === 'offline' && (
        <div className="backend-offline-banner">
          {ht.offline}
        </div>
      )}

      <main className="page-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/create-request"
            element={
              <CreateRequestPage
                setRequest={setRequest}
                setMatches={setMatches}
                searchHistory={searchHistory}
                clearHistory={clearHistory}
              />
            }
          />
          <Route
            path="/matching"
            element={
              <MatchingPage
                request={request}
                setMatches={setMatches}
                setRequest={setRequest}
              />
            }
          />
          <Route
            path="/active-sessions"
            element={<ActiveSessionsPage matches={matches} setMatches={setMatches} />}
          />
          <Route path="/session/:partnerName" element={<SessionRoomPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App