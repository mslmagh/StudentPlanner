import { NavLink } from 'react-router-dom'
import tr from '../i18n'

const navLinks = [
  { to: '/', label: tr.nav.home, end: true },
  { to: '/create-request', label: tr.nav.createRequest },
  { to: '/matching', label: tr.nav.matching },
  { to: '/active-sessions', label: tr.nav.activeSessions },
  { to: '/assistant', label: tr.nav.assistant },
]

function Navbar({ darkMode, onToggleTheme }) {
  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        {tr.nav.brand}
      </NavLink>

      <div className="nav-right">
        <nav className="nav-links">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="theme-toggle" onClick={onToggleTheme} aria-label="Tema değiştir">
          {darkMode ? '☀️' : '🌙'}
          <span>{darkMode ? tr.nav.lightMode : tr.nav.darkMode}</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar