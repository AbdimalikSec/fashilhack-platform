import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "../../config/firebase"
import { useAuth } from "../../context/AuthContext"
import PageLayout from "../../components/layout/PageLayout"
import { usePublicTheme } from "../../hooks/Usepublictheme"

const IconCheck    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconLock     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconEye      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconVideo    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
const IconFile     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
const IconGlobe    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const IconArrow    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const IconLayers   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
const IconChevron  = ({ up }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points={up ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></svg>

const levelColor = (level) => {
  if (level === "Beginner")     return { bg: "rgba(34,197,94,0.12)",  text: "#22c55e" }
  if (level === "Intermediate") return { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" }
  if (level === "Advanced")     return { bg: "rgba(239,68,68,0.12)",  text: "#ef4444" }
  return { bg: "rgba(0,170,255,0.12)", text: "#00aaff" }
}

export default function CoursePage() {
  const { courseId }       = useParams()
  const { user, userData } = useAuth()
  const navigate           = useNavigate()
  const t                  = usePublicTheme()

  const [course,   setCourse]   = useState(null)
  const [sections, setSections] = useState([])
  const [lessons,  setLessons]  = useState({})   // { [secId]: lesson[] }
  const [loading,  setLoading]  = useState(true)
  const [enrolled, setEnrolled] = useState(false)
  const [expanded, setExpanded] = useState({})   // { [secId]: bool }

  useEffect(() => {
    const load = async () => {
      try {
        // Load course
        const cSnap = await getDoc(doc(db, "courses", courseId))
        if (!cSnap.exists()) { setLoading(false); return }
        const cData = { id: cSnap.id, ...cSnap.data() }
        setCourse(cData)

        // Load sections
        const sSnap = await getDocs(query(collection(db, "courses", courseId, "sections"), orderBy("order")))
        const secs  = sSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        setSections(secs)

        // Open first section by default
        if (secs.length > 0) setExpanded({ [secs[0].id]: true })

        // Load lessons for each section
        const bySection = {}
        await Promise.all(secs.map(async sec => {
          const lSnap = await getDocs(query(collection(db, "courses", courseId, "sections", sec.id, "lessons"), orderBy("order")))
          bySection[sec.id] = lSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        }))
        setLessons(bySection)

        // Check enrollment
        if (user) {
          const eSnap = await getDoc(doc(db, "enrollments", `${user.uid}_${courseId}`))
          setEnrolled(eSnap.exists())
        }
      } catch(e) { console.warn(e) }
      finally { setLoading(false) }
    }
    load()
  }, [courseId, user])

  const totalLessons  = Object.values(lessons).reduce((a, l) => a + l.length, 0)
  const freeLessons   = Object.values(lessons).flat().filter(l => l.freePreview).length
  const isAdminOrTeam = userData?.role === "admin" || userData?.role === "team"
  const canAccess     = enrolled || isAdminOrTeam || course?.price === 0

  const handleEnroll = () => {
    if (!user) { navigate("/login"); return }
    if (course?.price === 0) {
      // Free course — auto enroll (handled in CoursePlayer)
      navigate(`/courses/${courseId}/learn`)
      return
    }
    // Paid — go to checkout (Stripe, built after deploy)
    navigate(`/courses/${courseId}/checkout`)
  }

  if (loading) return (
    <PageLayout>
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: t.pageBg }}>
        <p style={{ fontFamily: "sans-serif", fontSize: 13, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading...</p>
      </div>
    </PageLayout>
  )

  if (!course) return (
    <PageLayout>
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: t.pageBg }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: 14, color: t.muted, marginBottom: 16 }}>Course not found.</p>
          <button onClick={() => navigate("/courses")} style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, color: "#00aaff", background: "none", border: "none", cursor: "pointer" }}>← Back to Courses</button>
        </div>
      </div>
    </PageLayout>
  )

  const lc = levelColor(course.level)

  return (
    <PageLayout>
      <div style={{ backgroundColor: t.pageBg, transition: "background-color 0.2s" }}>

        {/* ── HERO ── */}
        <div style={{ backgroundColor: t.dark ? "#0d1117" : "#0a1628", padding: "80px 24px 60px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 380px", gap: 64, alignItems: "start" }}>

            {/* Left */}
            <div>
              <button onClick={() => navigate("/courses")} style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", background: "none", border: "none", cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
                ← All Courses
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, backgroundColor: lc.bg, color: lc.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {course.level}
                </span>
                {course.tags?.slice(0, 3).map(tag => (
                  <span key={tag} style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", backgroundColor: "rgba(255,255,255,0.06)", padding: "3px 9px", borderRadius: 6, textTransform: "uppercase" }}>
                    {tag}
                  </span>
                ))}
              </div>

              <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,3rem)", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
                {course.title}
              </h1>

              <p style={{ fontFamily: "sans-serif", fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 32, maxWidth: 560 }}>
                {course.description}
              </p>

              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[
                  { icon: <IconLayers />, label: `${totalLessons} lessons` },
                  { icon: <IconEye />,    label: `${freeLessons} free previews` },
                  { icon: <IconFile />,   label: `${sections.length} sections` },
                ].map(stat => (
                  <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "sans-serif", fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                    <span style={{ color: "#00aaff" }}>{stat.icon}</span>
                    {stat.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — sticky purchase card */}
            <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 32px 64px rgba(0,0,0,0.3)" }}>
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: 200, objectFit: "cover" }} />
              ) : (
                <div style={{ height: 200, backgroundColor: "rgba(0,170,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 48, color: "#00aaff", opacity: 0.5 }}>FH</div>
                </div>
              )}
              <div style={{ padding: 28 }}>
                <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 36, color: t.heading, marginBottom: 20 }}>
                  {course.price === 0 ? <span style={{ color: "#22c55e" }}>Free</span> : `$${course.price}`}
                </div>

                {canAccess ? (
                  <button onClick={() => navigate(`/courses/${courseId}/learn`)}
                    style={{ width: "100%", fontFamily: "sans-serif", fontWeight: 700, fontSize: 15, padding: "14px", borderRadius: 12, backgroundColor: "#22c55e", color: "#fff", border: "none", cursor: "pointer", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {enrolled ? "Continue Learning →" : "Start Course →"}
                  </button>
                ) : (
                  <button onClick={handleEnroll}
                    style={{ width: "100%", fontFamily: "sans-serif", fontWeight: 700, fontSize: 15, padding: "14px", borderRadius: 12, backgroundColor: "#00aaff", color: "#fff", border: "none", cursor: "pointer", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 32px rgba(0,170,255,0.3)" }}>
                    Enroll Now <IconArrow />
                  </button>
                )}

                {!user && (
                  <p style={{ fontFamily: "sans-serif", fontSize: 12, color: t.muted, textAlign: "center", marginBottom: 16 }}>
                    <button onClick={() => navigate("/login")} style={{ color: "#00aaff", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Sign in</button> to enroll
                  </p>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
                  {[
                    "Lifetime access after purchase",
                    "All future updates included",
                    `${freeLessons} lessons free to preview`,
                    "Certificate on completion (soon)",
                  ].map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: "rgba(34,197,94,0.12)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><IconCheck /></span>
                      <span style={{ fontFamily: "sans-serif", fontSize: 12, color: t.body }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CURRICULUM ── */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px" }}>
          <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 26, color: t.heading, letterSpacing: "-0.03em", marginBottom: 8 }}>
            Course Curriculum
          </h2>
          <p style={{ fontFamily: "sans-serif", fontSize: 13, color: t.muted, marginBottom: 32 }}>
            {sections.length} sections · {totalLessons} lessons · {freeLessons} free previews
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sections.map((sec, si) => {
              const secLessons = lessons[sec.id] || []
              const isOpen     = expanded[sec.id]
              return (
                <div key={sec.id} style={{ border: `1px solid ${t.cardBorder}`, borderRadius: 14, overflow: "hidden", backgroundColor: t.cardBg }}>
                  {/* Section header */}
                  <div onClick={() => setExpanded(p => ({ ...p, [sec.id]: !isOpen }))}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer", userSelect: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 800, color: "#00aaff", backgroundColor: "rgba(0,170,255,0.1)", padding: "3px 8px", borderRadius: 6 }}>
                        S{si + 1}
                      </span>
                      <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 15, color: t.heading }}>{sec.title}</span>
                      <span style={{ fontFamily: "sans-serif", fontSize: 12, color: t.muted }}>{secLessons.length} lessons</span>
                    </div>
                    <span style={{ color: t.muted }}><IconChevron up={isOpen} /></span>
                  </div>

                  {/* Lessons */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${t.border}` }}>
                      {secLessons.map((lesson, li) => {
                        const isPreview  = lesson.freePreview
                        const accessible = canAccess || isPreview
                        return (
                          <div key={lesson.id}
                            onClick={() => accessible && navigate(`/courses/${courseId}/learn?lesson=${lesson.id}&section=${sec.id}`)}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "12px 20px",
                              borderBottom: li < secLessons.length - 1 ? `1px solid ${t.border}` : "none",
                              cursor: accessible ? "pointer" : "default",
                              transition: "background-color 0.15s",
                            }}
                            onMouseEnter={e => { if (accessible) e.currentTarget.style.backgroundColor = t.sectionAlt }}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <span style={{ fontFamily: "sans-serif", fontSize: 11, color: t.muted, width: 20 }}>{li + 1}.</span>
                              <span style={{ color: isPreview ? "#00aaff" : t.muted }}>
                                {lesson.type === "video" ? <IconVideo /> : lesson.type === "mixed" ? <IconGlobe /> : <IconFile />}
                              </span>
                              <span style={{ fontFamily: "sans-serif", fontSize: 13, color: accessible ? t.heading : t.muted, fontWeight: accessible ? 500 : 400 }}>
                                {lesson.title}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {isPreview && (
                                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6, backgroundColor: "rgba(0,170,255,0.1)", color: "#00aaff", textTransform: "uppercase" }}>
                                  Free
                                </span>
                              )}
                              {!accessible && <span style={{ color: t.muted }}><IconLock /></span>}
                              {accessible && !isPreview && enrolled && <span style={{ color: "#22c55e" }}><IconCheck /></span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bottom enroll CTA */}
          {!canAccess && (
            <div style={{ marginTop: 48, backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: 40, textAlign: "center" }}>
              <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 22, color: t.heading, marginBottom: 12 }}>
                Ready to start learning?
              </h3>
              <p style={{ fontFamily: "sans-serif", fontSize: 14, color: t.body, marginBottom: 24, lineHeight: 1.6 }}>
                Get full access to all {totalLessons} lessons, resources, and future updates.
              </p>
              <button onClick={handleEnroll}
                style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 15, padding: "14px 40px", borderRadius: 12, backgroundColor: "#00aaff", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 8px 32px rgba(0,170,255,0.25)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                {course.price === 0 ? "Start Free Course →" : `Enroll for $${course.price} →`}
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}