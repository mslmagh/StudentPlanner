import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <section className="card">
      <h1>Find the right study partner, faster</h1>
      <p>
        AI Study Partner Finder is a student-focused platform inspired by ride-matching systems.
        Students create study requests by course, level, preferred time, and format to quickly get
        matched with suitable partners.
      </p>
      <p>
        The current version is frontend-only and simulates the matching process using static mock
        data.
      </p>
      <Link to="/create-request" className="primary-button">
        Find Study Partner
      </Link>
    </section>
  )
}

export default HomePage