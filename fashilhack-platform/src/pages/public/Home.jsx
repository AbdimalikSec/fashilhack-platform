import { useNavigate } from "react-router-dom"
import PageLayout from "../../components/layout/PageLayout"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import SectionTag from "../../components/ui/SectionTag"

const SERVICES = [
  {
    icon: "🎯",
    title: "Penetration Testing",
    desc: "Full-scope ethical hacking — web, mobile, network, and cloud — to expose weaknesses before real attackers do.",
  },
  {
    icon: "🌐",
    title: "Web App Security",
    desc: "OWASP Top 10 testing, business logic flaws, auth bypass, and injection attacks on your web applications.",
  },
  {
    icon: "🔍",
    title: "Vulnerability Assessment",
    desc: "Automated and manual scanning to build a prioritized risk map of your entire attack surface.",
  },
  {
    icon: "🏢",
    title: "Social Engineering",
    desc: "Phishing simulations, vishing, and physical tests to measure your human firewall's resilience.",
  },
  {
    icon: "☁️",
    title: "Cloud Security Review",
    desc: "AWS, Azure, and GCP configuration audits to eliminate misconfigurations and privilege escalation paths.",
  },
  {
    icon: "📋",
    title: "Compliance & Reporting",
    desc: "Clear dual-audience reports — technical depth for your IT team, plain-language summaries for executives.",
  },
]

const STATS = [
  { num: "200+", label: "Vulnerabilities Found" },
  { num: "50+", label: "Clients Secured" },
  { num: "98%", label: "Client Satisfaction" },
  { num: "24/7", label: "Threat Monitoring" },
]

const STEPS = [
  { num: "01", title: "Discovery", desc: "Define scope, goals, rules of engagement and threat model." },
  { num: "02", title: "Recon", desc: "OSINT, surface mapping and passive enumeration of your assets." },
  { num: "03", title: "Exploitation", desc: "Controlled authorized attack simulation to validate real-world impact." },
  { num: "04", title: "Reporting", desc: "Dual-section report: technical for IT, plain summary for leadership." },
  { num: "05", title: "Remediation", desc: "Guided fixes, retesting and a clean bill of security health." },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <PageLayout>

      {/* ── HERO ── */}
      <section className="
        relative min-h-[70vh] flex flex-col
        items-center justify-center text-center
        px-6 py-16 bg-slate-50
      ">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <SectionTag text="Advanced Cybersecurity Solutions" />

          {/* Headline */}
          <h1 className="
            font-heading font-bold
            text-4xl md:text-6xl
            leading-tight mb-8 text-primary tracking-tight mt-6
          ">
            Simulating Attacks,<br />
            <span className="text-accent">Securing Businesses.</span>
          </h1>

          <p className="
            font-sans text-lg text-slate-500
            max-w-2xl mx-auto mb-10 leading-relaxed font-medium
          ">
            We think like attackers so your business stays defended.
            Professional-grade penetration testing and vulnerability management.
          </p>

          <div className="flex gap-4 flex-wrap justify-center items-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/contact")}
            >
              Request Consultation
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate("/services")}
            >
              Our Services
            </Button>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 items-center">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`
                py-12 text-center flex flex-col items-center justify-center
                ${i < 3 ? "md:border-r border-slate-100" : ""}
              `}
            >
              <div className="
                font-heading font-bold text-4xl
                text-primary mb-2
              ">
                {s.num}
              </div>
              <div className="
                font-sans text-[10px] font-bold tracking-widest uppercase
                text-slate-400
              ">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="px-6 section-padding bg-slate-50 flex flex-col items-center">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <SectionTag text="What We Do" />
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 text-primary mt-6 tracking-tight">
            Our Security Services
          </h2>
          <p className="font-sans text-base text-slate-500 max-w-2xl mx-auto mb-16 leading-relaxed">
            From reconnaissance to remediation, we cover every attack
            surface so threats don't catch you off guard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map(s => (
              <Card
                key={s.title}
                className="text-center group !p-10 flex flex-col items-center"
              >
                <div className="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-300">
                  {s.icon}
                </div>
                <h3 className="font-heading font-bold text-xl mb-4 text-primary tracking-tight">
                  {s.title}
                </h3>
                <p className="font-sans text-sm text-slate-500 leading-relaxed">
                  {s.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="bg-white px-6 section-padding flex flex-col items-center">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <SectionTag text="Our Process" />
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 text-primary mt-6 tracking-tight">
            From Scoping to Secured
          </h2>
          <p className="font-sans text-base text-slate-500 max-w-2xl mx-auto mb-20 leading-relaxed">
            A structured engagement model that keeps you informed at every stage of the lifecycle.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            {STEPS.map((step) => (
              <div key={step.num} className="text-center flex flex-col items-center relative">
                <div className="
                  w-14 h-14 rounded-full flex items-center justify-center mb-6
                  bg-slate-50 border-2 border-slate-100
                  font-heading font-bold text-sm
                  text-accent shadow-sm
                ">
                  {step.num}
                </div>
                <h3 className="font-heading font-bold text-base mb-3 text-primary tracking-tight">
                  {step.title}
                </h3>
                <p className="font-sans text-xs text-slate-500 leading-relaxed max-w-[180px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="
        px-6 py-16 text-center flex flex-col items-center
        bg-primary text-white
      ">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <SectionTag text="Get Started" />
          <h2 className="font-heading font-bold text-3xl md:text-4xl mt-8 mb-6 tracking-tight">
            Ready to Know Your Real Risk?
          </h2>
          <p className="font-sans text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Book a free 30-minute scoping call. Professional insights,
            clear recommendations, and no high-pressure sales tactics.
          </p>
          <Button
            variant="ghost"
            size="lg"
            className="!border-white !text-white hover:!bg-white hover:!text-primary"
            onClick={() => navigate("/contact")}
          >
            Book Free Consultation
          </Button>
        </div>
      </section>

    </PageLayout>
  )
}