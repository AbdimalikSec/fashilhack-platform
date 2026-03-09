import { useNavigate } from "react-router-dom"
import PageLayout from "../../components/layout/PageLayout"
import Button from "../../components/ui/Button"
import SectionTag from "../../components/ui/SectionTag"

// ── Inline SVG Icons ──
const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const IconTarget = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
)
const IconGlobe = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)
const IconSearch = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const IconUsers = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconFileText = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
)
const IconCloud = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
)
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const SERVICES = [
  { icon: <IconTarget />, title: "Penetration Testing", desc: "Full-scope ethical hacking across web, mobile, network, and cloud to expose real attack paths." },
  { icon: <IconGlobe />, title: "Web App Security", desc: "OWASP Top 10, business logic flaws, auth bypass, and injection testing on your applications." },
  { icon: <IconSearch />, title: "Vulnerability Assessment", desc: "Systematic identification and risk-based prioritization of your entire attack surface." },
  { icon: <IconUsers />, title: "Social Engineering", desc: "Phishing simulations and pretexting scenarios to measure your human firewall's resilience." },
  { icon: <IconCloud />, title: "Cloud Security Review", desc: "AWS, Azure, and GCP configuration audits to eliminate misconfigurations and privilege escalation." },
  { icon: <IconFileText />, title: "Compliance & Reporting", desc: "Dual-audience reports — technical depth for IT, plain-language summaries for executives." },
]

const STATS = [
  { num: "200+", label: "Vulnerabilities Found" },
  { num: "50+",  label: "Clients Secured" },
  { num: "98%",  label: "Client Satisfaction" },
  { num: "24/7", label: "Threat Monitoring" },
]

const STEPS = [
  { num: "01", title: "Discovery",    desc: "Define scope, goals, rules of engagement and threat model." },
  { num: "02", title: "Recon",        desc: "OSINT, surface mapping and passive enumeration of your assets." },
  { num: "03", title: "Exploitation", desc: "Controlled authorized attack simulation to validate real-world impact." },
  { num: "04", title: "Reporting",    desc: "Dual-section report: technical for IT, plain summary for leadership." },
  { num: "05", title: "Remediation",  desc: "Guided fixes, retesting and a clean bill of security health." },
]

const WHY = [
  "Real-time finding visibility — no waiting for a final PDF",
  "Dual reports: technical + executive in every engagement",
  "Adversary-led mindset, not just checklist testing",
  "Remediation guidance included, not an upsell",
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <PageLayout>

      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-6 bg-white overflow-hidden">

        {/* Subtle grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(#e8f4ff 1px, transparent 1px), linear-gradient(90deg, #e8f4ff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.6,
        }} />

        {/* Blue glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none" style={{
          background: "radial-gradient(ellipse, rgba(0,170,255,0.08) 0%, transparent 70%)",
        }} />

        <div className="relative max-w-5xl mx-auto flex flex-col items-center">

          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ backgroundColor: "#00aaff" }} />
            <span className="font-sans text-xs font-bold text-slate-500 tracking-widest uppercase">
              Advanced Cybersecurity Solutions
            </span>
          </div>

          <h1 className="font-heading font-black text-5xl md:text-7xl leading-[1.05] tracking-tight text-slate-900 mb-8">
            Simulating Attacks,<br />
            <span style={{ color: "#00aaff" }}>Securing Businesses.</span>
          </h1>

          <p className="font-sans text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            We think like attackers so your business stays defended.
            Professional-grade penetration testing and vulnerability management
            for organizations that can't afford to be breached.
          </p>

          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => navigate("/contact")}
              className="font-sans font-bold text-sm px-8 py-4 rounded-lg text-white transition-all hover:opacity-90 hover:shadow-xl flex items-center gap-2"
              style={{ backgroundColor: "#00aaff", boxShadow: "0 8px 32px rgba(0,170,255,0.25)" }}
            >
              Request Consultation <IconArrowRight />
            </button>
            <button
              onClick={() => navigate("/services")}
              className="font-sans font-bold text-sm px-8 py-4 rounded-lg border border-slate-200 text-slate-700 bg-white hover:border-slate-300 hover:shadow-md transition-all"
            >
              Our Services
            </button>
          </div>

          {/* Trust line */}
          <div className="flex items-center gap-6 mt-16 flex-wrap justify-center">
            {["ISO 27001 Methodology", "PNPT Certified Team", "Full NDA Coverage"].map(t => (
              <div key={t} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "#00aaff" }}>
                  <IconCheck />
                </span>
                <span className="font-sans text-xs font-semibold text-slate-500">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} className={`py-14 text-center ${i < 3 ? "md:border-r border-slate-100" : ""}`}>
              <div className="font-heading font-black text-5xl mb-2 text-slate-900">{s.num}</div>
              <div className="font-sans text-[10px] font-bold tracking-widest uppercase text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="px-6 py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50 mb-6">
              <span className="font-sans text-xs font-bold text-slate-500 tracking-widest uppercase">What We Do</span>
            </div>
            <h2 className="font-heading font-black text-4xl md:text-5xl text-slate-900 tracking-tight">
              Our Security Services
            </h2>
            <p className="font-sans text-lg text-slate-500 max-w-2xl mx-auto mt-6 leading-relaxed">
              From reconnaissance to remediation, every attack surface covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(s => (
              <div
                key={s.title}
                className="bg-white border border-slate-100 rounded-2xl p-8 hover:border-blue-100 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-slate-400 group-hover:text-white transition-all duration-300"
                  style={{ backgroundColor: "rgb(248,250,252)" }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#00aaff" }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgb(248,250,252)" }}
                >
                  {s.icon}
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 mb-3 tracking-tight">{s.title}</h3>
                <p className="font-sans text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY FASHILHACK ── */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50 mb-6">
              <span className="font-sans text-xs font-bold text-slate-500 tracking-widest uppercase">Why FashilHack</span>
            </div>
            <h2 className="font-heading font-black text-4xl md:text-5xl text-slate-900 tracking-tight leading-tight mb-8">
              Security That Goes Beyond the Report
            </h2>
            <p className="font-sans text-base text-slate-500 leading-relaxed mb-10">
              Most firms hand you a PDF and disappear. We stay with you through
              discovery, remediation, and verification — because finding the
              vulnerability is only half the job.
            </p>
            <div className="flex flex-col gap-4">
              {WHY.map(w => (
                <div key={w} className="flex items-start gap-4">
                  <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 text-white"
                    style={{ backgroundColor: "#00aaff" }}>
                    <IconCheck />
                  </span>
                  <span className="font-sans text-sm font-semibold text-slate-700 leading-relaxed">{w}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/about")}
              className="mt-10 font-sans font-bold text-sm flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ color: "#00aaff" }}
            >
              Learn about our team <IconArrowRight />
            </button>
          </div>

          {/* Right — visual panel */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-2xl bg-slate-900 p-8">
              {/* Fake terminal */}
              <div className="flex items-center gap-2 mb-6">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="font-mono text-xs text-slate-500 ml-2">fashilhack — engagement console</span>
              </div>
              {[
                { c: "#00aaff", t: "$ nmap -sV --script vuln target.corp" },
                { c: "#8fa8b8", t: "Starting Nmap scan..." },
                { c: "#00e5a0", t: "[FOUND] CVE-2024-3400 — Critical" },
                { c: "#8fa8b8", t: "Severity: 10.0 | CVSS: Remote Code Exec" },
                { c: "#00aaff", t: "$ python3 exploit.py --target 10.0.1.5" },
                { c: "#8fa8b8", t: "Establishing reverse shell..." },
                { c: "#00e5a0", t: "[SUCCESS] Shell obtained — reporting..." },
                { c: "#8fa8b8", t: "Finding logged to client portal ✓" },
              ].map((line, i) => (
                <div key={i} className="font-mono text-xs mb-2 leading-relaxed" style={{ color: line.c }}>
                  {line.t}
                </div>
              ))}
              <div className="font-mono text-xs mt-4 flex items-center gap-2" style={{ color: "#00aaff" }}>
                <span className="animate-pulse">█</span>
              </div>
            </div>
            {/* Glow */}
            <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(0,170,255,0.15), transparent 70%)" }} />
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="px-6 py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50 mb-6">
            <span className="font-sans text-xs font-bold text-slate-500 tracking-widest uppercase">Our Process</span>
          </div>
          <h2 className="font-heading font-black text-4xl md:text-5xl text-slate-900 tracking-tight mb-6">
            From Scoping to Secured
          </h2>
          <p className="font-sans text-lg text-slate-500 max-w-2xl mx-auto mb-20 leading-relaxed">
            A structured engagement model that keeps you informed at every stage of the lifecycle.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-px bg-slate-200" />

            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center relative">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 border-2 bg-white z-10"
                  style={{ borderColor: "#00aaff" }}>
                  <span className="font-heading font-black text-sm" style={{ color: "#00aaff" }}>{step.num}</span>
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 mb-3 tracking-tight">{step.title}</h3>
                <p className="font-sans text-xs text-slate-500 leading-relaxed max-w-[160px]">{step.desc}</p>
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
          <h2 className="font-heading font-black text-4xl md:text-6xl text-white tracking-tight mb-8 leading-tight">
            Ready to Know<br />Your Real Risk?
          </h2>
          <p className="font-sans text-lg mb-12 max-w-xl mx-auto leading-relaxed" style={{ color: "#8fa8b8" }}>
            Book a free 30-minute scoping call. Professional insights,
            clear recommendations, no high-pressure sales tactics.
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