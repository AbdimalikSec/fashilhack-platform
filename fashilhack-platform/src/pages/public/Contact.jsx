import { useState } from "react"
import { sendContactForm } from "../../api/index"
import PageLayout from "../../components/layout/PageLayout"
import { usePublicTheme } from "../../hooks/Usepublictheme"

const IconMail  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const IconClock = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IconLock  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconCheck = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconArrowRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>

const SERVICES_LIST = ["Penetration Testing","Web Application Security","Vulnerability Assessment","Social Engineering","Cloud Security Review","Not Sure — Need Advice"]
const CONTACT_INFO  = [
  { icon: <IconMail />,  label: "Direct Email",    value: "hello@fashilhack.so",  sub: "For business inquiries" },
  { icon: <IconClock />, label: "Response Time",   value: "Within 24 Hours",      sub: "GMT+3 business days" },
  { icon: <IconLock />,  label: "Confidentiality", value: "Full NDA Available",   sub: "Signed before any discussion" },
]

export default function Contact() {
  const t = usePublicTheme()
  const [form, setForm]     = useState({ name:"", email:"", company:"", service:"", message:"" })
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState("")

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) { setError("Please fill in your name, email and message."); return }
    setError(""); setLoading(true)
    try { await sendContactForm(form); setSent(true) }
    catch (err) { setError(err.message || "Failed to send. Please try again.") }
    finally { setLoading(false) }
  }

  const inp = { width: "100%", backgroundColor: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.heading, fontFamily: "sans-serif", fontSize: 14, padding: "16px 20px", borderRadius: 12, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }
  const Tag = ({ text }) => (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, border: `1px solid ${t.tagBorder}`, backgroundColor: t.tagBg, marginBottom: 24 }}>
      <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, color: t.tagText, letterSpacing: "0.1em", textTransform: "uppercase" }}>{text}</span>
    </div>
  )

  return (
    <PageLayout>

      {/* HERO */}
      <section style={{ backgroundColor: t.pageBg, position: "relative", padding: "128px 24px", overflow: "hidden", transition: "background-color 0.2s" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(${t.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${t.gridLine} 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />
        <div style={{ position: "relative", maxWidth: 960, margin: "0 auto" }}>
          <Tag text="Get In Touch" />
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2.5rem,6vw,4.5rem)", color: t.heading, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 32 }}>
            Start a<br /><span style={{ color: "#00aaff" }}>Conversation.</span>
          </h1>
          <p style={{ fontFamily: "sans-serif", fontSize: 20, color: t.body, maxWidth: 640, lineHeight: 1.7, fontWeight: 500 }}>Tell us about your organization and security objectives. We'll review your request and respond within 24 hours.</p>
        </div>
      </section>

      {/* FORM + INFO */}
      <section style={{ backgroundColor: t.sectionAlt, padding: "112px 24px", transition: "background-color 0.2s" }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start" style={{ maxWidth: 1280, margin: "0 auto" }}>

          {/* Left */}
          <div>
            <Tag text="Contact" />
            <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 28, color: t.heading, letterSpacing: "-0.03em", marginBottom: 16 }}>Let's Talk Security</h2>
            <p style={{ fontFamily: "sans-serif", fontSize: 14, color: t.body, lineHeight: 1.7, marginBottom: 32 }}>Whether you have a specific concern or just want to understand your exposure — we're ready to help.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              {CONTACT_INFO.map(c => (
                <div key={c.label} style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: 24, display: "flex", alignItems: "flex-start", gap: 20, transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#00aaff"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,170,255,0.1)" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.boxShadow = "none" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#00aaff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <p style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>{c.label}</p>
                    <p style={{ fontFamily: "sans-serif", fontSize: 14, fontWeight: 700, color: t.heading, marginBottom: 2 }}>{c.value}</p>
                    <p style={{ fontFamily: "sans-serif", fontSize: 12, color: t.muted }}>{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: t.cardBg, border: `1px solid rgba(0,170,255,0.2)`, borderRadius: 16, padding: 24 }}>
              <p style={{ fontFamily: "sans-serif", fontSize: 13, color: t.body, lineHeight: 1.7 }}>
                <span style={{ fontWeight: 700, color: "#00aaff" }}>Confidential by default.</span>{" "}
                All inquiries are treated as confidential. A mutual NDA is available upon request before any technical discussion begins.
              </p>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 24, padding: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 500 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#00aaff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}><IconCheck /></div>
                <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 28, color: t.heading, marginBottom: 16, letterSpacing: "-0.03em" }}>Inquiry Received</h3>
                <p style={{ fontFamily: "sans-serif", fontSize: 15, color: t.body, maxWidth: 360, margin: "0 auto 40px", lineHeight: 1.7 }}>Your message has been received and saved securely. Expect a response within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name:"",email:"",company:"",service:"",message:"" }) }}
                  style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, padding: "14px 32px", borderRadius: 12, border: `1px solid ${t.cardBorder}`, backgroundColor: "transparent", color: t.body, cursor: "pointer" }}>
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 24, padding: 40 }}>
                {error && <div style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.08)", padding: "14px 20px", borderRadius: 12, marginBottom: 24 }}>{error}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Full Name *</p>
                    <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} style={inp} onFocus={e => e.target.style.borderColor = "#00aaff"} onBlur={e => e.target.style.borderColor = t.inputBorder} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Business Email *</p>
                    <input name="email" type="email" placeholder="you@company.com" value={form.email} onChange={handleChange} style={inp} onFocus={e => e.target.style.borderColor = "#00aaff"} onBlur={e => e.target.style.borderColor = t.inputBorder} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Organization</p>
                    <input name="company" placeholder="Company name" value={form.company} onChange={handleChange} style={inp} onFocus={e => e.target.style.borderColor = "#00aaff"} onBlur={e => e.target.style.borderColor = t.inputBorder} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Service Needed</p>
                    <select name="service" value={form.service} onChange={handleChange} style={{ ...inp, cursor: "pointer", backgroundColor: t.selectBg }}>
                      <option value="">Select a service...</option>
                      {SERVICES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 32 }}>
                  <p style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Message *</p>
                  <textarea name="message" placeholder="Tell us about your environment and what you're looking for..." value={form.message} onChange={handleChange} rows={7} style={{ ...inp, resize: "none" }} onFocus={e => e.target.style.borderColor = "#00aaff"} onBlur={e => e.target.style.borderColor = t.inputBorder} />
                </div>
                <button onClick={handleSubmit} disabled={loading}
                  style={{ width: "100%", fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, padding: "20px", borderRadius: 12, color: "#fff", backgroundColor: "#00aaff", border: "none", cursor: "pointer", boxShadow: "0 8px 32px rgba(0,170,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, opacity: loading ? 0.6 : 1 }}>
                  {loading ? "Sending..." : <><span>Submit Inquiry</span><IconArrowRight /></>}
                </button>
                <p style={{ fontFamily: "sans-serif", fontSize: 12, color: t.muted, textAlign: "center", marginTop: 16 }}>By submitting you agree your information is handled confidentially.</p>
              </div>
            )}
          </div>
        </div>
      </section>

    </PageLayout>
  )
}