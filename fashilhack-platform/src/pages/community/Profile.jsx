import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
import { auth, db } from "../../config/firebase"
import PageLayout from "../../components/layout/PageLayout"
import { usePublicTheme } from "../../hooks/Usepublictheme"

const IconUser     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconFileText = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
const IconShield   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconArrowLeft = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
const IconClock    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IconMessage  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconCheck    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>

const TABS = [
  { id: "profile",  label: "Profile",  icon: <IconUser /> },
  { id: "posts",    label: "My Posts", icon: <IconFileText /> },
  { id: "security", label: "Security", icon: <IconShield /> },
]

export default function Profile() {
  const { user, userData } = useAuth()
  const navigate = useNavigate()
  const t = usePublicTheme()

  const [tab,      setTab]      = useState("profile")
  const [posts,    setPosts]    = useState([])
  const [postsLoading, setPostsLoading] = useState(false)

  // Profile form
  const [displayName, setDisplayName] = useState(userData?.displayName || "")
  const [profileMsg,  setProfileMsg]  = useState("")
  const [profileSaving, setProfileSaving] = useState(false)

  // Password form
  const [pwForm,   setPwForm]   = useState({ current: "", next: "", confirm: "" })
  const [pwMsg,    setPwMsg]    = useState("")
  const [pwSaving, setPwSaving] = useState(false)

  const flash = (setter, msg, delay = 3500) => {
    setter(msg)
    setTimeout(() => setter(""), delay)
  }

  // Load posts when tab switches
  useEffect(() => {
    if (tab !== "posts" || !user) return
    setPostsLoading(true)
    getDocs(query(
      collection(db, "posts"),
      where("authorUid", "==", user.uid),
      orderBy("createdAt", "desc")
    ))
      .then(snap => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(e => console.warn("posts:", e.message))
      .finally(() => setPostsLoading(false))
  }, [tab, user])

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return
    setProfileSaving(true)
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() })
      flash(setProfileMsg, "✓ Display name updated.")
    } catch (e) {
      flash(setProfileMsg, "⚠ Failed to update: " + e.message)
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      flash(setPwMsg, "⚠ Please fill in all fields.")
      return
    }
    if (pwForm.next.length < 8) {
      flash(setPwMsg, "⚠ New password must be at least 8 characters.")
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      flash(setPwMsg, "⚠ New passwords do not match.")
      return
    }
    setPwSaving(true)
    try {
      // Reauthenticate first (Firebase requires this for sensitive operations)
      const credential = EmailAuthProvider.credential(user.email, pwForm.current)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, pwForm.next)
      setPwForm({ current: "", next: "", confirm: "" })
      flash(setPwMsg, "✓ Password changed successfully.")
    } catch (e) {
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        flash(setPwMsg, "⚠ Current password is incorrect.")
      } else {
        flash(setPwMsg, "⚠ Failed: " + e.message)
      }
    } finally {
      setPwSaving(false)
    }
  }

  if (!user) {
    return (
      <PageLayout>
        <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "sans-serif", fontSize: 14, color: t.body, marginBottom: 16 }}>Sign in to view your profile.</p>
            <button onClick={() => navigate("/login")} style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 13, padding: "10px 24px", borderRadius: 10, backgroundColor: "#00aaff", color: "#fff", border: "none", cursor: "pointer" }}>Sign In</button>
          </div>
        </div>
      </PageLayout>
    )
  }

  const inp = {
    width: "100%", backgroundColor: t.inputBg, border: `1px solid ${t.inputBorder}`,
    color: t.heading, fontFamily: "sans-serif", fontSize: 14, padding: "12px 16px",
    borderRadius: 10, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
  }

  const isGoogleUser = user.providerData?.[0]?.providerId === "google.com"

  return (
    <PageLayout>
      <div style={{ minHeight: "100vh", backgroundColor: t.pageBg, transition: "background-color 0.2s" }}>

        {/* Header */}
        <div style={{ backgroundColor: t.sectionAlt, borderBottom: `1px solid ${t.border}`, padding: "16px 24px", position: "sticky", top: 72, zIndex: 20 }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => navigate("/community")}
              style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "sans-serif", fontSize: 11, fontWeight: 800, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", background: "none", border: "none", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.color = "#00aaff"}
              onMouseLeave={e => e.currentTarget.style.color = t.muted}>
              <IconArrowLeft /> Community
            </button>
            <span style={{ color: t.border }}>›</span>
            <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 800, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Profile</span>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

          {/* Avatar + name row */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", backgroundColor: "#00aaff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 28, color: "#fff", flexShrink: 0 }}>
              {userData?.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 24, color: t.heading, letterSpacing: "-0.03em", marginBottom: 4 }}>
                {userData?.displayName || user.email.split("@")[0]}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", padding: "3px 10px", borderRadius: 999, backgroundColor: "rgba(0,170,255,0.12)", color: "#00aaff" }}>
                  {userData?.role || "community"}
                </span>
                {user.emailVerified && (
                  <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
                    <IconCheck /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${t.border}`, marginBottom: 40 }}>
            {TABS.map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
                  fontFamily: "sans-serif", fontSize: 13, fontWeight: 700,
                  background: "none", border: "none", cursor: "pointer",
                  borderBottom: tab === tb.id ? "2px solid #00aaff" : "2px solid transparent",
                  color: tab === tb.id ? "#00aaff" : t.muted,
                  marginBottom: -1, transition: "all 0.15s",
                }}>
                {tb.icon} {tb.label}
              </button>
            ))}
          </div>

          {/* ── PROFILE TAB ── */}
          {tab === "profile" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

              <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: 28 }}>
                <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 16, color: t.heading, marginBottom: 24, letterSpacing: "-0.02em" }}>Account Info</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { label: "Email",       value: user.email },
                    { label: "Role",        value: userData?.role || "community" },
                    { label: "Member Since", value: userData?.createdAt?.toDate?.()?.toLocaleDateString() || "—" },
                    { label: "Auth Method", value: isGoogleUser ? "Google" : "Email / Password" },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${t.border}` }}>
                      <span style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{row.label}</span>
                      <span style={{ fontFamily: "sans-serif", fontSize: 13, color: t.heading, fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: 28 }}>
                <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 16, color: t.heading, marginBottom: 24, letterSpacing: "-0.02em" }}>Display Name</h2>
                <p style={{ fontFamily: "sans-serif", fontSize: 13, color: t.body, lineHeight: 1.6, marginBottom: 20 }}>
                  This is the name shown on your posts and comments in the community.
                </p>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 800, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Display Name</p>
                  <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your name" style={inp}
                    onFocus={e => e.target.style.borderColor = "#00aaff"}
                    onBlur={e => e.target.style.borderColor = t.inputBorder} />
                </div>
                {profileMsg && (
                  <p style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: profileMsg.startsWith("✓") ? "#22c55e" : "#ef4444", marginBottom: 12 }}>{profileMsg}</p>
                )}
                <button onClick={handleSaveProfile} disabled={profileSaving}
                  style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 13, padding: "10px 24px", borderRadius: 10, backgroundColor: "#00aaff", color: "#fff", border: "none", cursor: "pointer", opacity: profileSaving ? 0.6 : 1 }}>
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ── POSTS TAB ── */}
          {tab === "posts" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 18, color: t.heading, letterSpacing: "-0.02em" }}>
                  My Posts <span style={{ fontSize: 14, color: t.muted, fontWeight: 600 }}>({posts.length})</span>
                </h2>
                <button onClick={() => navigate("/community/writeup")}
                  style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 13, padding: "9px 20px", borderRadius: 10, backgroundColor: "#00aaff", color: "#fff", border: "none", cursor: "pointer" }}>
                  + New Post
                </button>
              </div>

              {postsLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: 24, opacity: 0.5, height: 80 }} />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div style={{ backgroundColor: t.cardBg, border: `1px dashed ${t.cardBorder}`, borderRadius: 16, padding: 64, textAlign: "center" }}>
                  <p style={{ fontFamily: "sans-serif", fontSize: 14, color: t.muted, marginBottom: 16 }}>You haven't published any posts yet.</p>
                  <button onClick={() => navigate("/community/writeup")}
                    style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 13, padding: "10px 24px", borderRadius: 10, backgroundColor: "#00aaff", color: "#fff", border: "none", cursor: "pointer" }}>
                    Write Your First Post
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {posts.map(post => (
                    <div key={post.id}
                      onClick={() => navigate(`/community/${post.id}`)}
                      style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "20px 24px", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#00aaff"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,170,255,0.08)" }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.boxShadow = "none" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", padding: "2px 8px", borderRadius: 6, backgroundColor: post.status === "published" ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)", color: post.status === "published" ? "#22c55e" : "#f59e0b" }}>
                            {post.status || "published"}
                          </span>
                          <span style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{post.category}</span>
                        </div>
                        <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 15, color: t.heading, letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "sans-serif", fontSize: 11, color: t.muted }}>
                            <IconClock /> {post.publishedAt?.toDate?.()?.toLocaleDateString() || "—"}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "sans-serif", fontSize: 11, color: t.muted }}>
                            <IconMessage /> {post.comments?.length || 0} comments
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/community/writeup?edit=${post.id}`) }}
                        style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, padding: "6px 16px", borderRadius: 8, border: `1px solid ${t.cardBorder}`, backgroundColor: "transparent", color: t.muted, cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#00aaff"; e.currentTarget.style.color = "#00aaff" }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.color = t.muted }}>
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {tab === "security" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

              {/* Change Password */}
              <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: 28 }}>
                <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 16, color: t.heading, marginBottom: 8, letterSpacing: "-0.02em" }}>Change Password</h2>

                {isGoogleUser ? (
                  <div style={{ padding: "20px 0" }}>
                    <p style={{ fontFamily: "sans-serif", fontSize: 13, color: t.muted, lineHeight: 1.6 }}>
                      Your account uses Google sign-in. Password management is handled by Google — you can't set a password here.
                    </p>
                  </div>
                ) : (
                  <>
                    <p style={{ fontFamily: "sans-serif", fontSize: 13, color: t.body, lineHeight: 1.6, marginBottom: 24 }}>Choose a strong password at least 8 characters long.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {[
                        { key: "current", label: "Current Password",  placeholder: "Enter current password" },
                        { key: "next",    label: "New Password",      placeholder: "At least 8 characters" },
                        { key: "confirm", label: "Confirm New",       placeholder: "Repeat new password" },
                      ].map(f => (
                        <div key={f.key}>
                          <p style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 800, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{f.label}</p>
                          <input type="password" placeholder={f.placeholder}
                            value={pwForm[f.key]}
                            onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                            style={inp}
                            onFocus={e => e.target.style.borderColor = "#00aaff"}
                            onBlur={e => e.target.style.borderColor = t.inputBorder} />
                        </div>
                      ))}
                    </div>
                    {pwMsg && (
                      <p style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: pwMsg.startsWith("✓") ? "#22c55e" : "#ef4444", margin: "12px 0" }}>{pwMsg}</p>
                    )}
                    <button onClick={handleChangePassword} disabled={pwSaving}
                      style={{ marginTop: 16, fontFamily: "sans-serif", fontWeight: 700, fontSize: 13, padding: "10px 24px", borderRadius: 10, backgroundColor: "#00aaff", color: "#fff", border: "none", cursor: "pointer", opacity: pwSaving ? 0.6 : 1 }}>
                      {pwSaving ? "Updating..." : "Update Password"}
                    </button>
                  </>
                )}
              </div>

              {/* MFA Info Card */}
              <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: 28 }}>
                <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 16, color: t.heading, marginBottom: 8, letterSpacing: "-0.02em" }}>Two-Factor Authentication</h2>
                <p style={{ fontFamily: "sans-serif", fontSize: 13, color: t.body, lineHeight: 1.6, marginBottom: 20 }}>
                  MFA adds an extra layer of security. When enabled, you'll need both your password and a one-time code from an authenticator app to log in.
                </p>
                <div style={{ backgroundColor: t.sectionAlt, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                  <p style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>⚠ Coming Soon</p>
                  <p style={{ fontFamily: "sans-serif", fontSize: 13, color: t.body, lineHeight: 1.6 }}>
                    TOTP-based MFA (Google Authenticator, Authy) is being added in the next platform update. You'll be notified when it's available for your account.
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["Works with Google Authenticator & Authy", "Protects against password breaches", "Required for admin and team accounts soon"].map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: "rgba(0,170,255,0.12)", color: "#00aaff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><IconCheck /></span>
                      <span style={{ fontFamily: "sans-serif", fontSize: 13, color: t.body }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session info */}
              <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: 28, gridColumn: "1 / -1" }}>
                <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 16, color: t.heading, marginBottom: 20, letterSpacing: "-0.02em" }}>Account Status</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {[
                    { label: "Email Verified", value: user.emailVerified ? "Yes" : "No", ok: user.emailVerified },
                    { label: "Auth Provider",  value: isGoogleUser ? "Google" : "Email/Password", ok: true },
                    { label: "Account Active", value: "Yes", ok: true },
                  ].map(s => (
                    <div key={s.label} style={{ backgroundColor: t.sectionAlt, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
                      <p style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 800, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{s.label}</p>
                      <p style={{ fontFamily: "sans-serif", fontSize: 15, fontWeight: 700, color: s.ok ? "#22c55e" : "#ef4444" }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}