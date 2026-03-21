import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"
import { auth } from "../../config/firebase"
import PageLayout from "../../components/layout/PageLayout"
import Card from "../../components/ui/Card"
import SectionTag from "../../components/ui/SectionTag"
import Button from "../../components/ui/Button"

// States: loading → ready → success → error
export default function ResetPassword() {
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const oobCode         = searchParams.get("oobCode")

  const [state,     setState]     = useState("loading") // loading | ready | success | invalid
  const [email,     setEmail]     = useState("")
  const [password,  setPassword]  = useState("")
  const [confirm,   setConfirm]   = useState("")
  const [showPw,    setShowPw]    = useState(false)
  const [error,     setError]     = useState("")
  const [saving,    setSaving]    = useState(false)

  // Verify the code on mount — get the email it belongs to
  useEffect(() => {
    if (!oobCode) { setState("invalid"); return }
    verifyPasswordResetCode(auth, oobCode)
      .then(email => { setEmail(email); setState("ready") })
      .catch(() => setState("invalid"))
  }, [oobCode])

  const handleReset = async () => {
    if (password.length < 8) { setError("Password must be at least 8 characters."); return }
    if (password !== confirm) { setError("Passwords do not match."); return }
    setError("")
    setSaving(true)
    try {
      await confirmPasswordReset(auth, oobCode, password)
      setState("success")
    } catch (e) {
      if (e.code === "auth/expired-action-code") {
        setError("This reset link has expired. Please request a new one.")
      } else if (e.code === "auth/invalid-action-code") {
        setState("invalid")
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setSaving(false)
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

  return (
    <PageLayout noFooter>
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <Card className="!p-8 shadow-xl border-slate-200">

            {/* LOADING */}
            {state === "loading" && (
              <div className="text-center py-8">
                <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#00aaff", borderRadius: "50%", animation: "fh-spin 0.7s linear infinite", margin: "0 auto 16px" }} />
                <p className="font-sans text-sm text-slate-500">Verifying reset link...</p>
                <style>{`@keyframes fh-spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            )}

            {/* INVALID / EXPIRED */}
            {state === "invalid" && (
              <div className="text-center">
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <SectionTag text="Link Invalid" />
                <h1 className="font-heading font-black text-2xl mt-3 text-primary">
                  Link Expired or Invalid
                </h1>
                <p className="font-sans text-sm text-slate-500 mt-3 leading-relaxed">
                  This password reset link has already been used or has expired. Reset links are valid for 1 hour.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-6 w-full font-sans font-bold text-sm py-3.5 rounded text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "#00aaff" }}
                >
                  Back to Login
                </button>
              </div>
            )}

            {/* SUCCESS */}
            {state === "success" && (
              <div className="text-center">
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <SectionTag text="All Done" />
                <h1 className="font-heading font-black text-2xl mt-3 text-primary">
                  Password Updated
                </h1>
                <p className="font-sans text-sm text-slate-500 mt-3 leading-relaxed">
                  Your password has been changed successfully. You can now sign in with your new password.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-6 w-full font-sans font-bold text-sm py-3.5 rounded text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "#00aaff" }}
                >
                  Sign In →
                </button>
              </div>
            )}

            {/* READY — the actual form */}
            {state === "ready" && (
              <>
                <div className="mb-8 text-center">
                  <SectionTag text="Reset Password" />
                  <h1 className="font-heading font-black text-3xl mt-3 text-primary">
                    Choose a New Password
                  </h1>
                  <p className="font-sans text-sm text-slate-500 mt-2">
                    Setting a new password for{" "}
                    <span className="font-bold text-primary">{email}</span>
                  </p>
                </div>

                {error && (
                  <div className="font-sans text-xs font-bold text-red-600 border border-red-200 bg-red-50 px-4 py-3 mb-6 rounded">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>New Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={inputClass}
                        style={{ paddingRight: 48 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        {showPw ? "Hide" : "Show"}
                      </button>
                    </div>
                    {/* Strength indicator */}
                    {password.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="h-1 flex-1 rounded-full transition-all"
                            style={{ backgroundColor: password.length >= i * 3 ? (password.length >= 10 ? "#22c55e" : "#f59e0b") : "#e2e8f0" }} />
                        ))}
                        <span className="font-sans text-[10px] text-slate-400 ml-1">
                          {password.length < 8 ? "Too short" : password.length < 10 ? "Fair" : "Strong"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Confirm New Password</label>
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Repeat your new password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleReset()}
                      className={inputClass}
                      style={{ borderColor: confirm.length > 0 ? (confirm === password ? "#22c55e" : "#ef4444") : undefined }}
                    />
                    {confirm.length > 0 && (
                      <p className="font-sans text-[11px] font-bold mt-1.5" style={{ color: confirm === password ? "#22c55e" : "#ef4444" }}>
                        {confirm === password ? "✓ Passwords match" : "✗ Passwords do not match"}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleReset}
                    disabled={saving}
                    className="w-full font-sans font-bold text-sm py-4 rounded text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: "#00aaff" }}
                  >
                    {saving ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "fh-spin 0.7s linear infinite" }} />
                        Saving...
                      </span>
                    ) : "Set New Password →"}
                    <style>{`@keyframes fh-spin { to { transform: rotate(360deg) } }`}</style>
                  </button>
                </div>
              </>
            )}

          </Card>
        </div>
      </div>
    </PageLayout>
  )
}