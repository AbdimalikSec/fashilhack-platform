import React from 'react'
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useRole } from "../../hooks/useRole"
import Badge from "../ui/Badge"
import logo from "../../assets/logo.png"

const NAV = {
  client: [
    { label: "Dashboard", to: "/client", icon: "📊" },
    { label: "Engagements", to: "/client/engagements", icon: "💼" },
    { label: "Findings", to: "/client/findings", icon: "🎯" },
    { label: "Reports", to: "/client/reports", icon: "📄" },
  ],
  team: [
    { label: "Dashboard", to: "/team", icon: "📊" },
    { label: "Engagements", to: "/team/engagements", icon: "💼" },
    { label: "Findings", to: "/team/findings", icon: "🎯" },
    { label: "Users", to: "/team/users", icon: "👥" },
  ],
  admin: [
    { label: "Dashboard", to: "/admin", icon: "📊" },
    { label: "Engagements", to: "/team/engagements", icon: "💼" },
    { label: "Findings", to: "/team/findings", icon: "🎯" },
    { label: "Users", to: "/team/users", icon: "👥" },
  ],
}

export default function PortalLayout({ children, title }) {
  const { logout, userData, user } = useAuth()
  const { role } = useRole()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = NAV[role] || NAV.client

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── SIDEBAR ── */}
      <aside className={`
        hidden md:flex flex-col
        bg-white border-r border-slate-200
        transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
        relative
      `}>

        {/* Logo */}
        <div className={`
          flex items-center gap-3 px-6 py-8
          border-b border-slate-100
        `}>
          <img src={logo} alt="FH" className="w-12 h-12 object-contain shrink-0" />
          {!collapsed && (
            <span className="
              font-heading font-black text-xl tracking-tighter
              text-primary
            ">
              FashilHack
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-8 flex flex-col gap-1 px-3">
          {links.map(link => {
            const active = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  flex items-center gap-4 px-4 py-3
                  font-sans text-sm font-semibold
                  transition-all duration-200 rounded-lg
                  ${active
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-500 hover:text-primary hover:bg-slate-50"
                  }
                `}
              >
                <span className="text-lg">{link.icon}</span>
                {!collapsed && (
                  <span className="tracking-tight">{link.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User info + Profile shortcut */}
        <div className="border-t border-slate-100 p-6 space-y-4">
          {!collapsed && (
            <div className="flex flex-col">
              <Badge label={role} type={role} />
              <p className="font-sans text-xs text-slate-500 font-bold mt-3 truncate">
                {userData?.displayName || user?.email.split('@')[0]}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Link
              to="/"
              className={`
                flex items-center gap-3 py-2 text-slate-400 hover:text-primary transition-colors
                font-sans text-xs font-bold uppercase tracking-widest
              `}
            >
              <span>🏠</span> {!collapsed && "Public Site"}
            </Link>
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-3 py-2 text-red-400 hover:text-red-500 transition-colors
                font-sans text-xs font-bold uppercase tracking-widest
              `}
            >
              <span>🚪</span> {!collapsed && "Logout"}
            </button>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="
            absolute -right-3 top-20 w-6 h-6 rounded-full
            bg-white border border-slate-200 
            flex items-center justify-center
            text-[10px] text-slate-400 hover:text-primary
            shadow-sm z-10
          "
        >
          {collapsed ? "→" : "←"}
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="
          bg-white/80 backdrop-blur-md
          border-b border-slate-200
          px-8 py-4
          flex items-center justify-between
          sticky top-0 z-40
        ">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-primary p-2 -ml-2 hover:bg-slate-50 rounded"
              onClick={() => setMobileOpen(m => !m)}
            >
              <span className="text-xl">☰</span>
            </button>
            <h1 className="font-heading font-black text-xl text-primary tracking-tight">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="font-sans text-xs font-bold text-accent uppercase tracking-widest leading-none mb-1">{role} Portal</span>
              <span className="font-sans text-[10px] text-slate-400 font-bold">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-heading font-black text-primary text-xs">
              {userData?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="
            md:hidden bg-white border-b border-slate-200
            flex flex-col py-6 px-8 gap-4 shadow-xl z-50
          ">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-4 font-sans text-base font-bold text-slate-600 hover:text-primary"
              >
                <span>{link.icon}</span> {link.label}
              </Link>
            ))}
            <div className="h-px bg-slate-100 my-2" />
            <Link to="/" className="font-sans text-sm font-bold text-slate-400 hover:text-primary">🏠 Public Site</Link>
            <button onClick={handleLogout} className="text-left font-sans text-sm font-bold text-red-500">🚪 Logout</button>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-8 lg:p-12 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
