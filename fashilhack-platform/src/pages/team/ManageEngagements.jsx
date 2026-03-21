import { useEffect, useState } from "react"
import {
  collection, getDocs, addDoc,
  updateDoc, doc, serverTimestamp,
} from "firebase/firestore"
import { uploadReport, notifyReport } from "../../api/index"
import { db }       from "../../config/firebase"
import { useAuth }  from "../../context/AuthContext"
import PortalLayout from "../../components/layout/PortalLayout"
import Badge        from "../../components/ui/Badge"
import SectionTag   from "../../components/ui/SectionTag"

const IconFile = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
)
const IconUpload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)
const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const PHASES   = ["Discovery","Reconnaissance","Exploitation","Reporting","Remediation","Completed"]
const STATUSES = ["scoping","active","reporting","completed"]
const TYPES    = ["External","Internal","Web App","Cloud","Social Engineering","Full Scope"]

const EMPTY = {
  title:"", clientUid:"", clientName:"", type:"",
  scope:"", description:"", phase:"Discovery",
  status:"scoping", startDate:"", endDate:"",
}

const inp = {
  width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 13,
  backgroundColor: "var(--color-surface-alt)",
  border: "1px solid var(--color-border)",
  color: "var(--color-txt)",
  outline: "none", boxSizing: "border-box",
}
const lbl = {
  display: "block", fontSize: 11, fontWeight: 700,
  letterSpacing: "0.06em", textTransform: "uppercase",
  color: "var(--color-txt-muted)", marginBottom: 6,
}

export default function ManageEngagements() {
  const { user }                       = useAuth()
  const [engagements, setEngagements]  = useState([])
  const [clients,     setClients]      = useState([])
  const [selected,    setSelected]     = useState(null)
  const [showForm,    setShowForm]     = useState(false)
  const [form,        setForm]         = useState(EMPTY)
  const [saving,      setSaving]       = useState(false)
  const [loading,     setLoading]      = useState(true)
  const [msg,         setMsg]          = useState("")
  const [msgType,     setMsgType]      = useState("ok")
  const [reportFile,  setReportFile]   = useState(null)
  const [reportType,  setReportType]   = useState("technical")
  const [uploading,   setUploading]    = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      // Fetch independently so one failure does not kill the other
      try {
        const eSnap = await getDocs(collection(db, "engagements"))
        setEngagements(eSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error("Failed to fetch engagements:", err)
      }
      try {
        const uSnap = await getDocs(collection(db, "users"))
        setClients(
          uSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(u => u.role === "client")
        )
      } catch (err) {
        console.error("Failed to fetch users:", err)
      }
      setLoading(false)
    }
    fetchAll()
  }, [])

  const flash  = (text, type = "ok") => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(""), 3000) }
  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleClientSelect = (e) => {
    const c = clients.find(c => c.id === e.target.value)
    if (c) setForm(f => ({ ...f, clientUid: c.id, clientName: c.displayName || c.email }))
  }

  const handleReportUpload = async () => {
    if (!reportFile || !selected) { flash("Select a file and engagement first.", "err"); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("report",          reportFile)
      fd.append("engagementId",    selected.id)
      fd.append("engagementTitle", selected.title)
      fd.append("clientUid",       selected.clientUid)
      fd.append("clientName",      selected.clientName)
      fd.append("type",            reportType)
      const result = await uploadReport(fd)
      await notifyReport({
        clientUid: selected.clientUid, clientName: selected.clientName,
        engagementTitle: selected.title, reportType, fileUrl: result.fileUrl,
      })
      flash("Report uploaded and client notified.")
      setReportFile(null)
    } catch (err) { flash(err.message, "err") }
    finally { setUploading(false) }
  }

  const handleCreate = async () => {
    if (!form.title || !form.clientUid) { flash("Title and client are required.", "err"); return }
    setSaving(true)
    try {
      const ref = await addDoc(collection(db, "engagements"), {
        ...form, createdBy: user.uid, createdAt: serverTimestamp(),
      })
      const created = { id: ref.id, ...form }
      setEngagements(prev => [created, ...prev])
      setSelected(created); setShowForm(false); setForm(EMPTY)
      flash("Engagement created.")
    } catch { flash("Error creating engagement.", "err") }
    finally { setSaving(false) }
  }

  const handleUpdate = async (field, value) => {
    if (!selected) return
    try {
      await updateDoc(doc(db, "engagements", selected.id), { [field]: value })
      const updated = { ...selected, [field]: value }
      setSelected(updated)
      setEngagements(prev => prev.map(e => e.id === selected.id ? updated : e))
      flash("Updated.")
    } catch { flash("Update failed.", "err") }
  }

  if (loading) return (
    <PortalLayout title="Manage Engagements">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256 }}>
        <p style={{ color: "var(--color-txt-muted)", fontSize: 11, letterSpacing: "0.12em", fontWeight: 700 }}>LOADING...</p>
      </div>
    </PortalLayout>
  )

  return (
    <PortalLayout title="Manage Engagements">

      {/* Flash */}
      {msg && (
        <div style={{
          position: "fixed", top: 88, right: 32, zIndex: 50,
          padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
          backgroundColor: msgType === "err" ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
          border: `1px solid ${msgType === "err" ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
          color: msgType === "err" ? "#ef4444" : "#22c55e",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}>
          {msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>

        {/* LIST */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <SectionTag text={`${engagements.length} Engagements`} />
            <button
              onClick={() => { setShowForm(true); setSelected(null) }}
              style={{ backgroundColor: "#00aaff", color: "#fff", fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer" }}
            >
              + New
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "75vh", overflowY: "auto" }}>
            {engagements.length === 0 ? (
              <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, padding: 20 }}>
                <p style={{ color: "var(--color-txt-muted)", fontSize: 13 }}>No active engagements.</p>
              </div>
            ) : engagements.map(e => (
              <div
                key={e.id}
                onClick={() => { setSelected(e); setShowForm(false) }}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: `1px solid ${selected?.id === e.id ? "#00aaff" : "var(--color-border)"}`,
                  borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                  boxShadow: selected?.id === e.id ? "0 0 0 3px rgba(0,170,255,0.1)" : "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e2 => { if (selected?.id !== e.id) e2.currentTarget.style.borderColor = "var(--color-border-soft)" }}
                onMouseLeave={e2 => { if (selected?.id !== e.id) e2.currentTarget.style.borderColor = "var(--color-border)" }}
              >
                <h4 style={{ color: "var(--color-txt)", fontSize: 13, fontWeight: 700, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {e.title}
                </h4>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ color: "var(--color-txt-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>
                    {e.clientName || "—"}
                  </p>
                  <Badge label={e.status} type={e.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DETAIL / FORM */}
        <div>

          {/* Create form */}
          {showForm && (
            <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 28 }}>
              <SectionTag text="New Engagement" />
              <h2 style={{ color: "var(--color-txt)", fontWeight: 900, fontSize: 22, margin: "8px 0 24px", letterSpacing: "-0.03em" }}>
                Start Engagement
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={lbl}>Title *</label>
                  <input name="title" placeholder="e.g. Infrastructure Audit Q4" value={form.title} onChange={handle} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Client *</label>
                  <select onChange={handleClientSelect} style={{ ...inp, cursor: "pointer" }} defaultValue="">
                    <option value="" disabled>Select client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.displayName || c.email}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Type</label>
                  <select name="type" value={form.type} onChange={handle} style={{ ...inp, cursor: "pointer" }}>
                    <option value="">Select type...</option>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Phase</label>
                  <select name="phase" value={form.phase} onChange={handle} style={{ ...inp, cursor: "pointer" }}>
                    {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Status</label>
                  <select name="status" value={form.status} onChange={handle} style={{ ...inp, cursor: "pointer" }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Start Date</label>
                  <input name="startDate" type="date" value={form.startDate} onChange={handle} style={inp} />
                </div>
                <div>
                  <label style={lbl}>End Date</label>
                  <input name="endDate" type="date" value={form.endDate} onChange={handle} style={inp} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={lbl}>Scope</label>
                  <input name="scope" placeholder="e.g. 192.168.0.0/24, *.fashilhack.com" value={form.scope} onChange={handle} style={inp} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={lbl}>Notes</label>
                  <textarea name="description" rows={4} placeholder="Rules of engagement, objectives, context..."
                    value={form.description} onChange={handle} style={{ ...inp, resize: "none" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handleCreate} disabled={saving}
                  style={{ backgroundColor: "#00aaff", color: "#fff", padding: "10px 28px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Creating..." : "Start Engagement"}
                </button>
                <button onClick={() => setShowForm(false)}
                  style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-txt-subtle)", padding: "10px 28px", borderRadius: 8, border: "1px solid var(--color-border)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Engagement detail */}
          {selected && !showForm && (
            <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 28 }}>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
                <div>
                  <SectionTag text="Engagement" />
                  <h2 style={{ color: "var(--color-txt)", fontWeight: 900, fontSize: 26, margin: "8px 0 4px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                    {selected.title}
                  </h2>
                  <p style={{ color: "var(--color-txt-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {selected.type || "General"}
                  </p>
                </div>
                <Badge label={selected.status} type={selected.status} />
              </div>

              {/* Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Client",   value: selected.clientName || "—" },
                  { label: "Phase",    value: selected.phase      || "—" },
                  { label: "Started",  value: selected.startDate  || "TBD" },
                  { label: "Deadline", value: selected.endDate    || "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ backgroundColor: "var(--color-surface-alt)", border: "1px solid var(--color-border)", borderRadius: 8, padding: 12 }}>
                    <p style={{ color: "var(--color-txt-muted)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</p>
                    <p style={{ color: "var(--color-txt)", fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Scope */}
              {selected.scope && (
                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 20, marginBottom: 20 }}>
                  <p style={{ color: "#00aaff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Scope</p>
                  <div style={{ backgroundColor: "#0d1117", borderRadius: 8, padding: 14 }}>
                    <code style={{ color: "#e6edf3", fontSize: 13, fontFamily: "monospace" }}>{selected.scope}</code>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 20, marginBottom: 20 }}>
                <p style={{ color: "var(--color-txt-muted)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Controls</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={lbl}>Phase</label>
                    <select value={selected.phase || "Discovery"} onChange={e => handleUpdate("phase", e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                      {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Status</label>
                    <select value={selected.status || "scoping"} onChange={e => handleUpdate("status", e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Report upload */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 20 }}>
                <p style={{ color: "#00aaff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Deliver Report</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                  <div>
                    <label style={lbl}>Report Type</label>
                    <select value={reportType} onChange={e => setReportType(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                      <option value="technical">Technical</option>
                      <option value="executive">Executive Summary</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>PDF File</label>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", ...inp }}>
                      <span style={{ backgroundColor: "var(--color-surface)", color: "var(--color-txt-subtle)", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--color-border)", whiteSpace: "nowrap" }}>
                        Choose File
                      </span>
                      <span style={{ color: "var(--color-txt-muted)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {reportFile ? reportFile.name : "No file selected"}
                      </span>
                      <input type="file" accept=".pdf" style={{ display: "none" }} onChange={e => setReportFile(e.target.files[0])} />
                    </label>
                  </div>
                </div>

                {reportFile && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, backgroundColor: "var(--color-surface-alt)", border: "1px solid var(--color-border)", padding: "10px 14px", borderRadius: 8 }}>
                    <span style={{ color: "var(--color-txt-muted)" }}><IconFile /></span>
                    <div>
                      <p style={{ color: "var(--color-txt)", fontSize: 12, fontWeight: 700 }}>{reportFile.name}</p>
                      <p style={{ color: "var(--color-txt-muted)", fontSize: 11 }}>{(reportFile.size / 1024 / 1024).toFixed(2)} MB · PDF</p>
                    </div>
                    <button onClick={() => setReportFile(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--color-txt-muted)" }}>
                      <IconX />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleReportUpload}
                  disabled={uploading || !reportFile}
                  style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#00aaff", color: "#fff", padding: "10px 24px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 13, cursor: uploading || !reportFile ? "not-allowed" : "pointer", opacity: uploading || !reportFile ? 0.5 : 1 }}
                >
                  <IconUpload /> {uploading ? "Uploading..." : "Upload & Notify Client"}
                </button>
                <p style={{ color: "var(--color-txt-muted)", fontSize: 11, marginTop: 8 }}>
                  Report will be uploaded to secure storage and the client notified by email.
                </p>
              </div>
            </div>
          )}

          {!selected && !showForm && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center", opacity: 0.4 }}>
              <p style={{ color: "var(--color-txt)", fontWeight: 800, fontSize: 17, marginBottom: 8 }}>No Engagement Selected</p>
              <p style={{ color: "var(--color-txt-subtle)", fontSize: 13, maxWidth: 280 }}>
                Select an engagement from the list or start a new one.
              </p>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  )
}