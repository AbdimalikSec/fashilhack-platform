import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../../config/firebase"
import { useNavigate } from "react-router-dom"
import PageLayout from "../../components/layout/PageLayout"
import { usePublicTheme } from "../../hooks/Usepublictheme"

const IconBook    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const IconUsers   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconLayers  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
const IconArrow   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const IconSearch  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>

const LEVELS      = ["All", "Beginner", "Intermediate", "Advanced"]
const CATEGORIES  = ["All", "Course", "Cert Notes", "Study Guide", "Attack Reference", "Tool Guide", "Project", "Other"]

const levelColor = (level) => {
  if (level === "Beginner")     return { bg: "rgba(34,197,94,0.12)",  text: "#22c55e" }
  if (level === "Intermediate") return { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" }
  if (level === "Advanced")     return { bg: "rgba(239,68,68,0.12)",  text: "#ef4444" }
  return { bg: "rgba(0,170,255,0.12)", text: "#00aaff" }
}

export default function Courses() {
  const t        = usePublicTheme()
  const navigate = useNavigate()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [level,    setLevel]    = useState("All")
  const [category, setCategory] = useState("All")
  const [search,  setSearch]  = useState("")

  useEffect(() => {
    getDocs(query(collection(db, "courses"), where("published", "==", true)))
      .then(snap => {
        const data = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
        setCourses(data)
      })
      .catch(e => console.warn(e))
      .finally(() => setLoading(false))
  }, [])

  const filtered = courses
    .filter(c => level === "All" || c.level === level)
    .filter(c => category === "All" || c.category === category)
    .filter(c => !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()))

  return (
    <PageLayout>

      {/* HERO */}
      <section style={{ backgroundColor: t.pageBg, padding: "100px 24px 64px", position: "relative", overflow: "hidden", transition: "background-color 0.2s" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(${t.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${t.gridLine} 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />
        <div style={{ position: "relative", maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, border: `1px solid ${t.tagBorder}`, backgroundColor: t.tagBg, marginBottom: 24 }}>
            <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, color: t.tagText, letterSpacing: "0.1em", textTransform: "uppercase" }}>FashilHack Knowledge</span>
          </div>
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2rem,5vw,3.5rem)", color: t.heading, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
            Cybersecurity Knowledge<br /><span style={{ color: "#00aaff" }}>Built by Practitioners.</span>
          </h1>
          <p style={{ fontFamily: "sans-serif", fontSize: 18, color: t.body, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Courses, cert notes, study guides, attack references, and more — real knowledge from people who work in security every day.
          </p>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 480, margin: "0 auto", backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: "10px 16px" }}>
            <span style={{ color: t.muted }}><IconSearch /></span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search courses..."
              style={{ flex: 1, backgroundColor: "transparent", border: "none", outline: "none", fontFamily: "sans-serif", fontSize: 14, color: t.heading }} />
          </div>
        </div>
      </section>

      {/* FILTERS + GRID */}
      <section style={{ backgroundColor: t.sectionAlt, padding: "48px 24px 80px", transition: "background-color 0.2s" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          {/* Filters */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 800, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", width: 60 }}>Type:</span>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 999, border: `1px solid ${category === c ? "#00aaff" : t.cardBorder}`, backgroundColor: category === c ? "#00aaff" : "transparent", color: category === c ? "#fff" : t.body, cursor: "pointer", transition: "all 0.15s" }}>
                  {c}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 800, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", width: 60 }}>Level:</span>
              {LEVELS.map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 999, border: `1px solid ${level === l ? "#00aaff" : t.cardBorder}`, backgroundColor: level === l ? "#00aaff" : "transparent", color: level === l ? "#fff" : t.body, cursor: "pointer", transition: "all 0.15s" }}>
                  {l}
                </button>
              ))}
              <span style={{ marginLeft: "auto", fontFamily: "sans-serif", fontSize: 12, color: t.muted }}>{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ backgroundColor: t.cardBg, borderRadius: 20, overflow: "hidden", border: `1px solid ${t.cardBorder}` }}>
                  <div style={{ height: 180, backgroundColor: t.sectionAlt }} />
                  <div style={{ padding: 24 }}>
                    <div style={{ height: 12, backgroundColor: t.sectionAlt, borderRadius: 6, marginBottom: 12, width: "60%" }} />
                    <div style={{ height: 20, backgroundColor: t.sectionAlt, borderRadius: 6, marginBottom: 8 }} />
                    <div style={{ height: 14, backgroundColor: t.sectionAlt, borderRadius: 6, width: "80%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 80, border: `1px dashed ${t.cardBorder}`, borderRadius: 20 }}>
              <p style={{ fontFamily: "sans-serif", fontSize: 15, color: t.muted }}>No courses found{search ? ` for "${search}"` : ""}.</p>
              {search && <button onClick={() => setSearch("")} style={{ marginTop: 12, fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, color: "#00aaff", background: "none", border: "none", cursor: "pointer" }}>Clear search</button>}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {filtered.map(course => {
                const lc = levelColor(course.level)
                return (
                  <div key={course.id}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    style={{ backgroundColor: t.cardBg, borderRadius: 20, overflow: "hidden", border: `1px solid ${t.cardBorder}`, cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#00aaff"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,170,255,0.1)"; e.currentTarget.style.transform = "translateY(-2px)" }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)" }}>

                    {/* Thumbnail */}
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                    ) : (
                      <div style={{ height: 180, backgroundColor: t.sectionAlt, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "rgba(0,170,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00aaff" }}>
                          <IconBook />
                        </div>
                      </div>
                    )}

                    <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
                      {/* Category + Level + tags */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                        {course.category && course.category !== "Course" && (
                          <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, backgroundColor: "rgba(168,85,247,0.12)", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {course.category}
                          </span>
                        )}
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, backgroundColor: lc.bg, color: lc.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {course.level}
                        </span>
                        {course.tags?.slice(0, 1).map(tag => (
                          <span key={tag} style={{ fontSize: 10, fontWeight: 700, color: t.muted, backgroundColor: t.sectionAlt, padding: "2px 7px", borderRadius: 5, textTransform: "uppercase" }}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 18, color: t.heading, letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 10 }}>
                        {course.title}
                      </h3>
                      <p style={{ fontFamily: "sans-serif", fontSize: 13, color: t.body, lineHeight: 1.6, marginBottom: 16, flex: 1,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {course.description}
                      </p>

                      {/* Stats */}
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "sans-serif", fontSize: 12, color: t.muted }}>
                          <IconLayers /> {course.totalLessons || 0} lessons
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "sans-serif", fontSize: 12, color: t.muted }}>
                          <IconUsers /> {course.enrollments || 0} enrolled
                        </span>
                      </div>

                      {/* Price + CTA */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 22, color: t.heading }}>
                          {course.price === 0 ? <span style={{ color: "#22c55e" }}>Free</span> : `$${course.price}`}
                        </span>
                        <button style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 13, padding: "8px 18px", borderRadius: 10, backgroundColor: "#00aaff", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                          View Course <IconArrow />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px", backgroundColor: "#0a1628", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "#fff", letterSpacing: "-0.03em", marginBottom: 16 }}>
            Can't find what you need?
          </h2>
          <p style={{ fontFamily: "sans-serif", fontSize: 16, color: "#8fa8b8", marginBottom: 32, lineHeight: 1.7 }}>
            Tell us what you want to learn or what you'd find useful — we build based on community demand.
          </p>
          <button onClick={() => navigate("/contact")}
            style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, padding: "14px 32px", borderRadius: 10, backgroundColor: "#00aaff", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 0 32px rgba(0,170,255,0.3)" }}>
            Request a Course →
          </button>
        </div>
      </section>

    </PageLayout>
  )
}