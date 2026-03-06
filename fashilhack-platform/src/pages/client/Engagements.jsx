import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db }          from "../../config/firebase"
import { useAuth }     from "../../context/AuthContext"
import PortalLayout    from "../../components/layout/PortalLayout"
import Card            from "../../components/ui/Card"
import Badge           from "../../components/ui/Badge"
import SectionTag      from "../../components/ui/SectionTag"

export default function Engagements() {
  const { user }                      = useAuth()
  const [engagements, setEngagements] = useState([])
  const [selected, setSelected]       = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const snap = await getDocs(
        query(collection(db, "engagements"), where("clientUid", "==", user.uid))
      )
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setEngagements(data)
      if (data.length > 0) setSelected(data[0])
      setLoading(false)
    }
    fetch()
  }, [user])

  const PHASES = ["Discovery", "Reconnaissance", "Exploitation", "Reporting", "Remediation"]

  const phaseIndex = (phase) =>
    PHASES.findIndex(p => p.toLowerCase() === phase?.toLowerCase())

  if (loading) return (
    <PortalLayout title="Engagements">
      <div className="flex items-center justify-center h-64">
        <p className="font-mono text-xs text-dim animate-pulse tracking-widest">LOADING...</p>
      </div>
    </PortalLayout>
  )

  return (
    <PortalLayout title="Engagements">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Engagement list */}
        <div>
          <SectionTag text="Your Engagements" />
          <div className="flex flex-col gap-3 mt-3">
            {engagements.length === 0 ? (
              <Card>
                <p className="font-mono text-xs text-dim">
                  No engagements yet.
                </p>
              </Card>
            ) : engagements.map(e => (
              <Card
                key={e.id}
                onClick={() => setSelected(e)}
                className={`
                  ${selected?.id === e.id
                    ? "border-green-primary/50 bg-green-primary/5"
                    : ""
                  }
                `}
              >
                <p className="font-rajdhani font-bold mb-1">{e.title}</p>
                <Badge label={e.status} type={e.status} />
              </Card>
            ))}
          </div>
        </div>

        {/* Engagement detail */}
        <div className="md:col-span-2">
          {selected ? (
            <Card>
              <SectionTag text="Engagement Detail" />
              <h2 className="font-orbitron font-bold text-xl mb-6 mt-1">
                {selected.title}
              </h2>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: "Status",    value: <Badge label={selected.status} type={selected.status} /> },
                  { label: "Phase",     value: selected.phase     || "—" },
                  { label: "Start",     value: selected.startDate || "—" },
                  { label: "End (ETA)", value: selected.endDate   || "—" },
                  { label: "Scope",     value: selected.scope     || "—" },
                  { label: "Type",      value: selected.type      || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-green-primary/10 p-3">
                    <p className="font-mono text-xs text-dim tracking-widest uppercase mb-1">
                      {label}
                    </p>
                    <div className="font-mono text-xs text-white">
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Phase progress */}
              <div>
                <p className="font-mono text-xs text-dim tracking-widest uppercase mb-4">
                  Progress
                </p>
                <div className="flex gap-0">
                  {PHASES.map((phase, i) => {
                    const current = phaseIndex(selected.phase)
                    const done    = i < current
                    const active  = i === current
                    return (
                      <div key={phase} className="flex-1 text-center">
                        <div className={`
                          h-1 mb-3 transition-all
                          ${done   ? "bg-green-primary" : ""}
                          ${active ? "bg-gradient-to-r from-green-primary to-blue-primary" : ""}
                          ${!done && !active ? "bg-dark-600" : ""}
                        `} />
                        <p className={`
                          font-mono text-xs
                          ${active ? "text-green-primary" : ""}
                          ${done   ? "text-green-primary/50" : ""}
                          ${!done && !active ? "text-dim/40" : ""}
                        `}>
                          {phase}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Description */}
              {selected.description && (
                <div className="mt-6 border-t border-green-primary/10 pt-6">
                  <p className="font-mono text-xs text-dim tracking-widest uppercase mb-2">
                    Scope Notes
                  </p>
                  <p className="font-mono text-xs text-dim leading-relaxed">
                    {selected.description}
                  </p>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <p className="font-mono text-xs text-dim">
                Select an engagement to view details.
              </p>
            </Card>
          )}
        </div>
      </div>
    </PortalLayout>
  )
}