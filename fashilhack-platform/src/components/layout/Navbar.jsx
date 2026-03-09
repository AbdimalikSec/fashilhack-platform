import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useRole } from "../../hooks/useRole"
import Button from "../ui/Button"
import logo from "../../assets/logo.png"

const PUBLIC_LINKS = [
  { label: "Home",      to: "/" },
  { label: "Services",  to: "/services" },
  { label: "About",     to: "/about" },
  { label: "Community", to: "/community" },
  { label: "Contact",   to: "/contact" },
]

export default function Navbar() {
  const { user, logout, userData } = useAuth()
  const { role } = useRole()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const dashboardPath = () => {
    if (role === "admin")     return "/admin"
    if (role === "team")      return "/team"
    if (role === "client")    return "/client"
    if (role === "community") return "/community"
    return null
  }

  const dashPath = dashboardPath()

  return (
    <nav className="
      fixed top-0 left-0 right-0 z-50
      flex items-center justify-between
      px-8 py-4
      bg-white/90 backdrop-blur-md
      border-b border-slate-200
    ">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        <img src={logo} alt="FashilHack" className="w-12 h-12 object-contain" />
        <span className="font-heading font-black text-xl tracking-tight text-primary">
          FashilHack
        </span>
      </Link>

      {/* Desktop nav links */}
      <ul className="hidden md:flex items-center gap-8 list-none">
        {PUBLIC_LINKS.map(link => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="
                font-sans text-sm font-semibold tracking-tight
                text-slate-600 hover:text-accent transition-colors
              "
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right side */}
      <div className="hidden md:flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-5">

            {/* Dashboard button */}
            {dashPath && (
              <Button variant="primary" size="sm" onClick={() => navigate(dashPath)}>
                Dashboard
              </Button>
            )}

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropOpen(d => !d)}
                className="flex items-center gap-3 focus:outline-none"
              >
                <div className="
                  w-8 h-8 rounded-full bg-slate-100
                  flex items-center justify-center
                  font-heading font-black text-primary
                  border border-slate-200 text-[10px]
                ">
                  {userData?.displayName?.[0] || user.email[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-sans text-[10px] font-black text-accent uppercase tracking-tighter leading-none mb-1">
                    {role}
                  </p>
                  <p className="font-sans text-xs text-slate-600 font-bold leading-none">
                    {userData?.displayName || user.email.split("@")[0]}
                  </p>
                </div>
                <span className="text-slate-400 text-xs">▾</span>
              </button>

              {dropOpen && (
                <div className="
                  absolute right-0 top-12 w-52
                  bg-white border border-slate-200
                  shadow-xl shadow-primary/5
                  py-2 z-50 rounded-xl overflow-hidden
                ">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="font-sans text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Signed in as
                    </p>
                    <p className="font-sans text-xs text-primary font-bold truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="
                      w-full text-left font-sans text-xs font-bold
                      px-4 py-3 text-red-500
                      hover:bg-red-50 transition-colors
                    "
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Login */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>

            {/* Join Community — primary action */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/signup")}
            >
              Join Community
            </Button>

            {/* Client Access — secondary, outlined */}
            <button
              onClick={() => navigate("/contact")}
              className="
                font-sans text-xs font-bold tracking-wide
                px-4 py-2 rounded
                border border-slate-300 text-slate-600
                hover:border-accent hover:text-accent
                transition-colors whitespace-nowrap
              "
            >
              Client Access →
            </button>
          </div>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-primary text-xl"
        onClick={() => setMenuOpen(m => !m)}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="
          absolute top-full left-0 right-0
          bg-white border-b border-slate-200
          flex flex-col py-6 px-8 gap-5
          md:hidden shadow-lg
        ">
          {PUBLIC_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="font-sans text-base font-semibold text-slate-600 hover:text-accent"
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
            {user ? (
              <button
                onClick={handleLogout}
                className="font-sans text-base font-semibold text-red-500 text-left"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="md"
                  full
                  onClick={() => { navigate("/login"); setMenuOpen(false) }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  full
                  onClick={() => { navigate("/signup"); setMenuOpen(false) }}
                >
                  Join Community
                </Button>
                <button
                  onClick={() => { navigate("/contact"); setMenuOpen(false) }}
                  className="
                    font-sans text-sm font-bold text-center
                    py-3 border border-slate-200 rounded
                    text-slate-600 hover:border-accent hover:text-accent
                    transition-colors
                  "
                >
                  Client Access →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}