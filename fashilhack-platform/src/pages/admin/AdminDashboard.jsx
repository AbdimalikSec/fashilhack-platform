import PortalLayout from "../../components/layout/PortalLayout"
import { useNavigate } from "react-router-dom"
import Card from "../../components/ui/Card"
import SectionTag from "../../components/ui/SectionTag"

const IconFolder = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)
const IconSearch = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const IconUsers = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconGlobe = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const SHORTCUTS = [
  { label: "Manage Engagements", to: "/team/engagements", icon: <IconFolder />, desc: "Create and update client engagements" },
  { label: "Manage Findings",    to: "/team/findings",    icon: <IconSearch />, desc: "Log and track vulnerability findings" },
  { label: "Manage Users",       to: "/team/users",       icon: <IconUsers />,  desc: "Approve, reject and manage user roles" },
  { label: "Community",          to: "/community",        icon: <IconGlobe />,  desc: "View and manage community content" },
]

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <PortalLayout title="Admin Dashboard">
      <SectionTag text="Admin Controls" />
      <h2 className="font-heading font-black text-3xl mb-8 mt-2 tracking-tight">
        Welcome, <span className="text-accent">Manager</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {SHORTCUTS.map(s => (
          <Card key={s.label} onClick={() => navigate(s.to)} className="group cursor-pointer">
            <div className="text-slate-300 group-hover:text-accent transition-colors duration-300 mb-4">
              {s.icon}
            </div>
            <h3 className="font-sans font-bold text-lg mb-2 text-primary">{s.label}</h3>
            <p className="font-sans text-sm text-slate-500 leading-relaxed">{s.desc}</p>
          </Card>
        ))}
      </div>
    </PortalLayout>
  )
}