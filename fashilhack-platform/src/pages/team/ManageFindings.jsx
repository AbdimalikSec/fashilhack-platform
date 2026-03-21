import { useEffect, useState } from "react"
import {
  collection, getDocs, addDoc,
  updateDoc, doc, serverTimestamp
} from "firebase/firestore"
import { notifyFinding } from "../../api/index"
import { db }       from "../../config/firebase"
import { useAuth }  from "../../context/AuthContext"
import PortalLayout from "../../components/layout/PortalLayout"
import Badge        from "../../components/ui/Badge"
import SectionTag   from "../../components/ui/SectionTag"

const SEVERITIES = ["critical","high","medium","low","info"]
const STATUSES   = ["open","in-review","remediated","accepted"]

const SEV_COLOR = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high:     "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium:   "bg-yellow-400/10 text-yellow-500 border-yellow-400/20",
  low:      "bg-sky-400/10 text-sky-500 border-sky-400/20",
  info:     "bg-slate-100 text-slate-400 border-slate-200",
}

const EMPTY = {
  title:"", engagementId:"", engagementTitle:"",
  clientUid:"", clientName:"",
  severity:"high", status:"open",
  cvss:"", description:"", impact:"", remediation:"", references:"",
}

const inputClass = `
  w-full bg-slate-50 border border-slate-200
  text-primary text-sm px-4 py-3 rounded-xl outline-none
  focus:border-[#00aaff] focus:ring-4 focus:ring-[#00aaff]/5
  transition-all placeholder-slate-300
`
const labelClass = `text-[10px] tracking-widest uppercase text-slate-400 font-black block mb-2`

export default function ManageFindings() {
  const { user }                      = useAuth()
  const [findings,    setFindings]    = useState([])
  const [engagements, setEngagements] = useState([])
  const [selected,    setSelected]    = useState(null)
  const [showForm,    setShowForm]    = useState(false)
  const [filter,      setFilter]      = useState("all")
  const [form,        setForm]        = useState(EMPTY)
  const [saving,      setSaving]      = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [msg,         setMsg]         = useState("")

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

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(""), 2500) }
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

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
    if (!form.title || !form.engagementId) { flash("⚠ Title and engagement are required."); return }
    setSaving(true)
    try {
      const ref = await addDoc(collection(db, "findings"), {
        ...form, createdBy: user.uid, createdAt: serverTimestamp(),
      })
      const created = { id: ref.id, ...form }
      setFindings(prev => [created, ...prev])
      setSelected(created)
      setShowForm(false)
      setForm(EMPTY)
      await notifyFinding({
        clientUid: form.clientUid, clientName: form.clientName,
        findingTitle: form.title, severity: form.severity,
        engagementTitle: form.engagementTitle,
      })
      flash("✓ Finding logged and client notified.")
    } catch { flash("⚠ Error saving finding.") }
    finally { setSaving(false) }
  }

  const handleStatusUpdate = async (status) => {
    if (!selected) return
    try {
      await updateDoc(doc(db, "findings", selected.id), { status })
      const updated = { ...selected, status }
      setSelected(updated)
      setFindings(prev => prev.map(f => f.id === selected.id ? updated : f))
      flash("✓ Status updated.")
    } catch { flash("⚠ Update failed.") }
  }

  const filtered = filter === "all" ? findings : findings.filter(f => f.severity === filter)

  if (loading) return (
    <PortalLayout title="Manage Findings">
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-slate-400 animate-pulse font-black tracking-widest uppercase">Loading...</p>
      </div>
    </PortalLayout>
  )

  return (
    <PortalLayout title="Manage Findings">

      {/* Flash */}
      {msg && (
        <div className="text-xs font-black px-4 py-3 mb-6 rounded-xl bg-[#00aaff]/5 border border-[#00aaff]/20 text-[#00aaff]">
          {msg}
        </div>
      )}

      {/* Severity filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["all", ...SEVERITIES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-[11px] font-black tracking-widest uppercase px-4 py-2 rounded-full border transition-all ${
              filter === s
                ? "text-white border-transparent"
                : "border-slate-200 text-slate-400 hover:border-slate-300 bg-white"
            }`}
            style={filter === s ? { backgroundColor: "#00aaff", borderColor: "#00aaff" } : {}}
          >
            {s} {s !== "all" && `(${findings.filter(f => f.severity === s).length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ── LIST ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <SectionTag text={`${filtered.length} Findings`} />
            <button
              onClick={() => { setShowForm(true); setSelected(null) }}
              className="text-white text-xs font-black px-4 py-2 rounded-xl transition-all hover:opacity-90"
              style={{ backgroundColor: "#00aaff" }}
            >
              + Log Finding
            </button>
          </div>

          <div className="flex flex-col gap-3 max-h-[72vh] overflow-y-auto pr-1">
            {filtered.map(f => (
              <div key={f.id}
                onClick={() => { setSelected(f); setShowForm(false) }}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                  selected?.id === f.id
                    ? "border-[#00aaff] shadow-md shadow-[#00aaff]/10"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-black text-primary leading-tight">{f.title}</p>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border flex-shrink-0 ${SEV_COLOR[f.severity] || SEV_COLOR.info}`}>
                    {f.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-bold">{f.clientName || "—"}</p>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="bg-white border border-slate-100 rounded-xl p-6">
                <p className="text-sm text-slate-400">No findings found.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── DETAIL / FORM ── */}
        <div className="md:col-span-2">

          {/* Create form */}
          {showForm && (
            <div className="bg-white border border-slate-100 rounded-2xl p-8">
              <SectionTag text="Log Finding" />
              <h2 className="font-heading font-black text-2xl text-primary mt-2 mb-8 tracking-tight">
                New Finding
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>Title *</label>
                  <input name="title" placeholder="e.g. SQL Injection in /api/users"
                    value={form.title} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Engagement *</label>
                  <select onChange={handleEngagementSelect} className={`${inputClass} cursor-pointer`} defaultValue="">
                    <option value="" disabled>Select engagement...</option>
                    {engagements.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Severity</label>
                  <select name="severity" value={form.severity} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>CVSS Score</label>
                  <input name="cvss" placeholder="e.g. 9.8"
                    value={form.cvss} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {[
                { name: "description", label: "Description",      ph: "What is this vulnerability?..." },
                { name: "impact",      label: "Business Impact",   ph: "What can an attacker achieve?..." },
                { name: "remediation", label: "Remediation Steps", ph: "How to fix this vulnerability?..." },
                { name: "references",  label: "References / CVEs", ph: "CVE-2024-XXXX, https://owasp.org/..." },
              ].map(field => (
                <div key={field.name} className="mb-5">
                  <label className={labelClass}>{field.label}</label>
                  <textarea name={field.name} rows={3} placeholder={field.ph}
                    value={form[field.name]} onChange={handleChange}
                    className={`${inputClass} resize-none`} />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button onClick={handleCreate} disabled={saving}
                  className="px-8 py-3 text-white text-sm font-black rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                  style={{ backgroundColor: "#00aaff" }}>
                  {saving ? "Saving..." : "Log Finding"}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-8 py-3 border border-slate-200 text-slate-500 text-sm font-black rounded-xl hover:bg-slate-50 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Finding detail */}
          {selected && !showForm && (
            <div className="bg-white border border-slate-100 rounded-2xl p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <SectionTag text="Finding Detail" />
                  <h2 className="font-heading font-black text-2xl text-primary mt-2 tracking-tight leading-tight">
                    {selected.title}
                  </h2>
                </div>
                <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border ${SEV_COLOR[selected.severity] || SEV_COLOR.info}`}>
                  {selected.severity}
                </span>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: "CVSS",       value: selected.cvss            || "—" },
                  { label: "Client",     value: selected.clientName      || "—" },
                  { label: "Engagement", value: selected.engagementTitle || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">{label}</p>
                    <p className="text-sm font-black text-primary truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Content sections */}
              <div className="space-y-6">
                {[
                  { label: "Description",      value: selected.description },
                  { label: "Business Impact",  value: selected.impact },
                  { label: "Remediation",      value: selected.remediation },
                  { label: "References",       value: selected.references },
                ].map(({ label, value }) => value && (
                  <div key={label} className="border-t border-slate-100 pt-6">
                    <p className="text-[10px] font-black tracking-widest uppercase mb-3"
                       style={{ color: "#00aaff" }}>
                      {label}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{value}</p>
                  </div>
                ))}
              </div>

              {/* Status update */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4">
                  Update Status
                </p>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => handleStatusUpdate(s)}
                      className="text-[11px] font-black tracking-widest uppercase px-4 py-2 rounded-xl border transition-all"
                      style={
                        selected.status === s
                          ? { backgroundColor: "#00aaff", borderColor: "#00aaff", color: "white" }
                          : {}
                      }
                      {...(selected.status !== s && { className: "text-[11px] font-black tracking-widest uppercase px-4 py-2 rounded-xl border border-slate-200 text-slate-400 hover:border-slate-300 transition-all" })}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!selected && !showForm && (
            <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
              <p className="font-heading font-black text-lg text-primary tracking-tight mb-2">No Finding Selected</p>
              <p className="text-sm text-slate-500 max-w-xs">Select a finding from the list or log a new one.</p>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  )
}