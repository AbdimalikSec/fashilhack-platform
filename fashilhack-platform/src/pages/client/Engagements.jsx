import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db }       from "../../config/firebase"
import { useAuth }  from "../../context/AuthContext"
import PortalLayout from "../../components/layout/PortalLayout"
import Badge        from "../../components/ui/Badge"
import SectionTag   from "../../components/ui/SectionTag"

const PHASES = ["Discovery","Reconnaissance","Exploitation","Reporting","Remediation","Completed"]

const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconShield = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IconTarget = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)
const IconEmpty = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
)

const ACCENT = "#00aaff"

export default function Engagements() {
  const { user }                        = useAuth()
  const [engagements, setEngagements]   = useState([])
  const [selected,    setSelected]      = useState(null)
  const [loading,     setLoading]       = useState(true)

  useEffect(() => {
    if (!user) return
    getDocs(query(collection(db, "engagements"), where("clientUid", "==", user.uid)))
      .then(snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setEngagements(data)
        if (data.length > 0) setSelected(data[0])
      })
      .catch(err => console.warn("Engagements fetch:", err.message))
      .finally(() => setLoading(false))
  }, [user])

  const phaseIndex = (phase) =>
    PHASES.findIndex(p => p.toLowerCase() === phase?.toLowerCase())

  if (loading) return (
    <PortalLayout title="Engagements">
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-slate-400 font-black tracking-widest uppercase animate-pulse">
          Loading...
        </p>
      </div>
    </PortalLayout>
  )

  return (
    <PortalLayout title="Engagements">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ── LIST ── */}
        <div>
          <SectionTag text="Your Engagements" />
          <div className="flex flex-col gap-3 mt-4">
            {engagements.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-xl p-8 text-center">
                <div className="text-slate-200 flex justify-center mb-3"><IconEmpty /></div>
                <p className="text-sm text-slate-400 font-bold">No engagements yet.</p>
                <p className="text-xs text-slate-300 mt-1">Your team will create one for you.</p>
              </div>
            ) : engagements.map(e => (
              <div
                key={e.id}
                onClick={() => setSelected(e)}
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  selected?.id === e.id
                    ? "border-[#00aaff] bg-[#00aaff]/5 shadow-md shadow-[#00aaff]/10"
                    : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                }`}
              >
                <h4 className="text-sm font-black text-[#0f172a] leading-tight mb-2">{e.title}</h4>
                <Badge label={e.status} type={e.status} />
              </div>
            ))}
          </div>
        </div>

        {/* ── DETAIL ── */}
        <div className="md:col-span-2">
          {selected ? (
            <div className="flex flex-col gap-5">

              {/* Header */}
              <div className="bg-white border border-slate-100 rounded-2xl p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                  <div>
                    <SectionTag text="Engagement Detail" />
                    <h2 className="font-heading font-black text-3xl text-[#161b22] mt-2 tracking-tight leading-tight">
                      {selected.title}
                     
                    </h2>
                    {selected.type && (
                      <p className="text-sm font-bold text-slate-400 mt-1.5 uppercase tracking-widest">
                        {selected.type} Pentest
                      </p>
                    )}
                  </div>
                  <Badge label={selected.status} type={selected.status} />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Phase",    value: selected.phase     || "—", icon: <IconShield /> },
                    { label: "Started",  value: selected.startDate || "TBD", icon: <IconCalendar /> },
                    { label: "Deadline", value: selected.endDate   || "—", icon: <IconCalendar /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                        {icon}
                        <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
                      </div>
                      <p className="text-sm font-black text-[#0f172a]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scope */}
              {selected.scope && (
                <div className="bg-white border border-slate-100 rounded-2xl p-6">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                    Target Scope
                  </p>
                  <div className="bg-slate-900 rounded-xl p-4">
                    <code className="text-green-400 text-sm font-mono leading-relaxed break-all">
                      {selected.scope}
                    </code>
                  </div>
                </div>
              )}

              {/* Phase progress bar */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6">
                <p className="text-[10px] font-black uppercase tracking-widest mb-5" style={{ color: ACCENT }}>
                  Progress
                </p>
                <div className="flex gap-0">
                  {PHASES.map((phase, i) => {
                    const current = phaseIndex(selected.phase)
                    const done    = i < current
                    const active  = i === current
                    return (
                      <div key={phase} className="flex-1 text-center">
                        <div className={`h-1.5 mb-3 rounded-full transition-all ${
                          done   ? "bg-[#00aaff]" :
                          active ? "bg-[#00aaff]/40" :
                                   "bg-slate-100"
                        }`} />
                        <p className={`text-[9px] font-black uppercase tracking-wider leading-tight ${
                          active ? "text-[#00aaff]" :
                          done   ? "text-slate-400" :
                                   "text-slate-200"
                        }`}>
                          {phase}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              {selected.description && (
                <div className="bg-white border border-slate-100 rounded-2xl p-6">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
                    Notes
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
                    {selected.description}
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center py-24 text-center">
              <div className="text-slate-200 mb-4"><IconTarget /></div>
              <p className="font-heading font-black text-lg text-[#0f172a] mb-2">No Engagement Selected</p>
              <p className="text-sm text-slate-400">Select one from the list.</p>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  )
}