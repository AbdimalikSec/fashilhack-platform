import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { sendPasswordResetEmail, sendEmailVerification } from "firebase/auth"
import { auth } from "../../config/firebase"
import PageLayout from "../../components/layout/PageLayout"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import SectionTag from "../../components/ui/SectionTag"

export default function Login() {
  const { signInEmail, signInGoogle, role } = useAuth()
  const navigate = useNavigate()

  const [form,         setForm]         = useState({ email: "", password: "" })
  const [error,        setError]        = useState("")
  const [loading,      setLoading]      = useState(false)
  const [resetSent,    setResetSent]    = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  // When user signs in but email is not verified yet
  const [unverified,   setUnverified]   = useState(false)
  const [resending,    setResending]    = useState(false)
  const [resendMsg,    setResendMsg]    = useState("")

  useEffect(() => {
    if (!role) return
    if (role === "admin")     navigate("/admin")
    else if (role === "team")      navigate("/team")
    else if (role === "client")    navigate("/client")
    else if (role === "community") navigate("/community")
    else if (role === "pending")   navigate("/pending")
  }, [role, navigate])

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleEmailLogin = async () => {
    if (!form.email || !form.password) {
      setError("Please fill in all fields.")
      return
    }
    try {
      setLoading(true)
      setError("")
      setUnverified(false)
      await signInEmail(form.email, form.password)
      const firebaseUser = auth.currentUser
      if (firebaseUser && !firebaseUser.emailVerified) {
        await auth.signOut()
        setUnverified(true)
        setLoading(false)
        return
      }
      // Clear any pending verification flag — they're verified now
      localStorage.removeItem("fh_pending_verify")
      // Role redirect handled by useEffect above
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError("")
      await signInGoogle()
      // Google accounts are always verified — useEffect handles redirect
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!form.email.trim()) {
      setError("Enter your email address above first, then click Forgot Password.")
      return
    }
    setResetLoading(true)
    setError("")
    try {
      await sendPasswordResetEmail(auth, form.email)
      setResetSent(true)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setResetLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResending(true)
    setResendMsg("")
    try {
      // Sign in temporarily to get the user object so we can send verification
      const result = await signInEmail(form.email, form.password)
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await sendEmailVerification(auth.currentUser)
        await auth.signOut()
        setResendMsg("Verification email sent! Check your inbox.")
      }
    } catch {
      setResendMsg("Could not resend. Try again in a minute.")
    } finally {
      setResending(false)
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

  // ── UNVERIFIED EMAIL SCREEN ──
  if (unverified) {
    return (
      <PageLayout noFooter>
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-slate-50">
          <div className="w-full max-w-md">
            <Card className="!p-8 shadow-xl border-slate-200 text-center">
              <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
              <SectionTag text="Verification Required" />
              <h1 className="font-heading font-black text-2xl mt-3 text-primary">
                Verify Your Email
              </h1>
              <p className="font-sans text-sm text-slate-500 mt-3 leading-relaxed">
                Your email address hasn't been verified yet. Check your inbox for
                the verification link we sent when you signed up.
              </p>

              {resendMsg && (
                <p className="font-sans text-xs font-bold mt-4 text-green-600">{resendMsg}</p>
              )}

              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="mt-5 font-sans text-sm font-bold text-accent hover:underline disabled:opacity-50"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                {resending ? "Sending..." : "Resend verification email"}
              </button>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <button
                  onClick={() => setUnverified(false)}
                  className="font-sans text-sm text-slate-500 hover:text-primary"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  ← Back to login
                </button>
              </div>
            </Card>
          </div>
        </div>
      </PageLayout>
    )
  }

  // ── RESET SENT SCREEN ──
  if (resetSent) {
    return (
      <PageLayout noFooter>
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-slate-50">
          <div className="w-full max-w-md">
            <Card className="!p-8 shadow-xl border-slate-200 text-center">
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
              <SectionTag text="Check Your Email" />
              <h1 className="font-heading font-black text-2xl mt-3 text-primary">
                Reset Link Sent
              </h1>
              <p className="font-sans text-sm text-slate-500 mt-3 leading-relaxed">
                We sent a password reset link to{" "}
                <span className="font-bold text-primary">{form.email}</span>.
                Click the link to set a new password.
              </p>
              <div className="mt-6 border-t border-slate-100 pt-6">
                <button
                  onClick={() => setResetSent(false)}
                  className="font-sans text-sm text-slate-500 hover:text-primary"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  ← Back to login
                </button>
              </div>
            </Card>
          </div>
        </div>
      </PageLayout>
    )
  }

  // ── LOGIN FORM ──
  return (
    <PageLayout noFooter>
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <Card className="!p-8 shadow-xl border-slate-200">

            <div className="mb-8 text-center">
              <SectionTag text="Portal Access" />
              <h1 className="font-heading font-black text-3xl mt-3 text-primary">
                Welcome Back
              </h1>
              <p className="font-sans text-sm text-slate-500 mt-2">
                Sign in to your FashilHack account
              </p>
            </div>

            {error && (
              <div className="font-sans text-xs font-bold text-red-600 border border-red-200 bg-red-50 px-4 py-3 mb-6 rounded">
                {error}
              </div>
            )}

            {resetSent === false && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input name="email" type="email" placeholder="you@email.com"
                    value={form.email} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass} style={{ marginBottom: 0 }}>Password</label>
                    <button
                      onClick={handleForgotPassword}
                      disabled={resetLoading}
                      className="font-sans text-[10px] font-bold text-accent hover:underline uppercase tracking-widest disabled:opacity-50"
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                      {resetLoading ? "Sending..." : "Forgot Password?"}
                    </button>
                  </div>
                  <input name="password" type="password" placeholder="••••••••"
                    value={form.password} onChange={handleChange}
                    onKeyDown={e => e.key === "Enter" && handleEmailLogin()}
                    className={inputClass} />
                </div>

                <Button variant="primary" full size="lg" onClick={handleEmailLogin} disabled={loading}>
                  {loading ? "Signing In..." : "Sign In →"}
                </Button>
              </div>
            )}

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-tighter">OR</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <Button variant="ghost" full size="lg" onClick={handleGoogleLogin} disabled={loading}
              className="!border-slate-200 !text-slate-600 hover:!bg-slate-50">
              Continue with Google
            </Button>

            <p className="font-sans text-sm text-slate-500 text-center mt-8">
              New to the community?{" "}
              <Link to="/signup" className="text-accent font-semibold hover:underline">
                Create an account
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
    "auth/user-not-found":        "No account found with this email.",
    "auth/wrong-password":        "Incorrect password.",
    "auth/invalid-email":         "Invalid email address.",
    "auth/too-many-requests":     "Too many attempts. Please try again later.",
    "auth/network-request-failed":"Network error. Check your connection.",
    "auth/invalid-credential":    "Invalid email or password.",
  }
  return map[code] || "Something went wrong. Please try again."
}