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
  const [error,   setError]   = useState("")
  const [loading, setLoading] = useState(false)

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
    try {
      setLoading(true)
      await signUpEmail(form.email, form.password, form.displayName)
      navigate("/community")
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      setLoading(true)
      setError("")
      await signInGoogle()
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

  return (
    <PageLayout noFooter>
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <Card className="!p-8 shadow-xl border-slate-200">

            {/* Header */}
            <div className="mb-8 text-center">
              <SectionTag text="Join the Community" />
              <h1 className="font-heading font-black text-3xl mt-3 text-primary">
                Create Your Account
              </h1>
              <p className="font-sans text-sm text-slate-500 mt-2">
                Join FashilHack's cybersecurity community — free, instant access.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="
                font-sans text-xs font-bold text-red-600
                border border-red-200 bg-red-50
                px-4 py-3 mb-6 rounded
              ">
                ⚠ {error}
              </div>
            )}

            {/* Form */}
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  name="displayName"
                  placeholder="Your name"
                  value={form.displayName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Confirm</label>
                  <input
                    name="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={handleChange}
                    onKeyDown={e => e.key === "Enter" && handleSignup()}
                    className={inputClass}
                  />
                </div>
              </div>

              <Button
                variant="primary"
                full
                size="lg"
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Join Community →"}
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-tighter">OR</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Google */}
            <Button
              variant="ghost"
              full
              size="lg"
              onClick={handleGoogle}
              disabled={loading}
              className="!border-slate-200 !text-slate-600 hover:!bg-slate-50"
            >
              Continue with Google
            </Button>

            {/* Client access callout */}
            <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
              <p className="font-sans text-xs text-slate-500 leading-relaxed">
                Looking to hire FashilHack for your business?{" "}
                <Link
                  to="/contact"
                  className="text-accent font-bold hover:underline"
                >
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