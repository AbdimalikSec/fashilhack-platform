import PageLayout from "../../components/layout/PageLayout"
import SectionTag from "../../components/ui/SectionTag"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import { useNavigate } from "react-router-dom"

const TEAM = [
  {
    name: "Stager",
    role: "CEO & Lead Pentester",
    bio: "Founder of FashilHack. Offensive security specialist focused on adversarial simulation and red team operations.",
    badge: "PNPT | CC | Security+",
  },
  {
    name: "Analyst #1",
    role: "Web App Security",
    bio: "Specializes in OWASP Top 10, business logic testing, and API security assessments.",
    badge: "OSCP",
  },
  {
    name: "Analyst #2",
    role: "Network & Cloud",
    bio: "Cloud infrastructure audits, network penetration testing and Active Directory assessments.",
    badge: "CEH",
  },
]

const VALUES = [
  { icon: "🎯", title: "Adversarial Mindset", desc: "We think and operate like real attackers — not just checklist testers." },
  { icon: "🔒", title: "Full Transparency", desc: "You see every finding as we discover it, not just a final PDF weeks later." },
  { icon: "📊", title: "Business Impact First", desc: "Every finding is tied to real business risk, not just a CVSS number." },
  { icon: "🤝", title: "Guided Remediation", desc: "We don't just hand you a report — we help you fix what we found." },
]

export default function About() {
  const navigate = useNavigate()

  return (
    <PageLayout>

      {/* ── HERO ── */}
      <section className="px-6 py-12 text-center bg-slate-50 flex flex-col items-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <SectionTag text="Who We Are" />
          <h1 className="font-heading font-bold text-4xl md:text-5xl mt-6 mb-6 text-primary tracking-tight leading-tight">
            We Are the <span className="text-accent">Adversary</span> You Hire
          </h1>
          <p className="
            font-sans text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium
          ">
            FashilHack is a cybersecurity firm specializing in adversarial
            simulation. We think, act, and operate like real-world attackers
            to uncover the gaps in your defenses before someone else does.
          </p>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="bg-white px-6 section-padding">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="max-w-3xl flex flex-col items-center mb-20">
            <SectionTag text="Our Mission" />
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-8 text-primary mt-6 tracking-tight leading-tight">
              Bridging the Gap Between <span className="text-accent">Security</span> and Business
            </h2>
            <p className="font-sans text-base text-slate-600 leading-relaxed mb-6">
              Most cybersecurity firms hand you a dense technical report
              and disappear. We do things differently — every engagement
              ends with a clear remediation path and a report that speaks
              two languages: technical and executive.
            </p>
            <p className="font-sans text-base text-slate-600 leading-relaxed">
              We founded FashilHack because businesses deserve security
              partners that understand both the attack and the business
              impact behind it.
            </p>
          </div>

          <div className="w-full flex justify-center">
            <div className="w-full max-w-lg p-12 bg-slate-50 border border-slate-100 rounded-3xl text-center shadow-sm flex flex-col items-center">
              <div className="text-6xl mb-6 transform hover:scale-110 transition-transform">🛡️</div>
              <h3 className="font-heading font-bold text-2xl mb-4 text-primary tracking-tight">Enterprise Standard</h3>
              <p className="font-sans text-base text-slate-500 leading-relaxed max-w-sm">Built on fundamental transparency, operational depth, and measurable results.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="px-6 section-padding bg-slate-50 flex flex-col items-center">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <SectionTag text="Our Values" />
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-12 text-primary mt-6 tracking-tight">
            Operational Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map(v => (
              <Card key={v.title} className="text-center group !p-10 flex flex-col items-center">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{v.icon}</div>
                <h3 className="font-heading font-bold text-lg mb-3 text-primary tracking-tight">
                  {v.title}
                </h3>
                <p className="font-sans text-sm text-slate-500 leading-relaxed">
                  {v.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="bg-white px-6 section-padding flex flex-col items-center">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <SectionTag text="The Team" />
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-16 text-primary mt-6 tracking-tight">
            The Experts Behind FashilHack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map(member => (
              <Card key={member.name} className="text-center !p-12 flex flex-col items-center">
                <div className="
                  w-20 h-20 rounded-full flex items-center justify-center mb-8
                  bg-slate-50 border border-slate-100
                  font-heading font-bold text-primary text-3xl shadow-sm
                ">
                  {member.name[0]}
                </div>
                <h3 className="font-heading font-bold text-xl tracking-tight mb-2 text-primary">
                  {member.name}
                </h3>
                <p className="font-sans text-sm text-accent font-bold mb-4">
                  {member.role}
                </p>
                <p className="font-sans text-sm text-slate-500 leading-relaxed mb-8 max-w-[240px]">
                  {member.bio}
                </p>
                <div className="
                  font-sans text-[10px] font-bold text-slate-400
                  bg-slate-50 px-4 py-2 rounded-full inline-block border border-slate-100
                ">
                  {member.badge}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-16 text-center bg-primary text-white flex flex-col items-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-8 tracking-tight">
            Ready to Work With Us?
          </h2>
          <p className="font-sans text-lg text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Let's talk about securing your business with a professional,
            adversary-led approach tailored to your environment.
          </p>
          <Button
            variant="ghost"
            size="lg"
            className="!border-white !text-white hover:!bg-white hover:!text-primary"
            onClick={() => navigate("/contact")}
          >
            Get In Touch
          </Button>
        </div>
      </section>

    </PageLayout>
  )
}