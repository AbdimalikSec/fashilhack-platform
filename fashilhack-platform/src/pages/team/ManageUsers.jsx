import { useEffect, useState } from "react"
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { notifyApproved } from "../../api/index"
import { db }       from "../../config/firebase"
import { useAuth }  from "../../context/AuthContext"
import { useRole }  from "../../hooks/useRole"
import PortalLayout from "../../components/layout/PortalLayout"
import Badge        from "../../components/ui/Badge"
import SectionTag   from "../../components/ui/SectionTag"

const ROLES   = ["admin", "team", "client", "community"]
const FILTERS = ["all", "pending", "client", "team", "community", "admin", "rejected"]

export default function ManageUsers() {
  const { user }              = useAuth()
  const { role: currentRole } = useRole()
  const [users,   setUsers]   = useState([])
  const [filter,  setFilter]  = useState("pending")
  const [loading, setLoading] = useState(true)
  const [msg,     setMsg]     = useState("")
  const [msgType, setMsgType] = useState("ok")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"))
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error("Failed to load users:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const flash = (text, type = "ok") => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(""), 3000) }

  const handleApprove = async (uid, role) => {
    try {
      await updateDoc(doc(db, "users", uid), { role, approvedAt: serverTimestamp(), approvedBy: user.uid })
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, role } : u))
      const approvedUser = users.find(u => u.id === uid)
      await notifyApproved({ clientUid: uid, displayName: approvedUser?.displayName || "", role })
      flash(`User approved as ${role}.`)
    } catch (err) {
      flash("Failed to approve user: " + err.message, "err")
    }
  }

  const handleRevoke = async (uid) => {
    try {
      await updateDoc(doc(db, "users", uid), { role: "rejected" })
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, role: "rejected" } : u))
      flash("Access revoked.")
    } catch (err) {
      flash("Failed: " + err.message, "err")
    }
  }

  const filtered = filter === "all" ? users : users.filter(u => u.role === filter)

  if (loading) return (
    <PortalLayout title="User Management">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256 }}>
        <p style={{ color: "var(--color-txt-muted)", fontSize: 11, letterSpacing: "0.12em", fontWeight: 700 }}>SYNCING USERS...</p>
      </div>
    </PortalLayout>
  )

  return (
    <PortalLayout title="User Management">

      {msg && (
        <div style={{
          marginBottom: 20, padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          backgroundColor: msgType === "err" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
          border: `1px solid ${msgType === "err" ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
          color: msgType === "err" ? "#ef4444" : "#22c55e",
        }}>
          {msg}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "6px 14px", borderRadius: 20, border: "1px solid",
              cursor: "pointer", transition: "all 0.15s",
              backgroundColor: filter === f ? "#00aaff" : "transparent",
              borderColor:     filter === f ? "#00aaff" : "var(--color-border)",
              color:           filter === f ? "#fff"    : "var(--color-txt-muted)",
            }}
          >
            {f} ({users.filter(u => f === "all" ? true : u.role === f).length})
          </button>
        ))}
      </div>

      {/* User cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {filtered.length === 0 ? (
          <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, padding: 20 }}>
            <p style={{ color: "var(--color-txt-muted)", fontSize: 13 }}>No users found.</p>
          </div>
        ) : filtered.map(u => (
          <div
            key={u.id}
            style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 20 }}
          >
            {/* Avatar + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                backgroundColor: "rgba(0,170,255,0.12)", color: "#00aaff",
                fontWeight: 800, fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {(u.displayName || u.email || "?")[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ color: "var(--color-txt)", fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                  {u.displayName || "Unknown"}
                </h3>
                <p style={{ color: "var(--color-txt-muted)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.email}
                </p>
              </div>
            </div>

            {/* Role + joined */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <Badge label={u.role} type={u.role} />
              <span style={{ color: "var(--color-txt-muted)", fontSize: 11, fontWeight: 600 }}>
                {u.createdAt?.toDate?.()?.toLocaleDateString() || "—"}
              </span>
            </div>

            {/* Pending — grant access buttons — admin only */}
            {u.role === "pending" && currentRole === "admin" && (
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 14 }}>
                <p style={{ color: "var(--color-txt-muted)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Grant Access As
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {ROLES.map(r => (
                    <button
                      key={r}
                      onClick={() => handleApprove(u.id, r)}
                      style={{
                        padding: "5px 10px", fontSize: 11, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.04em",
                        backgroundColor: "var(--color-surface-alt)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-txt-subtle)",
                        borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#00aaff"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#00aaff" }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "var(--color-surface-alt)"; e.currentTarget.style.color = "var(--color-txt-subtle)"; e.currentTarget.style.borderColor = "var(--color-border)" }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleRevoke(u.id)}
                  style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}
                >
                  Deny Access
                </button>
              </div>
            )}

            {/* Active user — revoke — admin only */}
            {u.role !== "pending" && u.role !== "rejected" && u.id !== user?.uid && currentRole === "admin" && (
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
                <button
                  onClick={() => handleRevoke(u.id)}
                  style={{
                    width: "100%", padding: "8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer",
                    backgroundColor: "rgba(239,68,68,0.08)", color: "#ef4444",
                    border: "1px solid rgba(239,68,68,0.2)", transition: "all 0.15s",
                  }}
                >
                  Revoke Access
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </PortalLayout>
  )
}