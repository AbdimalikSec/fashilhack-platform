import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db }       from "../../config/firebase"
import { useAuth }  from "../../context/AuthContext"
import PortalLayout from "../../components/layout/PortalLayout"
import Card         from "../../components/ui/Card"
import Badge        from "../../components/ui/Badge"
import SectionTag   from "../../components/ui/SectionTag"
import Button       from "../../components/ui/Button"

const API = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function Reports() {
  const { user }              = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState(null)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!user) return
    const fetchReports = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "reports"), where("clientUid", "==", user.uid))
        )
        setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error("Failed to load reports:", err)
        setError("Failed to load reports.")
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [user])

  // Opens PDF by fetching it through the backend proxy as a blob
  // This avoids any Cloudinary auth issues since the backend fetches it server-side
  const handleOpen = async (reportId, title, type) => {
    setOpening(reportId)
    setError(null)
    try {
      const idToken = await user.getIdToken()
      const res     = await fetch(`${API}/api/reports/view/${reportId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to open report.")
      }
      // Turn the streamed PDF into a blob URL and open it in a new tab
      const blob    = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a       = document.createElement("a")
      a.href        = blobUrl
      a.target      = "_blank"
      a.rel         = "noopener noreferrer"
      // Use download attribute as fallback if browser blocks new tab
      a.download    = `${title || "report"}-${type}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      // Clean up blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)
    } catch (err) {
      console.error("Open report error:", err)
      setError(err.message || "Could not open the report. Please try again.")
    } finally {
      setOpening(null)
    }
  }

  if (loading) return (
    <PortalLayout title="Reports">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256 }}>
        <p style={{ color: "var(--color-txt-muted)", fontSize: 11, letterSpacing: "0.12em", fontWeight: 700 }}>
          LOADING...
        </p>
      </div>
    </PortalLayout>
  )

  return (
    <PortalLayout title="Reports">
      <SectionTag text="Your Reports" />

      {error && (
        <div style={{
          marginTop: 16, padding: "12px 16px", borderRadius: 8,
          backgroundColor: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)",
          color: "#ef4444", fontSize: 13, fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24, marginTop: 24 }}>
        {reports.length === 0 ? (
          <Card>
            <p style={{ color: "var(--color-txt-muted)", fontSize: 13 }}>
              No reports available yet. Reports will appear here once your engagement is complete.
            </p>
          </Card>
        ) : reports.map(r => (
          <Card key={r.id}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>
              {r.type === "technical" ? "🔧" : "📊"}
            </div>

            <h3 style={{ color: "var(--color-txt)", fontWeight: 800, fontSize: 15, marginBottom: 8, letterSpacing: "-0.02em" }}>
              {r.engagementTitle || "Engagement Report"}
            </h3>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <Badge
                label={r.type === "technical" ? "Technical" : "Executive"}
                type={r.type === "technical" ? "team" : "client"}
              />
              <span style={{ color: "var(--color-txt-muted)", fontSize: 12 }}>
                {r.createdAt?.toDate?.()?.toLocaleDateString() || "—"}
              </span>
            </div>

            <p style={{ color: "var(--color-txt-subtle)", fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
              {r.type === "technical"
                ? "Full technical report including all findings, CVSS scores, proof of concepts, and detailed remediation steps."
                : "Executive summary covering risk overview, business impact, and prioritized remediation roadmap."
              }
            </p>

            <Button
              variant="primary"
              full
              onClick={() => handleOpen(r.id, r.engagementTitle, r.type)}
              disabled={opening === r.id}
            >
              {opening === r.id ? "Opening..." : "Open PDF →"}
            </Button>
          </Card>
        ))}
      </div>

      <div style={{
        marginTop: 32, padding: 16, maxWidth: 520, borderRadius: 8,
        border: "1px solid rgba(0,170,255,0.2)",
        backgroundColor: "rgba(0,170,255,0.05)",
      }}>
        <p style={{ color: "var(--color-txt-subtle)", fontSize: 13, lineHeight: 1.6 }}>
          Reports are generated by the FashilHack team at the end of each engagement.
          You will receive an email notification when your report is ready.
        </p>
      </div>
    </PortalLayout>
  )
}