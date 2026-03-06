import { useEffect, useState } from "react"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "../../config/firebase"
import PortalLayout from "../../components/layout/PortalLayout"
import Card from "../../components/ui/Card"
import Badge from "../../components/ui/Badge"
import SectionTag from "../../components/ui/SectionTag"
import { useNavigate } from "react-router-dom"

export default function TeamDashboard() {
  const navigate = useNavigate()
  const [engagements, setEngagements] = useState([])
  const [findings, setFindings] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [eSnap, fSnap, uSnap] = await Promise.all([
          getDocs(collection(db, "engagements")),
          getDocs(collection(db, "findings")),
          getDocs(collection(db, "users")),
        ])
        setEngagements(eSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setFindings(fSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const pending = users.filter(u => u.role === "pending")
  const clients = users.filter(u => u.role === "client")
  const critical = findings.filter(f => f.severity === "critical" && f.status === "open")
  const active = engagements.filter(e => e.status === "active")

  const stats = [
    { label: "Active Engagements", value: active.length, color: "text-blue-primary", click: "/team/engagements" },
    { label: "Total Clients", value: clients.length, color: "text-green-primary", click: "/team/users" },
    { label: "Critical Open", value: critical.length, color: "text-red-500", click: "/team/findings" },
    { label: "Pending Approvals", value: pending.length, color: "text-yellow-400", click: "/team/users" },
  ]

  if (loading) return (
    <PortalLayout title="Team Dashboard">
      <div className="flex items-center justify-center h-64">
        <p className="font-sans text-sm text-slate-400 animate-pulse font-bold tracking-widest">SYNCING...</p>
      </div>
    </PortalLayout>
  )

  return (
    <PortalLayout title="Team Dashboard">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {stats.map(s => (
          <Card key={s.label} onClick={() => navigate(s.click)} className="cursor-pointer hover:border-primary transition-all">
            <div className={`font-heading font-black text-4xl ${s.color} mb-2`}>
              {s.value}
            </div>
            <div className="font-sans text-[10px] text-slate-400 font-black tracking-widest uppercase">
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

        {/* Recent engagements */}
        <div>
          <SectionTag text="Recent Engagements" />
          <div className="flex flex-col gap-4 mt-4">
            {engagements.length === 0 ? (
              <Card>
                <p className="font-sans text-sm text-slate-500">No engagements yet.</p>
              </Card>
            ) : engagements.slice(0, 5).map(e => (
              <Card
                key={e.id}
                onClick={() => navigate("/team/engagements")}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-sans font-black text-md text-primary tracking-tight mb-1">{e.title}</p>
                  <p className="font-sans text-xs text-slate-500 font-bold">
                    {e.clientName || "—"} &nbsp;·&nbsp; {e.phase || "—"}
                  </p>
                </div>
                <Badge label={e.status} type={e.status} />
              </Card>
            ))}
          </div>
        </div>

        {/* Critical findings */}
        <div>
          <SectionTag text="Open Critical Findings" />
          <div className="flex flex-col gap-4 mt-4">
            {critical.length === 0 ? (
              <Card>
                <p className="font-sans text-sm text-slate-500">
                  ✓ No open critical findings.
                </p>
              </Card>
            ) : critical.slice(0, 5).map(f => (
              <Card
                key={f.id}
                onClick={() => navigate("/team/findings")}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-sans font-black text-md text-primary tracking-tight mb-1">{f.title}</p>
                  <p className="font-sans text-xs text-slate-500 font-bold">{f.clientName || "—"}</p>
                </div>
                <Badge label="critical" type="critical" />
              </Card>
            ))}
          </div>
        </div>

        {/* Pending approvals */}
        <div>
          <SectionTag text="Pending User Approvals" />
          <div className="flex flex-col gap-4 mt-4">
            {pending.length === 0 ? (
              <Card>
                <p className="font-sans text-sm text-slate-500">
                  ✓ No pending approvals.
                </p>
              </Card>
            ) : pending.slice(0, 4).map(u => (
              <Card
                key={u.id}
                onClick={() => navigate("/team/users")}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-sans font-black text-md text-primary tracking-tight mb-1">
                    {u.displayName}
                  </p>
                  <p className="font-sans text-xs text-slate-500 font-bold">{u.email}</p>
                </div>
                <Badge label="pending" type="pending" />
              </Card>
            ))}
            {pending.length > 4 && (
              <button
                onClick={() => navigate("/team/users")}
                className="font-sans text-sm font-black text-accent hover:underline text-left mt-2"
              >
                +{pending.length - 4} more pending →
              </button>
            )}
          </div>
        </div>

        {/* Severity breakdown */}
        <div>
          <SectionTag text="Findings Breakdown" />
          <Card className="mt-4 p-6">
            {["critical", "high", "medium", "low", "info"].map(sev => {
              const count = findings.filter(f => f.severity === sev).length
              const pct = findings.length
                ? Math.round((count / findings.length) * 100)
                : 0
              const colors = {
                critical: "bg-red-500",
                high: "bg-orange-500",
                medium: "bg-yellow-400",
                low: "bg-primary",
                info: "bg-slate-300",
              }
              return (
                <div key={sev} className="mb-6 last:mb-0">
                  <div className="flex justify-between mb-2">
                    <span className="font-sans text-[10px] font-black tracking-widest uppercase text-slate-400">
                      {sev}
                    </span>
                    <span className="font-sans text-xs font-black text-primary">
                      {count}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 w-full rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[sev]} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </Card>
        </div>

      </div>
    </PortalLayout>
  )
}