import { useEffect, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../config/firebase"
import { useAuth } from "../../context/AuthContext"

const API = import.meta.env.VITE_API_URL || "http://localhost:5000"

const IconShield = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconCheck  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>

export default function CourseCheckout() {
  const { courseId }       = useParams()
  const [searchParams]     = useSearchParams()
  const { user }           = useAuth()
  const navigate           = useNavigate()

  const [course,   setCourse]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [starting, setStarting] = useState(false)
  const [error,    setError]    = useState("")

  // If cancelled, show message
  const cancelled = searchParams.get("cancelled") === "true"

  useEffect(() => {
    if (!user) { navigate(`/courses/${courseId}`); return }
    getDoc(doc(db, "courses", courseId))
      .then(snap => { if (snap.exists()) setCourse({ id: snap.id, ...snap.data() }) })
      .catch(e => console.warn(e))
      .finally(() => setLoading(false))
  }, [courseId, user])

  const handleCheckout = async () => {
    if (!user) { navigate("/login"); return }
    setStarting(true)
    setError("")
    try {
      const token = await user.getIdToken()
      const res   = await fetch(`${API}/api/stripe/create-checkout`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ courseId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to start checkout")
      // Redirect to Stripe hosted checkout page
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
      setStarting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0d0f16", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Loading...</p>
    </div>
  )

  if (!course) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0d0f16", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "sans-serif", fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Course not found.</p>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0d0f16", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 480, width: "100%" }}>

        {/* Back */}
        <button onClick={() => navigate(`/courses/${courseId}`)}
          style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", marginBottom: 32, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
          ← Back to Course
        </button>

        {/* Cancelled notice */}
        {cancelled && (
          <div style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 24 }}>
            <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "#f59e0b", margin: 0 }}>
              Payment was cancelled. Your card was not charged.
            </p>
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 24 }}>
            <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "#ef4444", margin: 0 }}>⚠ {error}</p>
          </div>
        )}

        {/* Card */}
        <div style={{ backgroundColor: "#161b22", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden" }}>

          {/* Course thumbnail / header */}
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
          ) : (
            <div style={{ height: 120, backgroundColor: "rgba(0,170,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 32, color: "rgba(0,170,255,0.4)" }}>FH</span>
            </div>
          )}

          <div style={{ padding: 32 }}>
            <p style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Enrolling in
            </p>
            <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "1.5rem", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 24 }}>
              {course.title}
            </h1>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 40, color: "#fff" }}>${course.price}</span>
              <span style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>USD · one-time</span>
            </div>

            {/* What's included */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                What you get
              </p>
              {[
                `${course.totalLessons || 0} lessons across all sections`,
                "Lifetime access — yours forever",
                "All future updates included",
                "Access on any device",
              ].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: "rgba(34,197,94,0.12)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconCheck />
                  </span>
                  <span style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              disabled={starting}
              style={{ width: "100%", fontFamily: "sans-serif", fontWeight: 700, fontSize: 15, padding: "16px", borderRadius: 12, backgroundColor: starting ? "rgba(0,170,255,0.5)" : "#00aaff", color: "#fff", border: "none", cursor: starting ? "default" : "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 8px 32px rgba(0,170,255,0.25)", transition: "all 0.15s" }}>
              {starting ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "fh-spin 0.7s linear infinite" }} />
                  Redirecting to payment...
                </>
              ) : (
                `Pay $${course.price} — Enroll Now`
              )}
            </button>

            {/* Trust line */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span style={{ color: "rgba(255,255,255,0.25)" }}><IconShield /></span>
              <span style={{ fontFamily: "sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
                Secure payment powered by Stripe
              </span>
            </div>
          </div>
        </div>

        <style>{`@keyframes fh-spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}