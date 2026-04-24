import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useRole } from "../../hooks/useRole"
import { useDark } from "../../context/DarkModeContext"
import { usePublicTheme } from "../../hooks/Usepublictheme"
import Button from "../ui/Button"
import logo2 from "../../assets/logo2.png"

const PUBLIC_LINKS = [
  { label: "Home",      to: "/" },
  { label: "Services",  to: "/services" },
  { label: "About",     to: "/about" },
  { label: "Community", to: "/community" },
  { label: "Contact",   to: "/contact" },
]

const IconMoon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)
const IconSun = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

export default function Navbar() {
  const { user, logout, userData } = useAuth()
  const { role }                   = useRole()
  const { publicDark: dark, togglePublicDark: toggleDark } = useDark()
  const t = usePublicTheme()

  // When on public pages, remove portal dark ONLY if public dark is also off
  // If public dark is on, html.dark should stay for community CSS variables
  useEffect(() => {
    if (!dark) {
      document.documentElement.classList.remove("dark")
    }
  }, [dark])
  const navigate                   = useNavigate()
  const [menuOpen, setMenuOpen]    = useState(false)
  const [dropOpen, setDropOpen]    = useState(false)

  const handleLogout = async () => { await logout(); navigate("/") }

  const dashboardPath = () => {
    if (role === "admin")     return "/admin"
    if (role === "team")      return "/team"
    if (role === "client")    return "/client"
    if (role === "community") return "/community"
    return null
  }
  const dashPath = dashboardPath()

  // Dark mode button styles — adapts to public dark
  const darkBtnStyle = {
    width: 34, height: 34, borderRadius: 8, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    backgroundColor: dark ? "rgba(255,255,255,0.08)" : "#f1f5f9",
    border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid #e2e8f0",
    color: dark ? "rgba(255,255,255,0.7)" : "#475569",
    transition: "all 0.15s",
  }

  return (
    <nav className="public-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-slate-200"
      style={{ backgroundColor: dark ? "rgba(13,15,22,0.95)" : "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderColor: dark ? "rgba(255,255,255,0.08)" : undefined, transition: "background-color 0.2s, border-color 0.2s" }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        <img src={logo2} alt="FashilHack" className="w-12 h-8 object-contain" />
        <span className="nav-brand font-heading font-black text-xl tracking-tight"
          style={{ color: dark ? "#ffffff" : undefined, transition: "color 0.2s" }}>
          FashilHack
        </span>
      </Link>

      {/* Desktop nav links */}
      <ul className="hidden md:flex items-center gap-8 list-none">
        {PUBLIC_LINKS.map(link => (
          <li key={link.to}>
            <Link to={link.to} className="nav-link font-sans text-sm font-semibold tracking-tight transition-colors"
              style={{ color: dark ? "rgba(255,255,255,0.65)" : "#475569" }}
              onMouseEnter={e => e.currentTarget.style.color = "#00aaff"}
              onMouseLeave={e => e.currentTarget.style.color = dark ? "rgba(255,255,255,0.65)" : "#475569"}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right side */}
      <div className="hidden md:flex items-center gap-3">

        {/* Dark mode toggle */}
        <button onClick={toggleDark} title={dark ? "Switch to light mode" : "Switch to dark mode"} style={darkBtnStyle}>
          {dark ? <IconSun /> : <IconMoon />}
        </button>

        {user ? (
          <div className="flex items-center gap-3">
            {dashPath && (
              <button
                onClick={() => navigate(dashPath)}
                style={{
                  fontFamily: "sans-serif", fontWeight: 700, fontSize: 13,
                  padding: "7px 18px", borderRadius: 8, cursor: "pointer",
                  backgroundColor: "#00aaff", color: "#ffffff",
                  border: "1px solid #00aaff", transition: "opacity 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Dashboard
              </button>
            )}
            <div className="relative">
              <button onClick={() => setDropOpen(d => !d)} className="flex items-center gap-3 focus:outline-none">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-heading font-black border text-[10px]"
                  style={{ backgroundColor: dark ? "rgba(255,255,255,0.08)" : "#f1f5f9", borderColor: dark ? "rgba(255,255,255,0.15)" : "#e2e8f0", color: dark ? "#fff" : "#0f172a" }}>
                  {userData?.displayName?.[0] || user.email[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-sans text-[10px] font-black text-accent uppercase tracking-tighter leading-none mb-1">{role}</p>
                  <p className="font-sans text-xs font-bold leading-none" style={{ color: dark ? "rgba(255,255,255,0.65)" : "#475569" }}>
                    {userData?.displayName || user.email.split("@")[0]}
                  </p>
                </div>
                <span style={{ color: dark ? "rgba(255,255,255,0.4)" : "#94a3b8", fontSize: 12 }}>▾</span>
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-12 w-52 shadow-xl py-2 z-50 rounded-xl overflow-hidden border"
                  style={{ backgroundColor: dark ? "#1a1d27" : "#ffffff", borderColor: dark ? "rgba(255,255,255,0.08)" : "#e2e8f0" }}>
                  <Link
                    to="/profile"
                    onClick={() => setDropOpen(false)}
                    style={{ display: "block", padding: "10px 16px", fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: t.heading, textDecoration: "none" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = t.sectionAlt}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    My Profile
                  </Link>
                  <div className="px-4 py-3 border-b" style={{ backgroundColor: dark ? "#13161f" : "#f8fafc", borderColor: dark ? "rgba(255,255,255,0.08)" : "#f1f5f9" }}>
                    <p className="font-sans text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: dark ? "rgba(255,255,255,0.35)" : "#94a3b8" }}>Signed in as</p>
                    <p className="font-sans text-xs font-bold truncate" style={{ color: dark ? "#f1f5f9" : "#0f172a" }}>{user.email}</p>
                  </div>
                  <button onClick={handleLogout} className="w-full text-left font-sans text-xs font-bold px-4 py-3 text-red-500 hover:bg-red-50 transition-colors">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 13, padding: "7px 18px", borderRadius: 8, cursor: "pointer", backgroundColor: "transparent", color: dark ? "rgba(255,255,255,0.75)" : "#475569", border: dark ? "1px solid rgba(255,255,255,0.2)" : "1px solid #e2e8f0", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#00aaff"; e.currentTarget.style.color = "#00aaff" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? "rgba(255,255,255,0.2)" : "#e2e8f0"; e.currentTarget.style.color = dark ? "rgba(255,255,255,0.75)" : "#475569" }}
            >Sign In</button>
            <button
              onClick={() => navigate("/signup")}
              style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 13, padding: "7px 18px", borderRadius: 8, cursor: "pointer", backgroundColor: "#00aaff", color: "#ffffff", border: "1px solid #00aaff", transition: "opacity 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >Join Community</button>
            <button onClick={() => navigate("/contact")}
              className="font-sans text-xs font-bold tracking-wide px-4 py-2 rounded border transition-colors whitespace-nowrap"
              style={{ borderColor: dark ? "rgba(255,255,255,0.2)" : "#cbd5e1", color: dark ? "rgba(255,255,255,0.65)" : "#475569" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#00aaff"; e.currentTarget.style.color = "#00aaff" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? "rgba(255,255,255,0.2)" : "#cbd5e1"; e.currentTarget.style.color = dark ? "rgba(255,255,255,0.65)" : "#475569" }}
            >
              Client Access →
            </button>
          </div>
        )}
      </div>

      {/* Mobile hamburger */}
      <div className="md:hidden flex items-center gap-2">
        <button onClick={toggleDark} style={darkBtnStyle}>{dark ? <IconSun /> : <IconMoon />}</button>
        <button className="text-xl" style={{ color: dark ? "#fff" : "#0f172a", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => setMenuOpen(m => !m)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 flex flex-col py-6 px-8 gap-5 md:hidden shadow-lg border-b"
          style={{ backgroundColor: dark ? "#0d0f16" : "#ffffff", borderColor: dark ? "rgba(255,255,255,0.08)" : "#e2e8f0" }}>
          {PUBLIC_LINKS.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
              className="font-sans text-base font-semibold transition-colors"
              style={{ color: dark ? "rgba(255,255,255,0.75)" : "#475569" }}>
              {link.label}
            </Link>
          ))}
          <div className="border-t pt-5 flex flex-col gap-3" style={{ borderColor: dark ? "rgba(255,255,255,0.08)" : "#f1f5f9" }}>
            {user ? (
              <button onClick={handleLogout} className="font-sans text-base font-semibold text-red-500 text-left" style={{ background: "none", border: "none", cursor: "pointer" }}>
                Sign Out
              </button>
            ) : (
              <>
                <Button variant="ghost" size="md" full onClick={() => { navigate("/login"); setMenuOpen(false) }}>Sign In</Button>
                <Button variant="primary" size="md" full onClick={() => { navigate("/signup"); setMenuOpen(false) }}>Join Community</Button>
                <button onClick={() => { navigate("/contact"); setMenuOpen(false) }}
                  className="font-sans text-sm font-bold text-center py-3 border rounded transition-colors"
                  style={{ borderColor: dark ? "rgba(255,255,255,0.2)" : "#e2e8f0", color: dark ? "rgba(255,255,255,0.65)" : "#475569" }}>
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