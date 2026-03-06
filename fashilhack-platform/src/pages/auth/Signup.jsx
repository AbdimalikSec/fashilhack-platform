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

  const [step, setStep] = useState(1) // 1 = form, 2 = confirm
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirm: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validateStep1 = () => {
    if (!form.displayName.trim()) return "Please enter your name."
    if (!form.email.trim()) return "Please enter your email."
    if (form.password.length < 8) return "Password must be at least 8 characters."
    if (form.password !== form.confirm) return "Passwords do not match."
    return null
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError("")
    setStep(2)
  }

  const handleSignup = async () => {
    try {
      setLoading(true)
      setError("")
      await signUpEmail(form.email, form.password, form.displayName)
      navigate("/pending")
    } catch (err) {
      setError(friendlyError(err.code))
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      setLoading(true)
      setError("")
      await signInGoogle()
      navigate("/pending")
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
            <div className="mb-6 text-center">
              <SectionTag text={`Registration Phase ${step}`} />
              <h1 className="font-heading font-black text-3xl mt-3 text-primary">
                Join FashilHack
              </h1>
              <p className="font-sans text-sm text-slate-500 mt-2">
                Advanced cybersecurity for businesses
              </p>
            </div>

            {/* Step Progress */}
            <div className="flex gap-2 mb-8">
              {[1, 2].map(s => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= s ? "bg-accent" : "bg-slate-100"
                    }`}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="
                font-sans text-xs font-bold text-red-600
                border border-red-200 bg-red-50
                px-4 py-3 mb-8 rounded
              ">
                ⚠ {error}
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    name="displayName"
                    placeholder="Your official name"
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
                    placeholder="you@company.com"
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
                      onKeyDown={e => e.key === "Enter" && handleNext()}
                      className={inputClass}
                    />
                  </div>
                </div>

                <Button variant="primary" full size="lg" onClick={handleNext}>
                  Continue Registration
                </Button>

                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-tighter">OR</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <Button
                  variant="ghost"
                  full
                  size="lg"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="!border-slate-200 !text-slate-600 hover:!bg-slate-50"
                >
                  Sign up with Google
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-lg">
                  <p className="font-sans text-sm text-slate-600 leading-relaxed text-center">
                    <span className="text-accent font-bold">Account Review Notice</span><br />
                    FashilHack is a prioritized platform. Your access will be manually reviewed to ensure environment integrity.
                  </p>
                </div>

                <div className="border border-slate-100 rounded p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Name</span>
                    <span className="text-primary font-semibold">{form.displayName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Email</span>
                    <span className="text-primary font-semibold">{form.email}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    variant="primary"
                    full
                    size="lg"
                    onClick={handleSignup}
                    disabled={loading}
                  >
                    {loading ? "Creating Profile..." : "Submit for Review →"}
                  </Button>
                  <Button
                    variant="ghost"
                    full
                    size="md"
                    onClick={() => setStep(1)}
                  >
                    Back to Form
                  </Button>
                </div>
              </div>
            )}

            <p className="font-sans text-sm text-slate-500 text-center mt-10">
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
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Invalid email address.",
    "auth/weak-password": "Password is too weak.",
    "auth/network-request-failed": "Network error. Check your connection.",
  }
  return map[code] || "Something went wrong. Please try again."
}