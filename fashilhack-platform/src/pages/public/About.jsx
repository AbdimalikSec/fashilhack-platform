import { useNavigate } from "react-router-dom"
import PageLayout from "../../components/layout/PageLayout"

// ── Icons ──
const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const IconEye = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
)
const IconTrendingUp = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
)
const IconHeart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)
const IconLinkedin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
)
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const IconCamera = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

const TEAM = [
  {
    name:   "Stager",
    role:   "CEO & Lead Pentester",
    bio:    "Founder of FashilHack. Offensive security specialist focused on adversarial simulation, red team operations, and building security programs from the ground up.",
    certs:  ["PNPT", "CC", "Security+"],
    focus:  "Red Teaming · AD Exploitation · PNPT",
  },
  {
    name:   "Analyst #1",
    role:   "Web Application Security",
    bio:    "Specializes in OWASP Top 10, business logic testing, API security assessments, and custom exploit development for web environments.",
    certs:  ["OSCP"],
    focus:  "Web Apps · API Security · Bug Bounty",
  },
  {
    name:   "Analyst #2",
    role:   "Network & Cloud Security",
    bio:    "Cloud infrastructure audits, network penetration testing, Active Directory assessments, and lateral movement analysis across enterprise environments.",
    certs:  ["CEH"],
    focus:  "Network · Cloud · Active Directory",
  },
]

const VALUES = [
  {
    icon:  <IconShield />,
    title: "Adversarial Mindset",
    desc:  "We think and operate like real attackers — not checklist testers going through the motions.",
  },
  {
    icon:  <IconEye />,
    title: "Full Transparency",
    desc:  "You see every finding as we discover it. Real-time visibility, not a surprise PDF at the end.",
  },
  {
    icon:  <IconTrendingUp />,
    title: "Business Impact First",
    desc:  "Every finding is tied to real business risk — not just a CVSS score without context.",
  },
  {
    icon:  <IconHeart />,
    title: "Guided Remediation",
    desc:  "We don't just hand you a report. We guide you through fixing what we found, step by step.",
  },
]

const MILESTONES = [
  { year: "2023", event: "FashilHack founded with a mission to bring enterprise-grade security to underserved markets." },
  { year: "2024", event: "First client engagements completed. PNPT and Security+ certifications achieved by core team." },
  { year: "2025", event: "Platform launched. Real-time client portal enabling live engagement visibility goes live." },
]

export default function About() {
  const navigate = useNavigate()

  return (
    <PageLayout>

      {/* ── HERO ── */}
      <section className="relative px-6 py-32 bg-white overflow-hidden">
        {/* Background grid */}
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
            <span className="font-sans text-xs font-bold text-slate-500 tracking-widest uppercase">Who We Are</span>
          </div>
          <h1 className="font-heading font-black text-5xl md:text-7xl text-slate-900 tracking-tight leading-tight mb-8">
            We Are the<br />
            <span style={{ color: "#00aaff" }}>Adversary You Hire.</span>
          </h1>
          <p className="font-sans text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
            FashilHack is a cybersecurity firm specializing in adversarial simulation.
            We think, act, and operate like real-world attackers to uncover the gaps
            in your defenses — before someone else does.
          </p>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="px-6 py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50 mb-6">
              <span className="font-sans text-xs font-bold text-slate-500 tracking-widest uppercase">Our Mission</span>
            </div>
            <h2 className="font-heading font-black text-4xl text-slate-900 tracking-tight leading-tight mb-8">
              Bridging Security<br />and Business Reality
            </h2>
            <p className="font-sans text-base text-slate-600 leading-relaxed mb-6">
              Most cybersecurity firms hand you a dense technical report
              and disappear. We do things differently — every engagement
              ends with a clear remediation path and a report that speaks
              two languages: technical and executive.
            </p>
            <p className="font-sans text-base text-slate-600 leading-relaxed">
              We founded FashilHack because businesses deserve security
              partners who understand both the attack and the business
              impact behind it — and who stay accountable until it's fixed.
            </p>
          </div>

          {/* Timeline */}
          <div className="flex flex-col gap-0">
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="flex gap-8 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-white z-10"
                    style={{ borderColor: "#00aaff" }}>
                    <span className="font-heading font-black text-[10px]" style={{ color: "#00aaff" }}>
                      {m.year.slice(2)}
                    </span>
                  </div>
                  {i < MILESTONES.length - 1 && (
                    <div className="w-px flex-1 mt-0 mb-0" style={{ height: "48px", backgroundColor: "#e2e8f0" }} />
                  )}
                </div>
                <div className="pb-10">
                  <p className="font-sans text-xs font-black text-slate-400 tracking-widest uppercase mb-2">{m.year}</p>
                  <p className="font-sans text-sm text-slate-600 leading-relaxed">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50 mb-6">
              <span className="font-sans text-xs font-bold text-slate-500 tracking-widest uppercase">Our Values</span>
            </div>
            <h2 className="font-heading font-black text-4xl md:text-5xl text-slate-900 tracking-tight">
              Operational Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(v => (
              <div key={v.title}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-8 hover:border-blue-100 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-6 text-white transition-all duration-300"
                  style={{ backgroundColor: "#00aaff" }}>
                  {v.icon}
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 mb-3 tracking-tight">
                  {v.title}
                </h3>
                <p className="font-sans text-sm text-slate-500 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="px-6 py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50 mb-6">
              <span className="font-sans text-xs font-bold text-slate-500 tracking-widest uppercase">The Team</span>
            </div>
            <h2 className="font-heading font-black text-4xl md:text-5xl text-slate-900 tracking-tight">
              The Experts Behind FashilHack
            </h2>
            <p className="font-sans text-lg text-slate-500 max-w-xl mx-auto mt-6 leading-relaxed">
              A specialized team of offensive security professionals
              with real-world attack experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map(member => (
              <div key={member.name}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all duration-300 group"
              >
                {/* Photo placeholder */}
                <div className="relative h-72 flex items-center justify-center"
                  style={{ backgroundColor: "#f1f5f9" }}>
                  {/* Replace this div content with <img> when you have real photos */}
                  <div className="flex flex-col items-center gap-3 text-slate-300">
                    <IconCamera />
                    <span className="font-sans text-xs font-bold tracking-widest uppercase">
                      Photo Coming Soon
                    </span>
                  </div>
                  {/* Accent bar at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: "#00aaff" }} />
                </div>

                {/* Info */}
                <div className="p-8">
                  <h3 className="font-heading font-black text-xl text-slate-900 tracking-tight mb-1">
                    {member.name}
                  </h3>
                  <p className="font-sans text-sm font-bold mb-4" style={{ color: "#00aaff" }}>
                    {member.role}
                  </p>
                  <p className="font-sans text-sm text-slate-500 leading-relaxed mb-6">
                    {member.bio}
                  </p>

                  {/* Focus area */}
                  <p className="font-sans text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3">
                    Focus
                  </p>
                  <p className="font-sans text-xs text-slate-600 font-semibold mb-6">
                    {member.focus}
                  </p>

                  {/* Certs */}
                  <div className="flex flex-wrap gap-2">
                    {member.certs.map(c => (
                      <span key={c} className="font-sans text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full border text-slate-500"
                        style={{ borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Photo replacement instruction */}
          <div className="mt-10 text-center">
            <p className="font-sans text-xs text-slate-400">
              To add real photos — replace the placeholder div in each team card with:{" "}
              <code className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
                &lt;img src="your-photo.jpg" className="w-full h-full object-cover" /&gt;
              </code>
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-28 text-center" style={{ backgroundColor: "#0a1628" }}>
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
            style={{ borderColor: "rgba(0,170,255,0.3)", backgroundColor: "rgba(0,170,255,0.08)" }}>
            <span className="font-sans text-xs font-bold tracking-widest uppercase" style={{ color: "#00aaff" }}>
              Work With Us
            </span>
          </div>
          <h2 className="font-heading font-black text-4xl md:text-5xl text-white tracking-tight mb-8 leading-tight">
            Ready to Work With Us?
          </h2>
          <p className="font-sans text-lg mb-12 max-w-xl mx-auto leading-relaxed" style={{ color: "#8fa8b8" }}>
            Let's talk about securing your business with a professional,
            adversary-led approach tailored to your environment.
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="font-sans font-bold text-sm px-10 py-5 rounded-lg text-white inline-flex items-center gap-3 transition-all hover:opacity-90"
            style={{ backgroundColor: "#00aaff", boxShadow: "0 0 40px rgba(0,170,255,0.3)" }}
          >
            Get In Touch <IconArrowRight />
          </button>
        </div>
      </section>

    </PageLayout>
  )
}