import { useEffect, useState } from "react"
import {
  collection, getDocs,
  doc, updateDoc, serverTimestamp
} from "firebase/firestore"
import { notifyApproved } from "../../api/index"
import { db } from "../../config/firebase"
import { useAuth } from "../../context/AuthContext"
import PortalLayout from "../../components/layout/PortalLayout"
import Card from "../../components/ui/Card"
import Badge from "../../components/ui/Badge"
import SectionTag from "../../components/ui/SectionTag"

const ROLES = ["client", "team", "community"]
const FILTERS = ["all", "pending", "client", "team", "community", "rejected"]

export default function ManageUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState("pending")
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "users"))
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetch()
  }, [])

  const flash = (text) => {
    setMsg(text)
    setTimeout(() => setMsg(""), 2500)
  }

const handleApprove = async (uid, role) => {
  try {
    await updateDoc(doc(db, "users", uid), {
      role,
      approvedAt: serverTimestamp(),
      approvedBy: user.uid,
    })
    setUsers(prev =>
      prev.map(u => u.id === uid ? { ...u, role } : u)
    )

    // Send approval email
    const approvedUser = users.find(u => u.id === uid)
    await notifyApproved({
      clientUid:   uid,
      displayName: approvedUser?.displayName || "",
      role,
    })

    flash(`✓ User approved as ${role} and notified by email.`)
  } catch {
    flash("⚠ Failed to approve user.")
  }
}

  const handleReject = async (uid) => {
    try {
      await updateDoc(doc(db, "users", uid), { role: "rejected" })
      setUsers(prev =>
        prev.map(u => u.id === uid ? { ...u, role: "rejected" } : u)
      )
      flash("✓ User rejected.")
    } catch {
      flash("⚠ Failed to reject user.")
    }
  }

  const handleRoleChange = async (uid, role) => {
    try {
      await updateDoc(doc(db, "users", uid), { role })
      setUsers(prev =>
        prev.map(u => u.id === uid ? { ...u, role } : u)
      )
      flash(`✓ Role changed to ${role}.`)
    } catch {
      flash("⚠ Failed to change role.")
    }
  }

  const filtered = filter === "all"
    ? users
    : users.filter(u => u.role === filter)

  if (loading) return (
    <PortalLayout title="User Management">
      <div className="flex items-center justify-center h-64">
        <p className="font-sans text-sm text-slate-400 font-bold animate-pulse">SYNCING USERS...</p>
      </div>
    </PortalLayout>
  )

  return (
    <PortalLayout title="User Management">
      <div className="space-y-10">

        {msg && (
          <div className="font-sans text-xs font-bold px-4 py-3 bg-primary/5 text-primary border border-primary/10 rounded-lg">
            {msg}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`
                font-sans text-[10px] tracking-widest uppercase font-black
                px-4 py-2 border transition-all rounded-full
                ${filter === f
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "border-slate-200 text-slate-400 hover:border-primary/50"
                }
              `}
            >
              {f} ({users.filter(u => f === "all" ? true : u.role === f).length})
            </button>
          ))}
        </div>

        {/* User cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <Card>
              <p className="font-sans text-sm text-slate-500 font-bold">No users found.</p>
            </Card>
          ) : filtered.map(u => (
            <Card key={u.id} className="group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-heading font-black text-primary text-sm group-hover:bg-primary/10 transition-colors">
                  {u.displayName?.[0] || "?"}
                </div>
                <div className="min-w-0">
                  <h3 className="font-sans font-black text-md text-primary truncate leading-none mb-1">{u.displayName || "Unknown User"}</h3>
                  <p className="font-sans text-xs text-slate-400 truncate">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <Badge label={u.role} type={u.role} />
                <span className="font-sans text-[10px] text-slate-300 font-black tracking-widest uppercase">
                  ACTIVE SINCE {u.createdAt?.toDate?.()?.getFullYear() || "—"}
                </span>
              </div>

              {u.role === "pending" && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="font-sans text-[10px] text-slate-400 font-black tracking-widest uppercase mb-4">Grant Credentials</p>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {ROLES.map(r => (
                      <button key={r}
                        onClick={() => handleApprove(u.id, r)}
                        className="px-3 py-1.5 font-sans text-[10px] font-black tracking-widest uppercase bg-slate-50 text-slate-600 hover:bg-primary hover:text-white rounded transition-all"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleReject(u.id)}
                    className="font-sans text-[10px] font-black tracking-widest uppercase text-red-400 hover:text-red-600 transition-colors"
                  >
                    Deny Access →
                  </button>
                </div>
              )}

              {u.role !== "pending" && u.role !== "rejected" && u.id !== user?.uid && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="font-sans text-[10px] text-slate-400 font-black tracking-widest uppercase mb-3 text-right">Restrict Access</p>
                  <button
                    onClick={() => handleReject(u.id)}
                    className="w-full py-2 bg-slate-50 text-red-400 font-sans text-[10px] font-black tracking-widest uppercase hover:bg-red-50 transition-all rounded"
                  >
                    Revoke Protocol Access
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </PortalLayout>
  )
}
