import { useState } from "react"
import { sendContactForm } from "../../api/index"
import PageLayout from "../../components/layout/PageLayout"
import SectionTag from "../../components/ui/SectionTag"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"

const SERVICES = [
  "Penetration Testing",
  "Web App Security",
  "Vulnerability Assessment",
  "Social Engineering",
  "Cloud Security Review",
  "Not Sure — Need Advice",
]

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    message: "",
  })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
  if (!form.name || !form.email || !form.message) {
    setError("Please fill in name, email and message.")
    return
  }
  setError("")
  setLoading(true)

  try {
    await sendContactForm(form)
    setSent(true)
  } catch (err) {
    setError(err.message || "Failed to send message. Please try again.")
  } finally {
    setLoading(false)
  }
}
  const inputClass = `
    w-full bg-white border-2 border-slate-100
    text-primary font-sans text-sm px-5 py-4 outline-none
    focus:border-accent transition-colors
    placeholder-slate-300 rounded-xl
  `
  const labelClass = `
    font-sans text-[10px] font-bold tracking-widest uppercase
    text-slate-400 block mb-3
  `

  return (
    <PageLayout>

      {/* ── HERO ── */}
      <section className="px-6 py-12 text-center bg-slate-50 flex flex-col items-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <SectionTag text="Get In Touch" />
          <h1 className="font-heading font-bold text-4xl md:text-5xl mt-6 mb-8 text-primary tracking-tight leading-tight text-center">
            Start a <span className="text-accent">Conversation</span>
          </h1>
          <p className="font-sans text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed text-center">
            Tell us about your organization and your security objectives.
            Our team will review your request and get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* ── FORM + INFO ── */}
      <section className="px-6 section-padding bg-white flex flex-col items-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">

          {/* Contact info */}
          <div className="flex flex-col gap-10 items-center md:items-start text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <SectionTag text="Operations" />
              <h2 className="font-heading font-bold text-2xl mt-4 mb-8 text-primary tracking-tight">
                Global Reach
              </h2>
            </div>

            {[
              { icon: "📧", label: "Direct Email", value: "hello@fashilhack.so" },
              { icon: "💬", label: "Portal Access", value: "Support Community" },
              { icon: "🌐", label: "Regional Link", value: "hq.fashilhack.so" },
            ].map(c => (
              <div key={c.label} className="flex flex-col md:flex-row gap-5 items-center md:items-start">
                <span className="text-3xl grayscale">{c.icon}</span>
                <div className="flex flex-col items-center md:items-start">
                  <p className="font-sans text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1.5">
                    {c.label}
                  </p>
                  <p className="font-sans text-base font-bold text-primary">
                    {c.value}
                  </p>
                </div>
              </div>
            ))}

            <div className="
              bg-slate-50 border border-slate-100 p-8 rounded-2xl shadow-sm mt-4 text-center md:text-left
            ">
              <p className="font-sans text-sm text-slate-500 leading-relaxed font-medium">
                <span className="text-accent font-bold">⏱ Operational SLT:</span><br />
                Business inquiries are processed within standard 24-hour response window on GMT+3 business days.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 flex flex-col items-center">
            {sent ? (
              <Card className="text-center h-full w-full flex flex-col items-center justify-center gap-8 py-20 !rounded-3xl shadow-xl">
                <div className="text-7xl">✅</div>
                <h3 className="font-heading font-bold text-3xl text-primary tracking-tight">
                  Inquiry Received
                </h3>
                <p className="font-sans text-lg text-slate-500 max-w-sm mx-auto font-medium">
                  Your message has been logged in our secure processing queue.
                  Expect a response shortly.
                </p>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => { setSent(false); setForm({ name: "", email: "", company: "", service: "", message: "" }) }}
                >
                  Send Another Inquiry
                </Button>
              </Card>
            ) : (
              <Card className="!p-10 md:!p-12 !rounded-[2rem] shadow-2xl border-slate-100 w-full flex flex-col items-center">

                {error && (
                  <div className="
                    w-full font-sans text-sm font-bold text-red-600
                    border-2 border-red-100 bg-red-50
                    px-6 py-4 mb-8 rounded-xl text-center
                  ">
                    ⚠ {error}
                  </div>
                )}

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <label className={labelClass}>Authorized Name *</label>
                    <input name="name" placeholder="Contact person"
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

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <label className={labelClass}>Organization</label>
                    <input name="company" placeholder="Full legal name"
                      value={form.company} onChange={handleChange}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Operational Range</label>
                    <select name="service"
                      value={form.service} onChange={handleChange}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="">Select a domain...</option>
                      {SERVICES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="w-full mb-10">
                  <label className={labelClass}>Technical Requirements *</label>
                  <textarea
                    name="message"
                    placeholder="Provide context for your security assessment..."
                    value={form.message}
                    onChange={handleChange}
                    rows={8}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <Button
                  variant="primary"
                  full
                  size="lg"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="shadow-xl shadow-accent/20"
                >
                  {loading ? "Processing..." : "Submit Inquiry →"}
                </Button>
              </Card>
            )}
          </div>
        </div>
      </section>

    </PageLayout>
  )
}