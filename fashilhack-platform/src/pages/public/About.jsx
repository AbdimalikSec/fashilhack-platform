import { useNavigate } from "react-router-dom"
import PageLayout from "../../components/layout/PageLayout"
import { usePublicTheme } from "../../hooks/Usepublictheme"

const IconShield = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconEye    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconTrendingUp = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const IconHeart  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconArrowRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const IconCamera = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>

const TEAM = [
  { name: "Stager",     role: "CEO & Lead Pentester",        bio: "Founder of FashilHack. Offensive security specialist focused on adversarial simulation, red team operations, and building security programs from the ground up.", certs: ["PNPT","CC","Security+"], focus: "Red Teaming · AD Exploitation · PNPT" },
  { name: "Analyst #1", role: "Web Application Security",   bio: "Specializes in OWASP Top 10, business logic testing, API security assessments, and custom exploit development for web environments.", certs: ["OSCP"], focus: "Web Apps · API Security · Bug Bounty" },
  { name: "Analyst #2", role: "Network & Cloud Security",   bio: "Cloud infrastructure audits, network penetration testing, Active Directory assessments, and lateral movement analysis across enterprise environments.", certs: ["CEH"], focus: "Network · Cloud · Active Directory" },
]
const VALUES = [
  { icon: <IconShield />,      title: "Adversarial Mindset", desc: "We think and operate like real attackers — not checklist testers going through the motions." },
  { icon: <IconEye />,         title: "Full Transparency",   desc: "You see every finding as we discover it. Real-time visibility, not a surprise PDF at the end." },
  { icon: <IconTrendingUp />,  title: "Business Impact First", desc: "Every finding is tied to real business risk — not just a CVSS score without context." },
  { icon: <IconHeart />,       title: "Guided Remediation",  desc: "We don't just hand you a report. We guide you through fixing what we found, step by step." },
]
const MILESTONES = [
  { year: "2023", event: "FashilHack founded with a mission to bring enterprise-grade security to underserved markets." },
  { year: "2024", event: "First client engagements completed. PNPT and Security+ certifications achieved by core team." },
  { year: "2025", event: "Platform launched. Real-time client portal enabling live engagement visibility goes live." },
]

export default function About() {
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
          <Tag text="Who We Are" />
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2.5rem,6vw,4.5rem)", color: t.heading, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 32 }}>
            We Are the<br /><span style={{ color: "#00aaff" }}>Adversary You Hire.</span>
          </h1>
          <p style={{ fontFamily: "sans-serif", fontSize: 20, color: t.body, maxWidth: 640, lineHeight: 1.7, fontWeight: 500 }}>
            FashilHack is a cybersecurity firm specializing in adversarial simulation. We think, act, and operate like real-world attackers to uncover the gaps in your defenses — before someone else does.
          </p>
        </div>
      </section>

      {/* MISSION */}
      <section style={{ backgroundColor: t.sectionAlt, padding: "112px 24px", transition: "background-color 0.2s" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <Tag text="Our Mission" />
            <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,3vw,2.5rem)", color: t.heading, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 32 }}>Bridging Security<br />and Business Reality</h2>
            <p style={{ fontFamily: "sans-serif", fontSize: 15, color: t.body, lineHeight: 1.8, marginBottom: 24 }}>Most cybersecurity firms hand you a dense technical report and disappear. We do things differently — every engagement ends with a clear remediation path and a report that speaks two languages: technical and executive.</p>
            <p style={{ fontFamily: "sans-serif", fontSize: 15, color: t.body, lineHeight: 1.8 }}>We founded FashilHack because businesses deserve security partners who understand both the attack and the business impact behind it — and who stay accountable until it's fixed.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {MILESTONES.map((m, i) => (
              <div key={m.year} style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", border: `2px solid #00aaff`, backgroundColor: t.cardBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                    <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 10, color: "#00aaff" }}>{m.year.slice(2)}</span>
                  </div>
                  {i < MILESTONES.length - 1 && <div style={{ width: 1, height: 48, backgroundColor: t.timelineLine }} />}
                </div>
                <div style={{ paddingBottom: 40 }}>
                  <p style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{m.year}</p>
                  <p style={{ fontFamily: "sans-serif", fontSize: 14, color: t.body, lineHeight: 1.7 }}>{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section style={{ backgroundColor: t.pageBg, padding: "112px 24px", transition: "background-color 0.2s" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <Tag text="Our Values" />
            <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2rem,4vw,3rem)", color: t.heading, letterSpacing: "-0.03em" }}>Operational Principles</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
            {VALUES.map(v => (
              <div key={v.title} style={{ backgroundColor: t.sectionAlt, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: 32, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#00aaff"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,170,255,0.1)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.boxShadow = "none" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#00aaff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>{v.icon}</div>
                <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 15, color: t.heading, marginBottom: 12, letterSpacing: "-0.02em" }}>{v.title}</h3>
                <p style={{ fontFamily: "sans-serif", fontSize: 14, color: t.body, lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section style={{ backgroundColor: t.sectionAlt, padding: "112px 24px", transition: "background-color 0.2s" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <Tag text="The Team" />
            <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2rem,4vw,3rem)", color: t.heading, letterSpacing: "-0.03em" }}>The Experts Behind FashilHack</h2>
            <p style={{ fontFamily: "sans-serif", fontSize: 18, color: t.body, maxWidth: 480, margin: "24px auto 0", lineHeight: 1.7 }}>A specialized team of offensive security professionals with real-world attack experience.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 32 }}>
            {TEAM.map(member => (
              <div key={member.name} style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 24, overflow: "hidden", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#00aaff"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,170,255,0.1)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.boxShadow = "none" }}>
                <div style={{ height: 288, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: t.sectionAlt, flexDirection: "column", gap: 12, color: t.muted }}>
                  <IconCamera />
                  <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Photo Coming Soon</span>
                </div>
                <div style={{ padding: 32 }}>
                  <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 20, color: t.heading, letterSpacing: "-0.03em", marginBottom: 4 }}>{member.name}</h3>
                  <p style={{ fontFamily: "sans-serif", fontSize: 14, fontWeight: 700, color: "#00aaff", marginBottom: 16 }}>{member.role}</p>
                  <p style={{ fontFamily: "sans-serif", fontSize: 14, color: t.body, lineHeight: 1.7, marginBottom: 24 }}>{member.bio}</p>
                  <p style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Focus</p>
                  <p style={{ fontFamily: "sans-serif", fontSize: 12, color: t.body, fontWeight: 600, marginBottom: 24 }}>{member.focus}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {member.certs.map(c => (
                      <span key={c} style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, border: `1px solid ${t.certBorder}`, backgroundColor: t.certBg, color: t.certText }}>{c}</span>
                    ))}
                  </div>
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
            <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, color: "#00aaff", letterSpacing: "0.1em", textTransform: "uppercase" }}>Work With Us</span>
          </div>
          <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2rem,4vw,3rem)", color: "#fff", letterSpacing: "-0.03em", marginBottom: 32 }}>Ready to Work With Us?</h2>
          <p style={{ fontFamily: "sans-serif", fontSize: 18, color: "#8fa8b8", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.7 }}>Let's talk about securing your business with a professional, adversary-led approach tailored to your environment.</p>
          <button onClick={() => navigate("/contact")} style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, padding: "20px 40px", borderRadius: 8, color: "#fff", backgroundColor: "#00aaff", border: "none", cursor: "pointer", boxShadow: "0 0 40px rgba(0,170,255,0.3)", display: "inline-flex", alignItems: "center", gap: 12 }}>
            Get In Touch <IconArrowRight />
          </button>
        </div>
      </section>

    </PageLayout>
  )
}