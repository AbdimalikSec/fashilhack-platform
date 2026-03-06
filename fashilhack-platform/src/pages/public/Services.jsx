import PageLayout from "../../components/layout/PageLayout"
import SectionTag from "../../components/ui/SectionTag"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import { useNavigate } from "react-router-dom"

const SERVICES = [
  {
    icon: "🎯",
    title: "Penetration Testing",
    desc: "Full-scope authorized hacking across web, mobile, network, and cloud to expose real vulnerabilities before attackers do.",
    items: ["Black box / grey box / white box", "Internal & external scope", "Full kill chain simulation", "Post-exploitation analysis"],
  },
  {
    icon: "🌐",
    title: "Web Application Security",
    desc: "Deep manual testing of your web apps beyond automated scanners — covering logic flaws, auth issues, and injection vectors.",
    items: ["OWASP Top 10 coverage", "Business logic testing", "API security assessment", "Auth & session testing"],
  },
  {
    icon: "🔍",
    title: "Vulnerability Assessment",
    desc: "Systematic identification and prioritization of vulnerabilities across your entire attack surface.",
    items: ["Network scanning", "Service enumeration", "Risk-based prioritization", "Remediation roadmap"],
  },
  {
    icon: "🏢",
    title: "Social Engineering",
    desc: "Test your human firewall with realistic simulated attacks to measure employee security awareness.",
    items: ["Phishing campaigns", "Vishing (voice phishing)", "Pretexting scenarios", "Awareness training"],
  },
  {
    icon: "☁️",
    title: "Cloud Security Review",
    desc: "Audit your AWS, Azure, or GCP environment for misconfigurations, excessive permissions, and exposure.",
    items: ["IAM policy review", "Storage bucket audits", "Network security groups", "Compliance mapping"],
  },
  {
    icon: "📋",
    title: "Compliance & Reporting",
    desc: "All engagements include dual reports — deep technical findings for your IT team and executive summaries for leadership.",
    items: ["Technical report", "Executive summary", "CVSS scoring", "Remediation guidance"],
  },
]

export default function Services() {
  const navigate = useNavigate()

  return (
    <PageLayout>

      {/* ── HERO ── */}
      <section className="px-6 py-12 text-center bg-slate-50 flex flex-col items-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <SectionTag text="What We Offer" />
          <h1 className="font-heading font-bold text-4xl md:text-5xl mt-6 mb-6 text-primary tracking-tight leading-tight text-center">
            Our <span className="text-accent">Security</span> Services
          </h1>
          <p className="font-sans text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed text-center">
            Every engagement is scoped, authorized, and executed with
            absolute precision — from first contact to final delivery.
          </p>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="px-6 section-padding bg-white flex flex-col items-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICES.map(s => (
            <Card
              key={s.title}
              className="group !p-12 border-slate-100 flex flex-col items-center text-center"
            >
              <div className="text-6xl mb-8 grayscale group-hover:grayscale-0 transition-all duration-300">
                {s.icon}
              </div>
              <h3 className="font-heading font-bold text-2xl mb-4 text-primary tracking-tight">
                {s.title}
              </h3>
              <p className="font-sans text-base text-slate-500 leading-relaxed mb-8 max-w-sm">
                {s.desc}
              </p>
              <ul className="flex flex-col items-center gap-3">
                {s.items.map(item => (
                  <li
                    key={item}
                    className="
                      font-sans text-xs text-slate-600 font-semibold
                      flex items-center gap-2
                    "
                  >
                    <span className="text-accent text-[8px] bg-accent/10 w-5 h-5 flex items-center justify-center rounded-full">●</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="
        px-6 section-padding text-center
        bg-slate-50 border-t border-slate-100
        flex flex-col items-center
      ">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <SectionTag text="Get Started" />
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 mt-6 text-primary tracking-tight">
            Not Sure Where to Begin?
          </h2>
          <p className="font-sans text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Book a free scoping call and our specialists will help identify your critical surfaces.
            Professional security guidance for your unique infrastructure.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate("/contact")}>
            Book Free Consultation
          </Button>
        </div>
      </section>

    </PageLayout>
  )
}