import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore"
import { db } from "../../config/firebase"
import { useAuth } from "../../context/AuthContext"
import PortalLayout from "../../components/layout/PortalLayout"

const API = import.meta.env.VITE_API_URL || "http://localhost:5000"

const ROLE_COLORS = {
  admin:     { bg: "rgba(239,68,68,0.12)",   text: "#ef4444" },
  team:      { bg: "rgba(0,170,255,0.12)",   text: "#00aaff" },
  client:    { bg: "rgba(34,197,94,0.12)",   text: "#22c55e" },
  community: { bg: "rgba(168,85,247,0.12)",  text: "#a855f7" },
  pending:   { bg: "rgba(245,158,11,0.12)",  text: "#f59e0b" },
}

const RoleBadge = ({ role }) => {
  const c = ROLE_COLORS[role] || { bg: "rgba(100,100,100,0.1)", text: "#888" }
  return (
    <span style={{
      backgroundColor: c.bg, color: c.text,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase", padding: "3px 8px", borderRadius: 6,
    }}>
      {role}
    </span>
  )
}

export default function AdminUsers() {
  const { user } = useAuth()

  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [creating,   setCreating]   = useState(false)
  const [error,      setError]      = useState(null)
  const [success,    setSuccess]    = useState(null)

  // Create form state
  const [form, setForm] = useState({
    displayName: "",
    email:       "",
    password:    "",
    role:        "team",
  })

  // Role change loading per user
  const [roleChanging, setRoleChanging] = useState(null)
  const [deleting,     setDeleting]     = useState(null)

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")))
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error("Failed to fetch users:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async () => {
    setError(null)
    setSuccess(null)

    if (!form.displayName.trim()) return setError("Name is required.")
    if (!form.email.trim())       return setError("Email is required.")
    if (form.password.length < 8) return setError("Password must be at least 8 characters.")

    setCreating(true)
    try {
      const idToken = await user.getIdToken()
      const res     = await fetch(`${API}/api/admin/create-user`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create user.")

      setSuccess(`Account created! Share these credentials manually:\nEmail: ${form.email}\nPassword: ${form.password}`)
      setForm({ displayName: "", email: "", password: "", role: "team" })
      fetchUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleRoleChange = async (uid, newRole) => {
    setRoleChanging(uid)
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole })
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, role: newRole } : u))
    } catch (err) {
      setError("Failed to update role: " + err.message)
    } finally {
      setRoleChanging(null)
    }
  }

  const handleDelete = async (uid, email) => {
    if (!window.confirm(`Permanently delete ${email}? This removes their account completely — they can sign up again with the same email.`)) return
    setDeleting(uid)
    setError(null)
    try {
      const token = await user.getIdToken()
      const res   = await fetch(`${API}/api/admin/delete-user/${uid}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Delete failed")
      setUsers(prev => prev.filter(u => u.id !== uid))
      setSuccess(`${email} deleted successfully.`)
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setError("Failed to delete: " + err.message)
    } finally {
      setDeleting(null)
    }
  }

  const inp = {
    width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 13,
    backgroundColor: "var(--color-surface-alt)",
    border: "1px solid var(--color-border)",
    color: "var(--color-txt)",
    outline: "none",
    boxSizing: "border-box",
  }

  const label = {
    display: "block", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.06em", textTransform: "uppercase",
    color: "var(--color-txt-muted)", marginBottom: 6,
  }

  return (
    <PortalLayout title="User Management">

      {/* ── CREATE USER FORM ── */}
      <div style={{
        backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)",
        borderRadius: 12, padding: 24, marginBottom: 32,
      }}>
        <h2 style={{ color: "var(--color-txt)", fontWeight: 800, fontSize: 15, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
          Create New User
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={label}>Full Name</label>
            <input
              style={inp}
              placeholder="e.g. Ahmed Hassan"
              value={form.displayName}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
            />
          </div>
          <div>
            <label style={label}>Email</label>
            <input
              style={inp}
              type="email"
              placeholder="e.g. ahmed@company.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label style={label}>Password</label>
            <input
              style={inp}
              type="password"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>
          <div>
            <label style={label}>Role</label>
            <select
              style={{ ...inp, cursor: "pointer" }}
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            >
              <option value="admin">Admin</option>
              <option value="team">Team</option>
              <option value="client">Client</option>
              <option value="community">Community</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 8, backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 8, backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", fontSize: 13, fontWeight: 600, whiteSpace: "pre-line" }}>
            {success}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={creating}
          style={{
            marginTop: 20, padding: "10px 24px", borderRadius: 8,
            backgroundColor: creating ? "rgba(0,170,255,0.5)" : "#00aaff",
            color: "#fff", fontWeight: 700, fontSize: 13,
            border: "none", cursor: creating ? "not-allowed" : "pointer",
            letterSpacing: "0.02em",
          }}
        >
          {creating ? "Creating..." : "Create User"}
        </button>
      </div>

      {/* ── USER LIST ── */}
      <div style={{
        backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)",
        borderRadius: 12, overflow: "hidden",
      }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ color: "var(--color-txt)", fontWeight: 800, fontSize: 15, margin: 0, letterSpacing: "-0.02em" }}>
            All Users
          </h2>
          <span style={{ color: "var(--color-txt-muted)", fontSize: 12, fontWeight: 600 }}>
            {users.length} total
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-txt-muted)", fontSize: 12, letterSpacing: "0.1em" }}>
            LOADING...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-txt-muted)", fontSize: 13 }}>
            No users found.
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 80px",
              padding: "10px 24px", borderBottom: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface-alt)",
            }}>
              {["Name", "Email", "Role", "Joined", ""].map((h, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-txt-muted)" }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {users.map(u => (
              <div
                key={u.id}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 80px",
                  padding: "14px 24px", borderBottom: "1px solid var(--color-border)",
                  alignItems: "center",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--color-surface-alt)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                {/* Name */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    backgroundColor: "rgba(0,170,255,0.15)",
                    color: "#00aaff", fontWeight: 800, fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {(u.displayName || u.email || "?")[0].toUpperCase()}
                  </div>
                  <span style={{ color: "var(--color-txt)", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.displayName || "—"}
                  </span>
                </div>

                {/* Email */}
                <span style={{ color: "var(--color-txt-subtle)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.email || "—"}
                </span>

                {/* Role — dropdown to change */}
                <div>
                  {roleChanging === u.id ? (
                    <span style={{ color: "var(--color-txt-muted)", fontSize: 12 }}>Saving...</span>
                  ) : (
                    <select
                      value={u.role || "community"}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      style={{
                        backgroundColor: "var(--color-surface-alt)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-txt)",
                        borderRadius: 6, padding: "4px 8px",
                        fontSize: 12, cursor: "pointer",
                      }}
                    >
                      <option value="admin">Admin</option>
                      <option value="team">Team</option>
                      <option value="client">Client</option>
                      <option value="community">Community</option>
                      <option value="pending">Pending</option>
                    </select>
                  )}
                </div>

                {/* Joined */}
                <span style={{ color: "var(--color-txt-muted)", fontSize: 12 }}>
                  {u.createdAt?.toDate?.()?.toLocaleDateString() || "—"}
                </span>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(u.id, u.email)}
                  disabled={deleting === u.id}
                  style={{
                    backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444",
                    border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6,
                    padding: "5px 10px", fontSize: 11, fontWeight: 700,
                    cursor: "pointer", letterSpacing: "0.04em",
                  }}
                >
                  {deleting === u.id ? "..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </PortalLayout>
  )
}