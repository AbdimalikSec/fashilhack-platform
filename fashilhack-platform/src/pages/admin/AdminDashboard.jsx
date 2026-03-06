import PortalLayout from "../../components/layout/PortalLayout"
import { useNavigate } from "react-router-dom"
import Card from "../../components/ui/Card"
import SectionTag from "../../components/ui/SectionTag"

const SHORTCUTS = [
  { label: "Manage Engagements", to: "/team/engagements", icon: "📁", desc: "Create and update client engagements" },
  { label: "Manage Findings", to: "/team/findings", icon: "🔍", desc: "Log and track vulnerability findings" },
  { label: "Manage Users", to: "/team/users", icon: "👥", desc: "Approve, reject and manage user roles" },
  { label: "Community", to: "/community", icon: "🌐", desc: "View and manage community content" },
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
          <Card key={s.label} onClick={() => navigate(s.to)} className="group">
            <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-300">{s.icon}</div>
            <h3 className="font-sans font-bold text-lg mb-2 text-primary">{s.label}</h3>
            <p className="font-sans text-sm text-slate-500 leading-relaxed">{s.desc}</p>
          </Card>
        ))}
      </div>
    </PortalLayout>
  )
}