import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import CreateRequestPage from './pages/CreateRequestPage'
import MatchingPage from './pages/MatchingPage'
import ActiveSessionsPage from './pages/ActiveSessionsPage'

function App() {
  const [request, setRequest] = useState(null)
  const [matches, setMatches] = useState([])

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/create-request"
            element={<CreateRequestPage setRequest={setRequest} setMatches={setMatches} />}
          />
          <Route
            path="/matching"
            element={
              <MatchingPage
                request={request}
                setMatches={setMatches}
              />
            }
          />
          <Route path="/active-sessions" element={<ActiveSessionsPage matches={matches} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App