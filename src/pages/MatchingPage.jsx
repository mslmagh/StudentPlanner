import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import partners from '../data/mockPartners.json'
import { findMatches } from '../utils/matching'

const loadingSteps = [
  'Searching for study partners...',
  'Analyzing schedules...',
  'Matching skill levels...',
]

function MatchingPage({ request, setMatches }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const results = useMemo(() => {
    if (!request) {
      return []
    }
    return findMatches(request, partners)
  }, [request])

  useEffect(() => {
    if (!request) {
      return
    }

    setIsLoading(true)
    setStepIndex(0)

    const stepTimer = window.setInterval(() => {
      setStepIndex((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev))
    }, 800)

    const completeTimer = window.setTimeout(() => {
      setIsLoading(false)
      setMatches(results)
    }, 2600)

    return () => {
      window.clearInterval(stepTimer)
      window.clearTimeout(completeTimer)
    }
  }, [request, results, setMatches])

  if (!request) {
    return <Navigate to="/create-request" replace />
  }

  return (
    <section className="card">
      <h2>Matching</h2>

      {isLoading ? (
        <div className="loading-box">
          <p>{loadingSteps[stepIndex]}</p>
        </div>
      ) : (
        <div>
          <h3>Match Results</h3>
          {results.length === 0 ? (
            <p>No exact mock match found. Try a different course, level, or preferred time.</p>
          ) : (
            <ul className="result-list">
              {results.map((partner) => (
                <li key={partner.name}>
                  <strong>{partner.name}</strong> — {partner.course}, {partner.level}, {partner.time},
                  {' '}
                  {partner.studyType}
                </li>
              ))}
            </ul>
          )}

          <Link to="/active-sessions" className="primary-button inline-button">
            View Active Sessions
          </Link>
        </div>
      )}
    </section>
  )
}

export default MatchingPage