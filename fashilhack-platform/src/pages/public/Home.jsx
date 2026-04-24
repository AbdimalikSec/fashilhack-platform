import { useNavigate } from "react-router-dom"
import PageLayout from "../../components/layout/PageLayout"
import { usePublicTheme } from "../../hooks/Usepublictheme"

const IconShield = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconTarget = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const IconGlobe  = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const IconSearch = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconUsers  = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconFileText = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
const IconCloud  = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
const IconArrowRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>

const SERVICES = [
  { icon: <IconTarget />,   title: "Penetration Testing",       desc: "Full-scope ethical hacking across web, mobile, network, and cloud to expose real attack paths." },
  { icon: <IconGlobe />,    title: "Web App Security",          desc: "OWASP Top 10, business logic flaws, auth bypass, and injection testing on your applications." },
  { icon: <IconSearch />,   title: "Vulnerability Assessment",  desc: "Systematic identification and risk-based prioritization of your entire attack surface." },
  { icon: <IconUsers />,    title: "Social Engineering",        desc: "Phishing simulations and pretexting scenarios to measure your human firewall's resilience." },
  { icon: <IconCloud />,    title: "Cloud Security Review",     desc: "AWS, Azure, and GCP configuration audits to eliminate misconfigurations and privilege escalation." },
  { icon: <IconFileText />, title: "Compliance & Reporting",    desc: "Dual-audience reports — technical depth for IT, plain-language summaries for executives." },
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
  const t = usePublicTheme()

  return (
    <PageLayout>

      {/* HERO */}
      <section style={{ backgroundColor: t.pageBg, position: "relative", minHeight: "88vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px", overflow: "hidden", transition: "background-color 0.2s" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(${t.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${t.gridLine} 1px, transparent 1px)`, backgroundSize: "48px 48px", opacity: t.dark ? 1 : 0.6 }} />
        <div style={{ position: "absolute", top: "33%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,170,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, border: `1px solid ${t.tagBorder}`, backgroundColor: t.tagBg, marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#00aaff" }} />
            <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, color: t.tagText, letterSpacing: "0.1em", textTransform: "uppercase" }}>Advanced Cybersecurity Solutions</span>
          </div>
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.05, letterSpacing: "-0.03em", color: t.heading, marginBottom: 32 }}>
            Simulating Attacks,<br /><span style={{ color: "#00aaff" }}>Securing Businesses.</span>
          </h1>
          <p style={{ fontFamily: "sans-serif", fontSize: 20, color: t.body, maxWidth: 640, marginBottom: 48, lineHeight: 1.7, fontWeight: 500 }}>
            We think like attackers so your business stays defended. Professional-grade penetration testing and vulnerability management for organizations that can't afford to be breached.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => navigate("/contact")} style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, padding: "16px 32px", borderRadius: 8, color: "#fff", backgroundColor: "#00aaff", border: "none", cursor: "pointer", boxShadow: "0 8px 32px rgba(0,170,255,0.25)", display: "flex", alignItems: "center", gap: 8 }}>
              Request Consultation <IconArrowRight />
            </button>
            <button onClick={() => navigate("/services")} style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, padding: "16px 32px", borderRadius: 8, color: t.heading, backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, cursor: "pointer" }}>
              Our Services
            </button>
          </div>
        
        </div>
      </section>

      {/* STATS */}
      <section style={{ borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}`, backgroundColor: t.pageBg, transition: "background-color 0.2s" }}>
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ padding: "56px 0", textAlign: "center", borderRight: i < 3 ? `1px solid ${t.border}` : "none" }}>
              <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 48, marginBottom: 8, color: t.heading }}>{s.num}</div>
              <div style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: t.muted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: "112px 24px", backgroundColor: t.sectionAlt, transition: "background-color 0.2s" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, border: `1px solid ${t.tagBorder}`, backgroundColor: t.tagBg, marginBottom: 24 }}>
              <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, color: t.tagText, letterSpacing: "0.1em", textTransform: "uppercase" }}>What We Do</span>
            </div>
            <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2rem,4vw,3rem)", color: t.heading, letterSpacing: "-0.03em" }}>Our Security Services</h2>
            <p style={{ fontFamily: "sans-serif", fontSize: 18, color: t.body, maxWidth: 640, margin: "24px auto 0", lineHeight: 1.7 }}>From reconnaissance to remediation, every attack surface covered.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(s => (
              <div key={s.title} style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: 32, transition: "all 0.2s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#00aaff"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,170,255,0.1)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.boxShadow = "none" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: t.iconBg, color: t.iconColor, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#00aaff"; e.currentTarget.style.color = "#fff" }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = t.iconBg; e.currentTarget.style.color = t.iconColor }}>
                  {s.icon}
                </div>
                <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 18, color: t.heading, marginBottom: 12, letterSpacing: "-0.02em" }}>{s.title}</h3>
                <p style={{ fontFamily: "sans-serif", fontSize: 14, color: t.body, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY FASHILHACK */}
      <section style={{ padding: "112px 24px", backgroundColor: t.pageBg, transition: "background-color 0.2s" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center" style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, border: `1px solid ${t.tagBorder}`, backgroundColor: t.tagBg, marginBottom: 24 }}>
              <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, color: t.tagText, letterSpacing: "0.1em", textTransform: "uppercase" }}>Why FashilHack</span>
            </div>
            <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2rem,4vw,3rem)", color: t.heading, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 32 }}>Security That Goes Beyond the Report</h2>
            <p style={{ fontFamily: "sans-serif", fontSize: 15, color: t.body, lineHeight: 1.8, marginBottom: 40 }}>Most firms hand you a PDF and disappear. We stay with you through discovery, remediation, and verification — because finding the vulnerability is only half the job.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {WHY.map(w => (
                <div key={w} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: "#00aaff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2, color: "#fff" }}><IconCheck /></span>
                  <span style={{ fontFamily: "sans-serif", fontSize: 14, fontWeight: 600, color: t.body, lineHeight: 1.6 }}>{w}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/about")} style={{ marginTop: 40, fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, color: "#00aaff", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              Learn about our team <IconArrowRight />
            </button>
          </div>
          {/* Terminal */}
          <div style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${t.cardBorder}`, boxShadow: "0 32px 80px rgba(0,0,0,0.3)", backgroundColor: "#0d1117", padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#f87171" }} />
              <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#fbbf24" }} />
              <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#34d399" }} />
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b", marginLeft: 8 }}>fashilhack — engagement console</span>
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
              <div key={i} style={{ fontFamily: "monospace", fontSize: 12, marginBottom: 8, lineHeight: 1.6, color: line.c }}>{line.t}</div>
            ))}
            <div style={{ fontFamily: "monospace", fontSize: 12, marginTop: 16, color: "#00aaff" }}>█</div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section style={{ padding: "112px 24px", backgroundColor: t.sectionAlt, textAlign: "center", transition: "background-color 0.2s" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, border: `1px solid ${t.tagBorder}`, backgroundColor: t.tagBg, marginBottom: 24 }}>
            <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, color: t.tagText, letterSpacing: "0.1em", textTransform: "uppercase" }}>Our Process</span>
          </div>
          <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2rem,4vw,3rem)", color: t.heading, letterSpacing: "-0.03em", marginBottom: 24 }}>From Scoping to Secured</h2>
          <p style={{ fontFamily: "sans-serif", fontSize: 18, color: t.body, maxWidth: 640, margin: "0 auto 80px", lineHeight: 1.7 }}>A structured engagement model that keeps you informed at every stage.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8" style={{ position: "relative" }}>
            <div className="hidden lg:block" style={{ position: "absolute", top: 28, left: "10%", right: "10%", height: 1, backgroundColor: t.timelineLine }} />
            {STEPS.map(step => (
              <div key={step.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid #00aaff`, backgroundColor: t.cardBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, zIndex: 1 }}>
                  <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 13, color: "#00aaff" }}>{step.num}</span>
                </div>
                <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 15, color: t.heading, marginBottom: 12, letterSpacing: "-0.02em" }}>{step.title}</h3>
                <p style={{ fontFamily: "sans-serif", fontSize: 12, color: t.body, lineHeight: 1.7, maxWidth: 160 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — always dark */}
      <section style={{ padding: "112px 24px", backgroundColor: "#0a1628", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, border: "1px solid rgba(0,170,255,0.3)", backgroundColor: "rgba(0,170,255,0.08)", marginBottom: 32 }}>
            <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, color: "#00aaff", letterSpacing: "0.1em", textTransform: "uppercase" }}>Get Started</span>
          </div>
          <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2rem,5vw,3.5rem)", color: "#fff", letterSpacing: "-0.03em", marginBottom: 32, lineHeight: 1.1 }}>Ready to Know<br />Your Real Risk?</h2>
          <p style={{ fontFamily: "sans-serif", fontSize: 18, color: "#8fa8b8", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.7 }}>Book a free 30-minute scoping call. Professional insights, clear recommendations, no high-pressure sales tactics.</p>
          <button onClick={() => navigate("/contact")} style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, padding: "20px 40px", borderRadius: 8, color: "#fff", backgroundColor: "#00aaff", border: "none", cursor: "pointer", boxShadow: "0 0 40px rgba(0,170,255,0.3)", display: "inline-flex", alignItems: "center", gap: 12 }}>
            Book Free Consultation <IconArrowRight />
          </button>
        </div>
      </section>

    </PageLayout>
  )
}