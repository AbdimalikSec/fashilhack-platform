import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../config/firebase"
import { useAuth } from "../../context/AuthContext"
import PortalLayout from "../../components/layout/PortalLayout"
import Card from "../../components/ui/Card"
import Badge from "../../components/ui/Badge"
import SectionTag from "../../components/ui/SectionTag"
import { useNavigate } from "react-router-dom"

export default function ClientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [engagements, setEngagements] = useState([])
  const [findings, setFindings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      try {
        // Fetch client engagements
        const eSnap = await getDocs(
          query(
            collection(db, "engagements"),
            where("clientUid", "==", user.uid)
          )
        )
        const eData = eSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        setEngagements(eData)

        // Fetch findings for those engagements
        if (eData.length > 0) {
          const fSnap = await getDocs(
            query(
              collection(db, "findings"),
              where("clientUid", "==", user.uid)
            )
          )
          setFindings(fSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  // Count findings by severity
  const countBySeverity = (sev) =>
    findings.filter(f => f.severity === sev).length

  const stats = [
    { label: "Engagements", value: engagements.length, color: "text-blue-primary" },
    { label: "Critical Findings", value: countBySeverity("critical"), color: "text-red-500" },
    { label: "High Findings", value: countBySeverity("high"), color: "text-orange-500" },
    { label: "Open Findings", value: findings.filter(f => f.status === "open").length, color: "text-yellow-400" },
  ]

  if (loading) return (
    <PortalLayout title="Dashboard">
      <div className="flex items-center justify-center h-64">
        <p className=" text-sm text-slate-400 animate-pulse font-bold tracking-widest">
          SYNCING...
        </p>
      </div>
    </PortalLayout>
  )

  return (
    <PortalLayout title="Client Dashboard">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {stats.map(s => (
          <Card key={s.label}>
            <div className={`font-heading font-black text-4xl ${s.color} mb-2`}>
              {s.value}
            </div>
            <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Active engagements */}
        <div>
          <SectionTag text="Active Engagements" />
          <div className="flex flex-col gap-4 mt-4">
            {engagements.length === 0 ? (
              <Card>
                <p className=" text-sm text-slate-500">
                  No engagements yet. Contact FashilHack to get started.
                </p>
              </Card>
            ) : engagements.map(e => (
              <Card
                key={e.id}
                onClick={() => navigate("/client/engagements")}
                className="flex items-center justify-between"
              >
                <div>
                  <p className=" font-black text-lg text-primary tracking-tight mb-1">
                    {e.title}
                  </p>
                  <p className=" text-xs text-slate-500 font-bold">
                    {e.phase} &nbsp;·&nbsp;
                    Started {e.startDate || "—"}
                  </p>
                </div>
                <Badge label={e.status} type={e.status} />
              </Card>
            ))}
          </div>
        </div>

        {/* Recent findings */}
        <div>
          <SectionTag text="Recent Findings" />
          <div className="flex flex-col gap-4 mt-4">
            {findings.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500">
                  No findings recorded yet.
                </p>
              </Card>
            ) : findings.slice(0, 5).map(f => (
              <Card
                key={f.id}
                onClick={() => navigate("/client/findings")}
                className="flex items-center justify-between"
              >
                <div>
                  <p className=" font-black text-lg text-primary tracking-tight mb-1">
                    {f.title}
                  </p>
                  <p className="text-xs text-slate-500 font-bold">
                    {f.engagementTitle || "—"}
                  </p>
                </div>
                <Badge label={f.severity} type={f.severity} />
              </Card>
            ))}
            {findings.length > 5 && (
              <button
                onClick={() => navigate("/client/findings")}
                className=" text-sm font-black text-accent hover:underline text-left mt-2"
              >
                View all {findings.length} findings →
              </button>
            )}
          </div>
        </div>
      </div>

    </PortalLayout>
  )
}