import React from 'react'
import { Link } from "react-router-dom"

function ShieldLogo() {
  return (
    <svg width="24" height="28" viewBox="0 0 38 44" fill="none">
      <path d="M19 1L2 8V22C2 31.5 9.5 40.2 19 43C28.5 40.2 36 31.5 36 22V8L19 1Z"
        stroke="#0f172a" strokeWidth="2.5" fill="rgba(15, 23, 42, 0.05)" />
      <path d="M12 22L17 27L27 17"
        stroke="#2563eb" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const LINKS = {
  Services: [
    { label: "Penetration Testing", to: "/services" },
    { label: "Web App Security", to: "/services" },
    { label: "Cloud Security", to: "/services" },
    { label: "Compliance", to: "/services" },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "Community", to: "/community" },
    { label: "Contact", to: "/contact" },
  ],
  Portals: [
    { label: "Client Login", to: "/login" },
    { label: "Community Login", to: "/login" },
    { label: "Sign Up", to: "/signup" },
  ],
}

export default function Footer() {
  return (
    <footer className="
      relative z-10
      bg-white
      border-t border-slate-100
    ">
      <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-6">
            <ShieldLogo />
            <span className="
              font-heading font-black text-base text-primary
            ">
              FashilHack
            </span>
          </Link>
          <p className="font-sans text-sm text-slate-500 leading-relaxed">
            Simulating Attacks,<br />Securing Businesses.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([title, links]) => (
          <div key={title}>
            <h4 className="font-heading font-bold text-xs tracking-widest uppercase text-primary mb-6">
              {title}
            </h4>
            <ul className="flex flex-col gap-4">
              {links.map(link => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="font-sans text-sm text-slate-500 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="
        border-t border-slate-50
        px-8 py-6
        flex flex-col md:flex-row
        items-center justify-between gap-4
      ">
        <span className="font-sans text-xs text-slate-400">
          © 2025 <span className="text-primary font-bold">FashilHack</span>. All rights reserved.
        </span>
        <span className="font-sans text-xs text-slate-400">
          Professional Cybersecurity Operations
        </span>
      </div>
    </footer>
  )
}