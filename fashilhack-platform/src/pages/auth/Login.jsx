import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import PageLayout from "../../components/layout/PageLayout"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import SectionTag from "../../components/ui/SectionTag"

export default function Login() {
  const { signInEmail, signInGoogle, role } = useAuth()
  const navigate = useNavigate()

  const [form,    setForm]    = useState({ email: "", password: "" })
  const [error,   setError]   = useState("")
  const [loading, setLoading] = useState(false)

  // Redirect based on role once it's loaded
  useEffect(() => {
    if (!role) return
    if (role === "admin")     navigate("/admin")
    else if (role === "team")      navigate("/team")
    else if (role === "client")    navigate("/client")
    else if (role === "community") navigate("/community")
    else if (role === "pending")   navigate("/pending") // only manually-set pending clients
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
      await signInEmail(form.email, form.password)
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
              <SectionTag text="Portal Access" />
              <h1 className="font-heading font-black text-3xl mt-3 text-primary">
                Welcome Back
              </h1>
              <p className="font-sans text-sm text-slate-500 mt-2">
                Sign in to your FashilHack account
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

            {/* Fields */}
            <div className="space-y-5">
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

              <div>
                <label className={labelClass}>Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={e => e.key === "Enter" && handleEmailLogin()}
                  className={inputClass}
                />
              </div>

              <Button
                variant="primary"
                full
                size="lg"
                onClick={handleEmailLogin}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In →"}
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
              onClick={handleGoogleLogin}
              disabled={loading}
              className="!border-slate-200 !text-slate-600 hover:!bg-slate-50"
            >
              Continue with Google
            </Button>

            {/* Footer */}
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