import { useNavigate } from "react-router-dom"
import PageLayout from "../../components/layout/PageLayout"
import { usePublicTheme } from "../../hooks/Usepublictheme"

const IconTarget   = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const IconGlobe    = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const IconSearch   = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconUsers    = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconCloud    = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
const IconFileText = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
const IconCheck    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconArrowRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>

const SERVICES = [
  { icon: <IconTarget />,   title: "Penetration Testing",      desc: "Full-scope authorized hacking across web, mobile, network, and cloud to expose real vulnerabilities and complete attack chains.", items: ["Black box / grey box / white box","Internal & external scope","Full kill chain simulation","Post-exploitation analysis"] },
  { icon: <IconGlobe />,    title: "Web Application Security", desc: "Deep manual testing of your web apps beyond automated scanners — covering logic flaws, auth issues, and injection vectors.", items: ["OWASP Top 10 coverage","Business logic testing","API security assessment","Auth & session testing"] },
  { icon: <IconSearch />,   title: "Vulnerability Assessment", desc: "Systematic identification and prioritization of vulnerabilities across your entire attack surface.", items: ["Network scanning","Service enumeration","Risk-based prioritization","Remediation roadmap"] },
  { icon: <IconUsers />,    title: "Social Engineering",       desc: "Test your human firewall with realistic simulated attacks to measure employee security awareness.", items: ["Phishing campaigns","Vishing (voice phishing)","Pretexting scenarios","Awareness training"] },
  { icon: <IconCloud />,    title: "Cloud Security Review",    desc: "Audit your AWS, Azure, or GCP environment for misconfigurations, excessive permissions, and lateral movement paths.", items: ["IAM policy review","Storage bucket audits","Network security groups","Compliance mapping"] },
  { icon: <IconFileText />, title: "Compliance & Reporting",   desc: "All engagements include dual reports — full technical findings for your IT team and an executive summary for leadership.", items: ["Technical report","Executive summary","CVSS scoring","Remediation guidance"] },
]
const PROCESS = [
  { num: "01", title: "Scoping Call",  desc: "Free consultation to define your objectives, environment, and rules of engagement." },
  { num: "02", title: "Agreement",     desc: "Formal NDA and scope document signed. Legal authorization established before any testing begins." },
  { num: "03", title: "Engagement",    desc: "Active testing phase with real-time finding visibility in your client portal as we work." },
  { num: "04", title: "Report",        desc: "Dual-format report delivered — technical depth and executive summary both included." },
  { num: "05", title: "Remediation",   desc: "We guide your team through fixes, answer questions, and retest to verify resolution." },
]

export default function Services() {
  const navigate = useNavigate()
  const t = usePublicTheme()

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
          <Tag text="What We Offer" />
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2.5rem,6vw,4.5rem)", color: t.heading, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 32 }}>
            Our Security<br /><span style={{ color: "#00aaff" }}>Services.</span>
          </h1>
          <p style={{ fontFamily: "sans-serif", fontSize: 20, color: t.body, maxWidth: 640, lineHeight: 1.7, fontWeight: 500 }}>Every engagement is scoped, authorized, and executed with precision — from first contact to final delivery and remediation.</p>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section style={{ backgroundColor: t.sectionAlt, padding: "112px 24px", transition: "background-color 0.2s" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {SERVICES.map(s => (
              <div key={s.title} style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 24, padding: 40, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#00aaff"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,170,255,0.1)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.boxShadow = "none" }}>
                <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#00aaff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 20, color: t.heading, marginBottom: 12, letterSpacing: "-0.03em" }}>{s.title}</h3>
                    <p style={{ fontFamily: "sans-serif", fontSize: 14, color: t.body, lineHeight: 1.7, marginBottom: 24 }}>{s.desc}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {s.items.map(item => (
                        <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "rgba(0,170,255,0.15)", color: "#00aaff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><IconCheck /></span>
                          <span style={{ fontFamily: "sans-serif", fontSize: 12, color: t.body, fontWeight: 600 }}>{item}</span>
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

      {/* PROCESS */}
      <section style={{ backgroundColor: t.pageBg, padding: "112px 24px", transition: "background-color 0.2s" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <Tag text="How It Works" />
            <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2rem,4vw,3rem)", color: t.heading, letterSpacing: "-0.03em" }}>Engagement Process</h2>
            <p style={{ fontFamily: "sans-serif", fontSize: 18, color: t.body, maxWidth: 480, margin: "24px auto 0", lineHeight: 1.7 }}>A structured process that keeps you informed and in control at every stage.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 720, margin: "0 auto" }}>
            {PROCESS.map((p, i) => (
              <div key={p.num} style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid #00aaff`, backgroundColor: t.cardBg, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                    <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 12, color: "#00aaff" }}>{p.num}</span>
                  </div>
                  {i < PROCESS.length - 1 && <div style={{ width: 1, height: 56, backgroundColor: t.timelineLine }} />}
                </div>
                <div style={{ paddingBottom: 48, paddingTop: 8 }}>
                  <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 18, color: t.heading, marginBottom: 8, letterSpacing: "-0.02em" }}>{p.title}</h3>
                  <p style={{ fontFamily: "sans-serif", fontSize: 14, color: t.body, lineHeight: 1.7, maxWidth: 480 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "112px 24px", backgroundColor: "#0a1628", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, border: "1px solid rgba(0,170,255,0.3)", backgroundColor: "rgba(0,170,255,0.08)", marginBottom: 32 }}>
            <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, color: "#00aaff", letterSpacing: "0.1em", textTransform: "uppercase" }}>Get Started</span>
          </div>
          <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2rem,4vw,3rem)", color: "#fff", letterSpacing: "-0.03em", marginBottom: 32 }}>Not Sure Where to Begin?</h2>
          <p style={{ fontFamily: "sans-serif", fontSize: 18, color: "#8fa8b8", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.7 }}>Book a free scoping call. Our specialists will identify your critical surfaces and recommend the right engagement type.</p>
          <button onClick={() => navigate("/contact")} style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, padding: "20px 40px", borderRadius: 8, color: "#fff", backgroundColor: "#00aaff", border: "none", cursor: "pointer", boxShadow: "0 0 40px rgba(0,170,255,0.3)", display: "inline-flex", alignItems: "center", gap: 12 }}>
            Book Free Consultation <IconArrowRight />
          </button>
        </div>
      </section>

    </PageLayout>
  )
}