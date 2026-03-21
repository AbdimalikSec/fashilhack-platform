import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import PageLayout from "../../components/layout/PageLayout"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import SectionTag from "../../components/ui/SectionTag"

export default function Signup() {
  const { signUpEmail, signInGoogle } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    displayName: "",
    email:       "",
    password:    "",
    confirm:     "",
  })
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  // After signup show the "check your email" screen
  // Persist verify screen across refreshes using localStorage
  const [verifyScreen, setVerifyScreenState] = useState(() => {
    return !!localStorage.getItem("fh_pending_verify")
  })
  const [resending,    setResending]    = useState(false)
  const [resendMsg,    setResendMsg]    = useState("")

  // Wrapper — always keep localStorage in sync
  const setVerifyScreen = (val) => {
    if (val) {
      localStorage.setItem("fh_pending_verify", form.email || localStorage.getItem("fh_pending_verify") || "")
    } else {
      localStorage.removeItem("fh_pending_verify")
    }
    setVerifyScreenState(val)
  }

  // On mount — if localStorage has a pending email, restore it into form so resend works
  useState(() => {
    const pending = localStorage.getItem("fh_pending_verify")
    if (pending) setForm(f => ({ ...f, email: pending }))
  })

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    if (!form.displayName.trim()) return "Please enter your name."
    if (!form.email.trim())       return "Please enter your email."
    if (form.password.length < 8) return "Password must be at least 8 characters."
    if (form.password !== form.confirm) return "Passwords do not match."
    return null
  }

  const handleSignup = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError("")
    setLoading(true)
    try {
      // AuthContext.signUpEmail handles everything:
      // create account → write Firestore doc → send verification email → sign out
      await signUpEmail(form.email, form.password, form.displayName)
      localStorage.setItem("fh_pending_verify", form.email)
      setVerifyScreenState(true)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setResendMsg("")
    try {
      // Re-signin to get user object, send verification, sign out again
      const { signInWithEmailAndPassword, sendEmailVerification, signOut } = await import("firebase/auth")
      const { auth } = await import("../../config/firebase")
      const cred = await signInWithEmailAndPassword(auth, form.email, form.password)
      await sendEmailVerification(cred.user)
      await signOut(auth)
      setResendMsg("Verification email sent! Check your inbox.")
    } catch (err) {
      setResendMsg("Could not resend. Try again in a minute.")
    } finally {
      setResending(false)
    }
  }

  const handleGoogle = async () => {
    try {
      setLoading(true)
      setError("")
      await signInGoogle()
      // Google accounts are pre-verified — go straight to community
      navigate("/community")
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `
    w-full bg-white border border-slate-200
    text-primary font-sans text-sm px-4 py-3.5 outline-none
    focus:border-accent transition-colors
    placeholder-slate-300 rounded
  `
  const labelClass = `
    font-sans text-xs font-bold tracking-widest uppercase
    text-slate-500 block mb-2
  `

  // ── VERIFY SCREEN ──
  if (verifyScreen) {
    return (
      <PageLayout noFooter>
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-slate-50">
          <div className="w-full max-w-md">
            <Card className="!p-8 shadow-xl border-slate-200 text-center">
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <SectionTag text="Almost there" />
              <h1 className="font-heading font-black text-2xl mt-3 text-primary">
                Check Your Email
              </h1>
              <p className="font-sans text-sm text-slate-500 mt-3 leading-relaxed">
                We sent a verification link to{" "}
                <span className="font-bold text-primary">{form.email}</span>.
                Click the link in that email to activate your account.
              </p>

              <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-lg text-left">
                <p className="font-sans text-xs text-slate-500 leading-relaxed">
                  Can't find it? Check your spam folder. The email comes from
                  Firebase / noreply@fashilhack.firebaseapp.com
                </p>
              </div>

              {resendMsg && (
                <p className="font-sans text-xs font-bold mt-4 text-green-600">{resendMsg}</p>
              )}

              <button
                onClick={handleResend}
                disabled={resending}
                className="mt-5 font-sans text-sm font-bold text-accent hover:underline disabled:opacity-50"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                {resending ? "Sending..." : "Resend verification email"}
              </button>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <p className="font-sans text-sm text-slate-500">
                  Already verified?{" "}
                  <Link
                    to="/login"
                    onClick={() => localStorage.removeItem("fh_pending_verify")}
                    className="text-accent font-semibold hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </PageLayout>
    )
  }

  // ── SIGNUP FORM ──
  return (
    <PageLayout noFooter>
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(255,255,255,0.85)",
          zIndex: 9999, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
        }}>
          <div style={{
            width: 44, height: 44,
            border: "4px solid #e2e8f0",
            borderTopColor: "#00aaff",
            borderRadius: "50%",
            animation: "fh-spin 0.7s linear infinite",
          }} />
          <p style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, color: "#64748b", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Creating your account...
          </p>
          <style>{`@keyframes fh-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <Card className="!p-8 shadow-xl border-slate-200">

            <div className="mb-8 text-center">
              <SectionTag text="Join the Community" />
              <h1 className="font-heading font-black text-3xl mt-3 text-primary">
                Create Your Account
              </h1>
              <p className="font-sans text-sm text-slate-500 mt-2">
                Join FashilHack's cybersecurity community — free, instant access.
              </p>
            </div>

            {error && (
              <div className="font-sans text-xs font-bold text-red-600 border border-red-200 bg-red-50 px-4 py-3 mb-6 rounded">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Full Name</label>
                <input name="displayName" placeholder="Your name"
                  value={form.displayName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input name="email" type="email" placeholder="you@email.com"
                  value={form.email} onChange={handleChange} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Password</label>
                  <input name="password" type="password" placeholder="••••••••"
                    value={form.password} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Confirm</label>
                  <input name="confirm" type="password" placeholder="••••••••"
                    value={form.confirm} onChange={handleChange}
                    onKeyDown={e => e.key === "Enter" && handleSignup()} className={inputClass} />
                </div>
              </div>

              <Button variant="primary" full size="lg" onClick={handleSignup} disabled={loading}>
                Join Community →
              </Button>
            </div>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-tighter">OR</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <Button variant="ghost" full size="lg" onClick={handleGoogle} disabled={loading}
              className="!border-slate-200 !text-slate-600 hover:!bg-slate-50">
              Continue with Google
            </Button>

            <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
              <p className="font-sans text-xs text-slate-500 leading-relaxed">
                Looking to hire FashilHack for your business?{" "}
                <Link to="/contact" className="text-accent font-bold hover:underline">
                  Request Client Access →
                </Link>
              </p>
            </div>

            <p className="font-sans text-sm text-slate-500 text-center mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-accent font-semibold hover:underline">
                Sign in
              </Link>
            </p>

          </Card>
        </div>
      </div>
    </PageLayout>
  )
}

function friendlyError(code) {
  const map = {
    "auth/email-already-in-use":  "An account with this email already exists.",
    "auth/invalid-email":         "Invalid email address.",
    "auth/weak-password":         "Password is too weak.",
    "auth/network-request-failed":"Network error. Check your connection.",
  }
  return map[code] || "Something went wrong. Please try again."
}