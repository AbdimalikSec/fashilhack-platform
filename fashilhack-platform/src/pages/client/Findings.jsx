import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db }       from "../../config/firebase"
import { useAuth }  from "../../context/AuthContext"
import PortalLayout from "../../components/layout/PortalLayout"
import Card         from "../../components/ui/Card"
import Badge        from "../../components/ui/Badge"
import SectionTag   from "../../components/ui/SectionTag"

const SEVERITIES = ["all", "critical", "high", "medium", "low", "info"]

export default function Findings() {
  const { user }                = useAuth()
  const [findings, setFindings] = useState([])
  const [filter, setFilter]     = useState("all")
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const snap = await getDocs(
        query(collection(db, "findings"), where("clientUid", "==", user.uid))
      )
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setFindings(data)
      setLoading(false)
    }
    fetch()
  }, [user])

  const filtered = filter === "all"
    ? findings
    : findings.filter(f => f.severity === filter)

  if (loading) return (
    <PortalLayout title="Findings">
      <div className="flex items-center justify-center h-64">
        <p className=" text-xs text-dim animate-pulse tracking-widest">LOADING...</p>
      </div>
    </PortalLayout>
  )

  return (
    <PortalLayout title="Findings">

      {/* Severity filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SEVERITIES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`
               text-xs tracking-widest uppercase
              px-4 py-2 border transition-all
              ${filter === s
                ? "bg-green-primary text-dark-900 border-green-primary"
                : "border-green-primary/20 text-dim hover:border-green-primary/50"
              }
            `}
          >
            {s} {s !== "all" && `(${findings.filter(f => f.severity === s).length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Findings list */}
        <div>
          <SectionTag text={`${filtered.length} Finding${filtered.length !== 1 ? "s" : ""}`} />
          <div className="flex flex-col gap-3 mt-3 max-h-[70vh] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <Card>
                <p className=" text-xs text-dim">No findings found.</p>
              </Card>
            ) : filtered.map(f => (
              <Card
                key={f.id}
                onClick={() => setSelected(f)}
                className={`
                  ${selected?.id === f.id
                    ? "border-green-primary/50 bg-green-primary/5"
                    : ""
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-rajdhani font-bold text-sm leading-tight">
                    {f.title}
                  </p>
                  <Badge label={f.severity} type={f.severity} />
                </div>
                <p className=" text-xs text-dim mt-2">
                  {f.engagementTitle || "—"}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Finding detail */}
        <div className="md:col-span-2">
          {selected ? (
            <Card>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <SectionTag text="Finding Detail" />
                  <h2 className=" font-bold text-lg mt-1">
                    {selected.title}
                  </h2>
                </div>
                <Badge label={selected.severity} type={selected.severity} />
              </div>

              {/* Meta */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "CVSS",   value: selected.cvss     || "—" },
                  { label: "Status", value: <Badge label={selected.status} type={selected.status === "open" ? "critical" : "active"} /> },
                  { label: "Found",  value: selected.createdAt?.toDate?.()?.toLocaleDateString() || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-green-primary/10 p-3">
                    <p className=" text-xs text-dim tracking-widest uppercase mb-1">{label}</p>
                    <div className=" text-xs text-white">{value}</div>
                  </div>
                ))}
              </div>

              {/* Sections */}
              {[
                { label: "Description",       value: selected.description   },
                { label: "Impact",            value: selected.impact        },
                { label: "Remediation Steps", value: selected.remediation   },
                { label: "References",        value: selected.references    },
              ].map(({ label, value }) => value && (
                <div key={label} className="mb-5 border-t border-green-primary/10 pt-5">
                  <p className=" text-xs text-green-primary tracking-widest uppercase mb-2">
                    {label}
                  </p>
                  <p className=" text-xs text-dim leading-relaxed">
                    {value}
                  </p>
                </div>
              ))}
            </Card>
          ) : (
            <Card>
              <p className=" text-xs text-dim">
                Select a finding to view full details.
              </p>
            </Card>
          )}
        </div>
      </div>
    </PortalLayout>
  )
}