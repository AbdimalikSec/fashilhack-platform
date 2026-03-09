import { useNavigate } from "react-router-dom"
import PageLayout from "../../components/layout/PageLayout"

// ── Icons ──
const IconTarget = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
)
const IconGlobe = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)
const IconSearch = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const IconUsers = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconCloud = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
)
const IconFileText = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

const SERVICES = [
  {
    icon:  <IconTarget />,
    title: "Penetration Testing",
    desc:  "Full-scope authorized hacking across web, mobile, network, and cloud to expose real vulnerabilities and complete attack chains before real attackers do.",
    items: ["Black box / grey box / white box", "Internal & external scope", "Full kill chain simulation", "Post-exploitation analysis"],
  },
  {
    icon:  <IconGlobe />,
    title: "Web Application Security",
    desc:  "Deep manual testing of your web apps beyond automated scanners — covering logic flaws, authentication issues, and injection vectors at every layer.",
    items: ["OWASP Top 10 coverage", "Business logic testing", "API security assessment", "Auth & session testing"],
  },
  {
    icon:  <IconSearch />,
    title: "Vulnerability Assessment",
    desc:  "Systematic identification and prioritization of vulnerabilities across your entire attack surface, with a risk-based remediation roadmap.",
    items: ["Network scanning", "Service enumeration", "Risk-based prioritization", "Remediation roadmap"],
  },
  {
    icon:  <IconUsers />,
    title: "Social Engineering",
    desc:  "Test your human firewall with realistic simulated attacks to measure employee security awareness and exposure to manipulation techniques.",
    items: ["Phishing campaigns", "Vishing (voice phishing)", "Pretexting scenarios", "Awareness training"],
  },
  {
    icon:  <IconCloud />,
    title: "Cloud Security Review",
    desc:  "Audit your AWS, Azure, or GCP environment for misconfigurations, excessive permissions, and lateral movement paths through cloud infrastructure.",
    items: ["IAM policy review", "Storage bucket audits", "Network security groups", "Compliance mapping"],
  },
  {
    icon:  <IconFileText />,
    title: "Compliance & Reporting",
    desc:  "All engagements include dual reports — full technical findings for your IT team and an executive summary for leadership, both delivered in your portal.",
    items: ["Technical report", "Executive summary", "CVSS scoring", "Remediation guidance"],
  },
]

const PROCESS = [
  { num: "01", title: "Scoping Call",   desc: "Free consultation to define your objectives, environment, and rules of engagement." },
  { num: "02", title: "Agreement",      desc: "Formal NDA and scope document signed. Legal authorization established before any testing begins." },
  { num: "03", title: "Engagement",     desc: "Active testing phase with real-time finding visibility in your client portal as we work." },
  { num: "04", title: "Report",         desc: "Dual-format report delivered — technical depth and executive summary both included." },
  { num: "05", title: "Remediation",    desc: "We guide your team through fixes, answer questions, and retest to verify resolution." },
]

export default function Services() {
  const navigate = useNavigate()

  return (
    <PageLayout>

      {/* ── HERO ── */}
      <section className="relative px-6 py-32 bg-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(#e8f4ff 1px, transparent 1px), linear-gradient(90deg, #e8f4ff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.5,
        }} />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none" style={{
          background: "radial-gradient(ellipse at top left, rgba(0,170,255,0.06), transparent 60%)",
        }} />

        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50 mb-8">
            <span className="font-sans text-xs font-bold text-slate-500 tracking-widest uppercase">What We Offer</span>
          </div>
          <h1 className="font-heading font-black text-5xl md:text-7xl text-slate-900 tracking-tight leading-tight mb-8">
            Our Security<br />
            <span style={{ color: "#00aaff" }}>Services.</span>
          </h1>
          <p className="font-sans text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
            Every engagement is scoped, authorized, and executed with
            precision — from first contact to final delivery and remediation.
          </p>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="px-6 py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICES.map(s => (
              <div key={s.title}
                className="bg-white border border-slate-100 rounded-3xl p-10 hover:border-blue-100 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-all"
                    style={{ backgroundColor: "#00aaff" }}>
                    {s.icon}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-heading font-black text-xl text-slate-900 mb-3 tracking-tight">
                      {s.title}
                    </h3>
                    <p className="font-sans text-sm text-slate-500 leading-relaxed mb-6">
                      {s.desc}
                    </p>

                    {/* Items */}
                    <div className="grid grid-cols-2 gap-2">
                      {s.items.map(item => (
                        <div key={item} className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-white"
                            style={{ backgroundColor: "rgba(0,170,255,0.15)", color: "#00aaff" }}>
                            <IconCheck />
                          </span>
                          <span className="font-sans text-xs text-slate-600 font-semibold">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENGAGEMENT PROCESS ── */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50 mb-6">
              <span className="font-sans text-xs font-bold text-slate-500 tracking-widest uppercase">How It Works</span>
            </div>
            <h2 className="font-heading font-black text-4xl md:text-5xl text-slate-900 tracking-tight">
              Engagement Process
            </h2>
            <p className="font-sans text-lg text-slate-500 max-w-xl mx-auto mt-6 leading-relaxed">
              A structured process that keeps you informed and in control at every stage.
            </p>
          </div>

          <div className="flex flex-col gap-0 max-w-3xl mx-auto">
            {PROCESS.map((p, i) => (
              <div key={p.num} className="flex gap-8 items-start">
                {/* Number + line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center bg-white z-10"
                    style={{ borderColor: "#00aaff" }}>
                    <span className="font-heading font-black text-xs" style={{ color: "#00aaff" }}>{p.num}</span>
                  </div>
                  {i < PROCESS.length - 1 && (
                    <div className="w-px" style={{ height: "56px", backgroundColor: "#e2e8f0" }} />
                  )}
                </div>

                {/* Content */}
                <div className="pb-12 pt-2">
                  <h3 className="font-heading font-black text-lg text-slate-900 mb-2 tracking-tight">{p.title}</h3>
                  <p className="font-sans text-sm text-slate-500 leading-relaxed max-w-lg">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-28 text-center" style={{ backgroundColor: "#0a1628" }}>
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
            style={{ borderColor: "rgba(0,170,255,0.3)", backgroundColor: "rgba(0,170,255,0.08)" }}>
            <span className="font-sans text-xs font-bold tracking-widest uppercase" style={{ color: "#00aaff" }}>
              Get Started
            </span>
          </div>
          <h2 className="font-heading font-black text-4xl md:text-5xl text-white tracking-tight mb-8">
            Not Sure Where to Begin?
          </h2>
          <p className="font-sans text-lg mb-12 max-w-xl mx-auto leading-relaxed" style={{ color: "#8fa8b8" }}>
            Book a free scoping call. Our specialists will identify your
            critical surfaces and recommend the right engagement type for your organization.
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="font-sans font-bold text-sm px-10 py-5 rounded-lg text-white inline-flex items-center gap-3 transition-all hover:opacity-90"
            style={{ backgroundColor: "#00aaff", boxShadow: "0 0 40px rgba(0,170,255,0.3)" }}
          >
            Book Free Consultation <IconArrowRight />
          </button>
        </div>
      </section>

    </PageLayout>
  )
}