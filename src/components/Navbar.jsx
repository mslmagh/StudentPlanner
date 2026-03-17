import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/create-request', label: 'Create Request' },
  { to: '/matching', label: 'Matching' },
  { to: '/active-sessions', label: 'Active Sessions' },
]

function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">AI Study Partner Finder</div>
      <nav className="nav-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default Navbar