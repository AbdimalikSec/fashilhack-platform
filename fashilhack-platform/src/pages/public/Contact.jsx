import { useState } from "react"
import { sendContactForm } from "../../api/index"
import PageLayout from "../../components/layout/PageLayout"

// ── Icons ──
const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const IconCheck = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

const SERVICES = [
  "Penetration Testing",
  "Web Application Security",
  "Vulnerability Assessment",
  "Social Engineering",
  "Cloud Security Review",
  "Not Sure — Need Advice",
]

const CONTACT_INFO = [
  {
    icon: <IconMail />,
    label: "Direct Email",
    value: "hello@fashilhack.so",
    sub: "For business inquiries",
  },
  {
    icon: <IconClock />,
    label: "Response Time",
    value: "Within 24 Hours",
    sub: "GMT+3 business days",
  },
  {
    icon: <IconLock />,
    label: "Confidentiality",
    value: "Full NDA Available",
    sub: "Signed before any discussion",
  },
]

export default function Contact() {
  const [form, setForm] = useState({
    name: "", email: "", company: "", service: "", message: "",
  })
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in your name, email and message.")
      return
    }
    setError("")
    setLoading(true)
    try {
      await sendContactForm(form)
      setSent(true)
    } catch (err) {
      setError(err.message || "Failed to send. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `
    w-full bg-white border border-slate-200
    text-slate-900 font-sans text-sm px-5 py-4 outline-none rounded-xl
    focus:border-blue-300 focus:ring-4 focus:ring-blue-50
    transition-all placeholder-slate-300
  `
  const labelClass = `
    font-sans text-[10px] font-black tracking-widest uppercase
    text-slate-400 block mb-2.5
  `

  return (
    <PageLayout>

      {/* ── HERO ── */}
      <section className="relative px-6 py-32 bg-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(#e8f4ff 1px, transparent 1px), linear-gradient(90deg, #e8f4ff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.5,
        }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none" style={{
          background: "radial-gradient(ellipse at top right, rgba(0,170,255,0.06), transparent 60%)",
        }} />

        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50 mb-8">
            <span className="font-sans text-xs font-bold text-slate-500 tracking-widest uppercase">Get In Touch</span>
          </div>
          <h1 className="font-heading font-black text-5xl md:text-7xl text-slate-900 tracking-tight leading-tight mb-8">
            Start a<br />
            <span style={{ color: "#00aaff" }}>Conversation.</span>
          </h1>
          <p className="font-sans text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
            Tell us about your organization and security objectives.
            We'll review your request and respond within 24 hours.
          </p>
        </div>
      </section>

      {/* ── FORM + INFO ── */}
      <section className="px-6 py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Left — Contact info */}
          <div className="flex flex-col gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50 mb-6">
                <span className="font-sans text-xs font-bold text-slate-500 tracking-widest uppercase">Contact</span>
              </div>
              <h2 className="font-heading font-black text-3xl text-slate-900 tracking-tight mb-4">
                Let's Talk Security
              </h2>
              <p className="font-sans text-sm text-slate-500 leading-relaxed">
                Whether you have a specific concern or just want to understand
                your exposure — we're ready to help.
              </p>
            </div>

            {/* Contact cards */}
            <div className="flex flex-col gap-4">
              {CONTACT_INFO.map(c => (
                <div key={c.label}
                  className="bg-white border border-slate-100 rounded-2xl p-6 flex items-start gap-5 hover:border-blue-100 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                    style={{ backgroundColor: "#00aaff" }}>
                    {c.icon}
                  </div>
                  <div>
                    <p className="font-sans text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">
                      {c.label}
                    </p>
                    <p className="font-sans text-sm font-bold text-slate-900 mb-0.5">{c.value}</p>
                    <p className="font-sans text-xs text-slate-400">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* NDA note */}
            <div className="bg-white border border-blue-100 rounded-2xl p-6">
              <p className="font-sans text-xs text-slate-500 leading-relaxed">
                <span className="font-bold" style={{ color: "#00aaff" }}>Confidential by default.</span>
                {" "}All inquiries are treated as confidential. A mutual NDA is available
                upon request before any technical discussion begins.
              </p>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-2">
            {sent ? (
              /* Success state */
              <div className="bg-white border border-slate-100 rounded-3xl p-16 flex flex-col items-center justify-center text-center min-h-[500px] shadow-xl">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-8 text-white"
                  style={{ backgroundColor: "#00aaff" }}>
                  <IconCheck />
                </div>
                <h3 className="font-heading font-black text-3xl text-slate-900 mb-4 tracking-tight">
                  Inquiry Received
                </h3>
                <p className="font-sans text-base text-slate-500 max-w-sm mx-auto leading-relaxed mb-10">
                  Your message has been received and saved securely.
                  Expect a response within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", company: "", service: "", message: "" }) }}
                  className="font-sans font-bold text-sm px-8 py-4 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md transition-all"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              /* Form */
              <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-xl">
                {error && (
                  <div className="font-sans text-xs font-bold text-red-600 border border-red-200 bg-red-50 px-5 py-4 mb-8 rounded-xl">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input name="name" placeholder="Your name"
                      value={form.name} onChange={handleChange}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Business Email *</label>
                    <input name="email" type="email" placeholder="you@company.com"
                      value={form.email} onChange={handleChange}
                      className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className={labelClass}>Organization</label>
                    <input name="company" placeholder="Company name"
                      value={form.company} onChange={handleChange}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Service Needed</label>
                    <select name="service"
                      value={form.service} onChange={handleChange}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="">Select a service...</option>
                      {SERVICES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-8">
                  <label className={labelClass}>Message *</label>
                  <textarea
                    name="message"
                    placeholder="Tell us about your environment, what you're concerned about, and what you're looking for..."
                    value={form.message}
                    onChange={handleChange}
                    rows={7}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full font-sans font-bold text-sm py-5 rounded-xl text-white flex items-center justify-center gap-3 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "#00aaff", boxShadow: "0 8px 32px rgba(0,170,255,0.2)" }}
                >
                  {loading ? "Sending..." : (<>Submit Inquiry <IconArrowRight /></>)}
                </button>

                <p className="font-sans text-xs text-slate-400 text-center mt-4">
                  By submitting you agree your information is handled confidentially.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

    </PageLayout>
  )
}