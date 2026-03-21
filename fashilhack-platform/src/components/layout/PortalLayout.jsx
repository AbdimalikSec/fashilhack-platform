import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useRole } from "../../hooks/useRole"
import { useDark } from "../../context/DarkModeContext"
import Badge from "../ui/Badge"
import logo2 from "../../assets/logo2.png"

const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const IconBriefcase = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
)
const IconTarget = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)
const IconFileText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconUserPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
)
const IconHome = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const IconChevronLeft = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IconChevronRight = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
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
const IconBook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)

const NAV = {
  client: [
    { label: "Dashboard",   to: "/client",             icon: <IconDashboard /> },
    { label: "Engagements", to: "/client/engagements", icon: <IconBriefcase /> },
    { label: "Findings",    to: "/client/findings",    icon: <IconTarget /> },
    { label: "Reports",     to: "/client/reports",     icon: <IconFileText /> },
  ],
  team: [
    { label: "Dashboard",   to: "/team",               icon: <IconDashboard /> },
    { label: "Engagements", to: "/team/engagements",   icon: <IconBriefcase /> },
    { label: "Findings",    to: "/team/findings",      icon: <IconTarget /> },
    { label: "Users",       to: "/team/users",         icon: <IconUsers /> },
  ],
  admin: [
    { label: "Dashboard",   to: "/admin",              icon: <IconDashboard /> },
    { label: "Engagements", to: "/team/engagements",   icon: <IconBriefcase /> },
    { label: "Findings",    to: "/team/findings",      icon: <IconTarget /> },
    { label: "Users",       to: "/team/users",         icon: <IconUsers /> },
    { label: "Courses", to: "/admin/courses", icon: <IconBook /> },
    { label: "Create Users", to: "/admin/users",       icon: <IconUserPlus /> },
  ],
}

const SB = {
  bg:                   "#0d1117",
  border:               "rgba(255,255,255,0.08)",
  logoBoxBg:            "rgba(0,170,255,0.12)",
  logoBoxBorder:        "rgba(0,170,255,0.3)",
  nameColor:            "#ffffff",
  subtitleColor:        "#00aaff",
  activeBg:             "rgba(0,170,255,0.15)",
  activeBorder:         "#00aaff",
  activeText:           "#00aaff",
  inactiveText:         "rgba(255,255,255,0.45)",
  inactiveHoverText:    "rgba(255,255,255,0.9)",
  inactiveHoverBg:      "rgba(255,255,255,0.06)",
  bottomText:           "rgba(255,255,255,0.4)",
  bottomHoverText:      "#ffffff",
  toggleBg:             "#161b22",
  toggleBorder:         "rgba(255,255,255,0.18)",
  toggleColor:          "rgba(255,255,255,0.5)",
}

export default function PortalLayout({ children, title }) {
  const { logout, userData, user } = useAuth()
  const { role }                   = useRole()
  const { portalDark: dark, togglePortalDark: toggleDark } = useDark()
  const location                   = useLocation()
  const navigate                   = useNavigate()
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = NAV[role] || NAV.client
  const handleLogout = async () => { await logout(); navigate("/login") }

  return (
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "var(--color-bg)", transition: "background-color 0.2s" }}>

      <aside
        style={{
          backgroundColor: SB.bg,
          borderRight: `1px solid ${SB.border}`,
          width: collapsed ? 80 : 256,
          flexShrink: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s",
        }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: collapsed ? "24px 18px" : "24px 20px",
          borderBottom: `1px solid ${SB.border}`,
        }}>
          <div>
            <img src={logo2} alt="FH" className="w-8 h-8 object-contain shrink-0" />
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: SB.nameColor, fontWeight: 900, fontSize: 15, letterSpacing: "-0.03em", lineHeight: 1.15, whiteSpace: "nowrap" }}>
                FashilHack
              </div>
              <div style={{ color: SB.subtitleColor, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>
                Security Platform
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "20px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {links.map(link => {
            const active = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: collapsed ? "11px 0" : "10px 14px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 8,
                  borderLeft: active ? `2px solid ${SB.activeBorder}` : "2px solid transparent",
                  backgroundColor: active ? SB.activeBg : "transparent",
                  color: active ? SB.activeText : SB.inactiveText,
                  fontWeight: 600, fontSize: 13, letterSpacing: "-0.01em",
                  textDecoration: "none", transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = SB.inactiveHoverText; e.currentTarget.style.backgroundColor = SB.inactiveHoverBg } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = SB.inactiveText; e.currentTarget.style.backgroundColor = "transparent" } }}
              >
                <span style={{ flexShrink: 0 }}>{link.icon}</span>
                {!collapsed && <span>{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: `1px solid ${SB.border}`, padding: collapsed ? "16px 12px" : "20px" }}>
          {!collapsed && (
            <div style={{ marginBottom: 14 }}>
              <Badge label={role} type={role} />
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, marginTop: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userData?.displayName || user?.email?.split("@")[0]}
              </p>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Link
              to="/"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", color: SB.bottomText, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = SB.bottomHoverText}
              onMouseLeave={e => e.currentTarget.style.color = SB.bottomText}
            >
              <span style={{ flexShrink: 0 }}><IconHome /></span>
              {!collapsed && "Public Site"}
            </Link>
            <button
              onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", background: "none", border: "none", cursor: "pointer", color: SB.bottomText, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
              onMouseLeave={e => e.currentTarget.style.color = SB.bottomText}
            >
              <span style={{ flexShrink: 0 }}><IconLogout /></span>
              {!collapsed && "Logout"}
            </button>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            position: "absolute", right: -12, top: 80,
            width: 24, height: 24, borderRadius: "50%",
            backgroundColor: SB.toggleBg, border: `1px solid ${SB.toggleBorder}`,
            color: SB.toggleColor, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
        </button>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          backgroundColor: "var(--color-surface)", borderBottom: "1px solid var(--color-border)",
          padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 40, transition: "background-color 0.2s, border-color 0.2s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-txt-subtle)", padding: 8, borderRadius: 8, border: "none", cursor: "pointer", display: "flex" }}
              className="md:hidden"
              onClick={() => setMobileOpen(m => !m)}
            >
              <IconMenu />
            </button>
            <h1 style={{ color: "var(--color-txt)", fontWeight: 900, fontSize: 20, letterSpacing: "-0.03em", margin: 0 }}>
              {title}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="hidden sm:flex" style={{ flexDirection: "column", alignItems: "flex-end", marginRight: 4 }}>
              <span style={{ color: "var(--color-accent)", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1 }}>
                {role} Portal
              </span>
              <span style={{ color: "var(--color-txt-muted)", fontSize: 10, fontWeight: 700, marginTop: 3 }}>
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
              </span>
            </div>
            <button
              onClick={toggleDark}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: "var(--color-surface-alt)", border: "1px solid var(--color-border)",
                color: "var(--color-txt-subtle)", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {dark ? <IconSun /> : <IconMoon />}
            </button>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              backgroundColor: "var(--color-surface-alt)", border: "1px solid var(--color-border)",
              color: "var(--color-txt)", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 14,
            }}>
              {userData?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        {mobileOpen && (
          <div style={{
            backgroundColor: "var(--color-surface)", borderBottom: "1px solid var(--color-border)",
            padding: "24px 32px", display: "flex", flexDirection: "column", gap: 16,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 50,
          }} className="md:hidden">
            {links.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                style={{ color: "var(--color-txt-subtle)", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
                <span style={{ color: "var(--color-txt-muted)" }}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <div style={{ height: 1, backgroundColor: "var(--color-border)", margin: "4px 0" }} />
            <Link to="/" style={{ color: "var(--color-txt-muted)", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <IconHome /> Public Site
            </Link>
            <button onClick={handleLogout} style={{ color: "#f87171", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <IconLogout /> Logout
            </button>
          </div>
        )}

        {/* Page content */}
        <main style={{ flex: 1, padding: "32px", overflowY: "auto", backgroundColor: "var(--color-bg)", transition: "background-color 0.2s" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}