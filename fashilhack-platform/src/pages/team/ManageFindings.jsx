import { useEffect, useState } from "react"
import {
  collection, getDocs, addDoc,
  updateDoc, doc, serverTimestamp
} from "firebase/firestore"
import { notifyFinding } from "../../api/index"
import { db }       from "../../config/firebase"
import { useAuth }  from "../../context/AuthContext"
import PortalLayout from "../../components/layout/PortalLayout"
import Card         from "../../components/ui/Card"
import Badge        from "../../components/ui/Badge"
import Button       from "../../components/ui/Button"
import SectionTag   from "../../components/ui/SectionTag"

const SEVERITIES = ["critical","high","medium","low","info"]
const STATUSES   = ["open","in-review","remediated","accepted"]

const EMPTY = {
  title: "", engagementId: "", engagementTitle: "",
  clientUid: "", clientName: "",
  severity: "high", status: "open",
  cvss: "", description: "",
  impact: "", remediation: "", references: "",
}

export default function ManageFindings() {
  const { user }                = useAuth()
  const [findings, setFindings] = useState([])
  const [engagements, setEngagements] = useState([])
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter]     = useState("all")
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [loading, setLoading]   = useState(true)
  const [msg, setMsg]           = useState("")

  useEffect(() => {
    const fetchAll = async () => {
      const [fSnap, eSnap] = await Promise.all([
        getDocs(collection(db, "findings")),
        getDocs(collection(db, "engagements")),
      ])
      setFindings(fSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setEngagements(eSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchAll()
  }, [])

  const flash = (text) => {
    setMsg(text)
    setTimeout(() => setMsg(""), 2500)
  }

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleEngagementSelect = (e) => {
    const eng = engagements.find(en => en.id === e.target.value)
    if (eng) setForm(f => ({
      ...f,
      engagementId:    eng.id,
      engagementTitle: eng.title,
      clientUid:       eng.clientUid,
      clientName:      eng.clientName,
    }))
  }

const handleCreate = async () => {
  if (!form.title || !form.engagementId) {
    flash("⚠ Title and engagement are required.")
    return
  }
  setSaving(true)
  try {
    const ref = await addDoc(collection(db, "findings"), {
      ...form,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    })
    const created = { id: ref.id, ...form }
    setFindings(prev => [created, ...prev])
    setSelected(created)
    setShowForm(false)
    setForm(EMPTY)

    // Notify client by email
    await notifyFinding({
      clientUid:       form.clientUid,
      clientName:      form.clientName,
      findingTitle:    form.title,
      severity:        form.severity,
      engagementTitle: form.engagementTitle,
    })

    flash("✓ Finding logged and client notified.")
  } catch (err) {
    flash("⚠ Error saving finding.")
  } finally {
    setSaving(false)
  }
}

  const handleStatusUpdate = async (status) => {
    if (!selected) return
    try {
      await updateDoc(doc(db, "findings", selected.id), { status })
      const updated = { ...selected, status }
      setSelected(updated)
      setFindings(prev =>
        prev.map(f => f.id === selected.id ? updated : f)
      )
      flash("✓ Status updated.")
    } catch (err) {
      flash("⚠ Update failed.")
    }
  }

  const filtered = filter === "all"
    ? findings
    : findings.filter(f => f.severity === filter)

  const inputClass = `
    w-full bg-dark-700 border border-green-primary/20
    text-white font-mono text-xs px-3 py-2.5 outline-none
    focus:border-green-primary/50 transition-colors placeholder-dim/40
  `
  const labelClass = `
    font-mono text-xs tracking-widest uppercase text-dim block mb-1.5
  `

  if (loading) return (
    <PortalLayout title="Manage Findings">
      <div className="flex items-center justify-center h-64">
        <p className="font-mono text-xs text-dim animate-pulse tracking-widest">LOADING...</p>
      </div>
    </PortalLayout>
  )

  return (
    <PortalLayout title="Manage Findings">

      {msg && (
        <div className="font-mono text-xs px-4 py-3 mb-4 border border-green-primary/30 bg-green-primary/5 text-green-primary">
          {msg}
        </div>
      )}

      {/* Severity filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["all", ...SEVERITIES].map(s => (
          <button key={s}
            onClick={() => setFilter(s)}
            className={`
              font-mono text-xs tracking-widest uppercase
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

        {/* List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <SectionTag text={`${filtered.length} Findings`} />
            <Button variant="primary" size="sm"
              onClick={() => { setShowForm(true); setSelected(null) }}
            >
              + Log
            </Button>
          </div>

          <div className="flex flex-col gap-3 max-h-[72vh] overflow-y-auto pr-1">
            {filtered.map(f => (
              <Card key={f.id}
                onClick={() => { setSelected(f); setShowForm(false) }}
                className={selected?.id === f.id ? "border-green-primary/50 bg-green-primary/5" : ""}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-rajdhani font-bold text-sm leading-tight">
                    {f.title}
                  </p>
                  <Badge label={f.severity} type={f.severity} />
                </div>
                <p className="font-mono text-xs text-dim">{f.clientName || "—"}</p>
              </Card>
            ))}
            {filtered.length === 0 && (
              <Card>
                <p className="font-mono text-xs text-dim">No findings found.</p>
              </Card>
            )}
          </div>
        </div>

        {/* Detail / Form */}
        <div className="md:col-span-2">

          {/* Create form */}
          {showForm && (
            <Card>
              <SectionTag text="Log Finding" />
              <h2 className="font-orbitron font-bold text-lg mb-6 mt-1">
                New Finding
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>Title *</label>
                  <input name="title"
                    placeholder="e.g. SQL Injection in /api/users"
                    value={form.title} onChange={handleChange}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Engagement *</label>
                  <select onChange={handleEngagementSelect}
                    className={`${inputClass} cursor-pointer`}
                    defaultValue=""
                  >
                    <option value="" disabled>Select engagement...</option>
                    {engagements.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Severity</label>
                  <select name="severity" value={form.severity}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer`}
                  >
                    {SEVERITIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>CVSS Score</label>
                  <input name="cvss" placeholder="e.g. 9.8"
                    value={form.cvss} onChange={handleChange}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select name="status" value={form.status}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer`}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {[
                { name: "description", label: "Description",       ph: "What is this vulnerability?..."           },
                { name: "impact",      label: "Business Impact",    ph: "What can an attacker achieve?..."        },
                { name: "remediation", label: "Remediation Steps",  ph: "How to fix this vulnerability?..."       },
                { name: "references",  label: "References / CVEs",  ph: "CVE-2024-XXXX, https://owasp.org/..."   },
              ].map(field => (
                <div key={field.name} className="mb-4">
                  <label className={labelClass}>{field.label}</label>
                  <textarea name={field.name} rows={3}
                    placeholder={field.ph}
                    value={form[field.name]} onChange={handleChange}
                    className={`${inputClass} resize-none`} />
                </div>
              ))}

              <div className="flex gap-3">
                <Button variant="primary" onClick={handleCreate} disabled={saving}>
                  {saving ? "Saving..." : "Log Finding"}
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Finding detail */}
          {selected && !showForm && (
            <Card>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <SectionTag text="Finding Detail" />
                  <h2 className="font-orbitron font-bold text-lg mt-1">
                    {selected.title}
                  </h2>
                </div>
                <Badge label={selected.severity} type={selected.severity} />
              </div>

              {/* Meta */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "CVSS",       value: selected.cvss       || "—" },
                  { label: "Client",     value: selected.clientName || "—" },
                  { label: "Engagement", value: selected.engagementTitle || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-green-primary/10 p-3">
                    <p className="font-mono text-xs text-dim tracking-widest uppercase mb-1">
                      {label}
                    </p>
                    <p className="font-mono text-xs text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* Content sections */}
              {[
                { label: "Description",      value: selected.description  },
                { label: "Impact",           value: selected.impact       },
                { label: "Remediation",      value: selected.remediation  },
                { label: "References",       value: selected.references   },
              ].map(({ label, value }) => value && (
                <div key={label} className="mb-5 border-t border-green-primary/10 pt-5">
                  <p className="font-mono text-xs text-green-primary tracking-widest uppercase mb-2">
                    {label}
                  </p>
                  <p className="font-mono text-xs text-dim leading-relaxed whitespace-pre-line">
                    {value}
                  </p>
                </div>
              ))}

              {/* Status update */}
              <div className="border-t border-green-primary/10 pt-6">
                <p className="font-mono text-xs text-dim tracking-widest uppercase mb-3">
                  Update Status
                </p>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map(s => (
                    <button key={s}
                      onClick={() => handleStatusUpdate(s)}
                      className={`
                        font-mono text-xs tracking-widest uppercase
                        px-4 py-2 border transition-all
                        ${selected.status === s
                          ? "bg-green-primary text-dark-900 border-green-primary"
                          : "border-green-primary/20 text-dim hover:border-green-primary/40"
                        }
                      `}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {!selected && !showForm && (
            <Card>
              <p className="font-mono text-xs text-dim">
                Select a finding or log a new one.
              </p>
            </Card>
          )}
        </div>
      </div>
    </PortalLayout>
  )
}