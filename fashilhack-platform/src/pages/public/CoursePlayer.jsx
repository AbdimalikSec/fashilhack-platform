import { useEffect, useState, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import {
  doc, getDoc, getDocs, collection,
  query, orderBy, setDoc, serverTimestamp
} from "firebase/firestore"
import { db } from "../../config/firebase"
import { useAuth } from "../../context/AuthContext"

// ── Icons ──
const IconMenu     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
const IconCheck    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconLock     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconChevron  = ({ up }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points={up ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></svg>
const IconArrow    = ({ left }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1={left?"19":"5"} y1="12" x2={left?"5":"19"} y2="12"/><polyline points={left?"12 19 5 12 12 5":"12 5 19 12 12 19"}/></svg>
const IconVideo    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
const IconFile     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
const IconGlobe    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const IconDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const IconHome     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>

// ── YouTube embed URL helper ──
function getYouTubeEmbed(url) {
  if (!url) return null
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

// ── Lesson type icon ──
function LessonIcon({ type }) {
  if (type === "video")  return <IconVideo />
  if (type === "mixed")  return <IconGlobe />
  return <IconFile />
}

export default function CoursePlayer() {
  const { courseId }       = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, userData } = useAuth()
  const navigate           = useNavigate()

  const [course,    setCourse]    = useState(null)
  const [sections,  setSections]  = useState([])
  const [lessons,   setLessons]   = useState({})      // { [secId]: lesson[] }
  const [loading,   setLoading]   = useState(true)
  const [enrolled,  setEnrolled]  = useState(false)
  const [progress,  setProgress]  = useState({})      // { [lessonId]: true }
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expanded,  setExpanded]  = useState({})      // { [secId]: bool }

  // Current lesson
  const [activeSec,    setActiveSec]    = useState(null)
  const [activeLesson, setActiveLesson] = useState(null)
  const [showCompletion, setShowCompletion] = useState(false)

  const isAdminOrTeam = userData?.role === "admin" || userData?.role === "team"

  // ── Load everything ──
  useEffect(() => {
    if (!user) { navigate(`/courses/${courseId}`); return }
    const load = async () => {
      try {
        const cSnap = await getDoc(doc(db, "courses", courseId))
        if (!cSnap.exists()) { navigate("/courses"); return }
        setCourse({ id: cSnap.id, ...cSnap.data() })

        // Check enrollment
        const eSnap = await getDoc(doc(db, "enrollments", `${user.uid}_${courseId}`))
        const isEnrolled = eSnap.exists()

        // Free course — auto-enroll
        if (!isEnrolled && cSnap.data().price === 0) {
          await setDoc(doc(db, "enrollments", `${user.uid}_${courseId}`), {
            uid: user.uid, courseId, purchasedAt: serverTimestamp(), stripeSessionId: "free"
          })
          setEnrolled(true)
        } else {
          setEnrolled(isEnrolled || isAdminOrTeam)
          if (!isEnrolled && !isAdminOrTeam) {
            navigate(`/courses/${courseId}`)
            return
          }
        }

        // Load sections
        const sSnap = await getDocs(query(collection(db, "courses", courseId, "sections"), orderBy("order")))
        const secs  = sSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        setSections(secs)

        // Expand all sections by default
        const expAll = {}
        secs.forEach(s => expAll[s.id] = true)
        setExpanded(expAll)

        // Load all lessons
        const bySection = {}
        await Promise.all(secs.map(async sec => {
          const lSnap = await getDocs(query(collection(db, "courses", courseId, "sections", sec.id, "lessons"), orderBy("order")))
          bySection[sec.id] = lSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        }))
        setLessons(bySection)

        // Load progress
        const pSnap = await getDoc(doc(db, "enrollments", `${user.uid}_${courseId}`))
        if (pSnap.exists()) setProgress(pSnap.data().progress || {})

        // Set initial lesson from URL params or first lesson
        const paramLesson  = searchParams.get("lesson")
        const paramSection = searchParams.get("section")
        if (paramSection && paramLesson && bySection[paramSection]) {
          const lesson = bySection[paramSection]?.find(l => l.id === paramLesson)
          if (lesson) { setActiveSec(paramSection); setActiveLesson(lesson); setLoading(false); return }
        }
        // Default to first lesson
        if (secs.length > 0 && bySection[secs[0].id]?.length > 0) {
          setActiveSec(secs[0].id)
          setActiveLesson(bySection[secs[0].id][0])
        }
      } catch(e) { console.warn(e) }
      finally { setLoading(false) }
    }
    load()
  }, [courseId, user])

  // ── Mark lesson complete ──
  const markComplete = useCallback(async (lessonId) => {
    if (!user || !lessonId) return
    const newProgress = { ...progress, [lessonId]: true }
    setProgress(newProgress)
    try {
      await setDoc(doc(db, "enrollments", `${user.uid}_${courseId}`), { progress: newProgress }, { merge: true })
    } catch(e) { console.warn(e) }
  }, [progress, user, courseId])

  // ── Navigate lessons ──
  const allLessons = sections.flatMap(s => (lessons[s.id] || []).map(l => ({ ...l, secId: s.id })))
  const currentIdx = allLessons.findIndex(l => l.id === activeLesson?.id)

  const goToLesson = (lesson, secId) => {
    setActiveLesson(lesson)
    setActiveSec(secId)
    setSearchParams({ lesson: lesson.id, section: secId })
    window.scrollTo(0, 0)
  }

  const goPrev = () => { if (currentIdx > 0) { const l = allLessons[currentIdx - 1]; goToLesson(l, l.secId) } }
  const goNext = () => { if (currentIdx < allLessons.length - 1) { const l = allLessons[currentIdx + 1]; goToLesson(l, l.secId) } }

  // Progress stats
  const totalLessons    = allLessons.length
  const completedCount  = Object.keys(progress).length
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0d0f16", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading course...</p>
    </div>
  )

  const embedUrl = activeLesson ? getYouTubeEmbed(activeLesson.videoUrl) : null
  const resources = Array.isArray(activeLesson?.resources)
    ? activeLesson.resources
    : activeLesson?.resources?.split("\n").map(r => r.trim()).filter(Boolean) || []

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0d0f16", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>

      {/* ── TOP BAR ── */}
      <header style={{ backgroundColor: "#161b22", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 6, display: "flex" }}>
            <IconMenu />
          </button>
          <button onClick={() => navigate("/courses")}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700 }}>
            <IconHome /> Courses
          </button>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {course?.title}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 120, height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPercent}%`, backgroundColor: "#00aaff", borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em" }}>
              {progressPercent}%
            </span>
          </div>
          <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 12, color: "#fff" }}>
            {userData?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── SIDEBAR ── */}
        {sidebarOpen && (
          <aside style={{ width: 300, backgroundColor: "#161b22", borderRight: "1px solid rgba(255,255,255,0.08)", overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column" }}>

            {/* Progress summary */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your Progress</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{completedCount} / {totalLessons} lessons</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#00aaff" }}>{progressPercent}%</span>
              </div>
              <div style={{ height: 4, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPercent}%`, backgroundColor: "#00aaff", borderRadius: 2, transition: "width 0.3s" }} />
              </div>
            </div>

            {/* Sections + lessons */}
            <div style={{ flex: 1, padding: "12px 0" }}>
              {sections.map((sec, si) => {
                const secLessons = lessons[sec.id] || []
                const isOpen     = expanded[sec.id]
                const secDone    = secLessons.filter(l => progress[l.id]).length

                return (
                  <div key={sec.id}>
                    {/* Section header */}
                    <div onClick={() => setExpanded(p => ({ ...p, [sec.id]: !isOpen }))}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", cursor: "pointer", userSelect: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#00aaff", backgroundColor: "rgba(0,170,255,0.1)", padding: "2px 6px", borderRadius: 5 }}>S{si+1}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>{sec.title}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{secDone}/{secLessons.length}</span>
                        <span style={{ color: "rgba(255,255,255,0.3)" }}><IconChevron up={isOpen} /></span>
                      </div>
                    </div>

                    {/* Lessons */}
                    {isOpen && secLessons.map((lesson, li) => {
                      const isActive = activeLesson?.id === lesson.id
                      const isDone   = progress[lesson.id]

                      return (
                        <div key={lesson.id}
                          onClick={() => goToLesson(lesson, sec.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "9px 20px 9px 32px",
                            cursor: "pointer", transition: "background-color 0.15s",
                            backgroundColor: isActive ? "rgba(0,170,255,0.1)" : "transparent",
                            borderLeft: isActive ? "2px solid #00aaff" : "2px solid transparent",
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)" }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent" }}>
                          {/* Done indicator */}
                          <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: isDone ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${isDone ? "#22c55e" : "rgba(255,255,255,0.1)"}`, color: isDone ? "#22c55e" : "rgba(255,255,255,0.3)" }}>
                            {isDone ? <IconCheck /> : <span style={{ fontSize: 9, fontWeight: 800 }}>{li+1}</span>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                              {lesson.title}
                            </p>
                          </div>
                          <span style={{ color: isActive ? "#00aaff" : "rgba(255,255,255,0.2)", flexShrink: 0 }}>
                            <LessonIcon type={lesson.type} />
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </aside>
        )}

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, overflowY: "auto", backgroundColor: "#0d0f16" }}>
          {!activeLesson ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Select a lesson to begin</p>
            </div>
          ) : (
            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "52px 48px 100px" }}>

              {/* Lesson header */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ color: "#00aaff" }}><LessonIcon type={activeLesson.type} /></span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Lesson {currentIdx + 1} of {totalLessons}
                  </span>
                  {activeLesson.freePreview && (
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6, backgroundColor: "rgba(0,170,255,0.1)", color: "#00aaff", textTransform: "uppercase" }}>Free Preview</span>
                  )}
                </div>
                <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(1.5rem,3vw,2.2rem)", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0 }}>
                  {activeLesson.title}
                </h1>
              </div>

              {/* Video */}
              {(activeLesson.type === "video" || activeLesson.type === "mixed") && embedUrl && (
                <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 36, aspectRatio: "16/9", backgroundColor: "#000" }}>
                  <iframe
                    src={embedUrl}
                    title={activeLesson.title}
                    width="100%" height="100%"
                    style={{ border: "none", display: "block" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Text content — rendered as markdown, full width no box */}
              {(activeLesson.type === "text" || activeLesson.type === "mixed") && activeLesson.content && (
                <>
                  <style>{`
                    .fh-md { width: 100%; margin-bottom: 40px; }
                    .fh-md h1 { font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 2.2rem; color: #fff; margin: 0 0 32px; letter-spacing: -0.03em; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px; line-height: 1.15; }
                    .fh-md h2 { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.6rem; color: #fff; margin: 56px 0 20px; letter-spacing: -0.02em; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
                    .fh-md h3 { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1.25rem; color: rgba(255,255,255,0.9); margin: 40px 0 16px; }
                    .fh-md h4 { font-family: sans-serif; font-weight: 700; font-size: 1rem; color: #00aaff; margin: 32px 0 14px; text-transform: uppercase; letter-spacing: 0.07em; }
                    .fh-md h5, .fh-md h6 { font-family: sans-serif; font-weight: 700; font-size: 0.9rem; color: rgba(255,255,255,0.6); margin: 24px 0 10px; text-transform: uppercase; letter-spacing: 0.06em; }
                    .fh-md p { margin: 0 0 24px; font-size: 16px; line-height: 1.95; color: rgba(255,255,255,0.8); }
                    .fh-md ul { margin: 0 0 28px; padding-left: 28px; list-style: disc; }
                    .fh-md ol { margin: 0 0 28px; padding-left: 28px; }
                    .fh-md li { margin-bottom: 12px; font-size: 16px; line-height: 1.85; color: rgba(255,255,255,0.78); }
                    .fh-md li > ul, .fh-md li > ol { margin-top: 12px; margin-bottom: 4px; }
                    .fh-md li::marker { color: #00aaff; }
                    .fh-md strong { color: #fff; font-weight: 700; }
                    .fh-md em { color: rgba(255,255,255,0.65); font-style: italic; }
                    .fh-md code { font-family: 'Courier New', monospace; font-size: 13.5px; background: rgba(0,170,255,0.1); color: #00aaff; padding: 3px 8px; border-radius: 5px; white-space: nowrap; }
                    .fh-md pre { background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px 28px; margin: 0 0 28px; overflow-x: auto; }
                    .fh-md pre code { background: none; color: rgba(255,255,255,0.85); padding: 0; font-size: 14px; line-height: 1.85; white-space: pre; }
                    .fh-md blockquote { border-left: 3px solid #00aaff; margin: 0 0 24px; padding: 14px 0 14px 24px; background: rgba(0,170,255,0.04); border-radius: 0 8px 8px 0; }
                    .fh-md blockquote p { color: rgba(255,255,255,0.6); font-style: italic; margin: 0; }
                    .fh-md hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 48px 0; }
                    .fh-md table { width: 100%; border-collapse: collapse; margin: 0 0 28px; font-size: 15px; }
                    .fh-md th { text-align: left; padding: 12px 16px; background: rgba(0,170,255,0.08); color: #00aaff; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; border-bottom: 1px solid rgba(255,255,255,0.12); }
                    .fh-md td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.75); line-height: 1.6; }
                    .fh-md tr:last-child td { border-bottom: none; }
                    .fh-md tr:hover td { background: rgba(255,255,255,0.02); }
                    .fh-md a { color: #00aaff; text-decoration: none; }
                    .fh-md a:hover { text-decoration: underline; }
                  `}</style>
                  <div className="fh-md">
                    <ReactMarkdown>{activeLesson.content}</ReactMarkdown>
                  </div>
                </>
              )}

              {/* Resources */}
              {resources.length > 0 && (
                <div style={{ backgroundColor: "#161b22", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 24, marginBottom: 36 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Resources</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {resources.map((url, i) => {
                      const name = url.split("/").pop() || `Resource ${i + 1}`
                      return (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, backgroundColor: "rgba(0,170,255,0.06)", border: "1px solid rgba(0,170,255,0.15)", color: "#00aaff", textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "all 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(0,170,255,0.12)"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(0,170,255,0.06)"}>
                          <IconDownload />
                          {name}
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Mark complete + navigation */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button onClick={goPrev} disabled={currentIdx === 0}
                  style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent", color: currentIdx === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)", cursor: currentIdx === 0 ? "default" : "pointer", transition: "all 0.15s" }}>
                  <IconArrow left /> Previous
                </button>

                <button
                  onClick={() => {
                    markComplete(activeLesson.id)
                    if (currentIdx < allLessons.length - 1) {
                      const next = allLessons[currentIdx + 1]
                      goToLesson(next, next.secId)
                    } else {
                      setShowCompletion(true)
                    }
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 10, border: "none", backgroundColor: progress[activeLesson.id] ? "rgba(34,197,94,0.15)" : "#00aaff", color: progress[activeLesson.id] ? "#22c55e" : "#fff", cursor: "pointer", transition: "all 0.2s" }}>
                  {progress[activeLesson.id] ? (
                    <><IconCheck /> Completed</>
                  ) : currentIdx === allLessons.length - 1 ? (
                    <><IconCheck /> Finish Course</>
                  ) : (
                    <>Mark Complete & Continue <IconArrow /></>
                  )}
                </button>

                <button onClick={goNext} disabled={currentIdx === allLessons.length - 1}
                  style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent", color: currentIdx === allLessons.length - 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)", cursor: currentIdx === allLessons.length - 1 ? "default" : "pointer", transition: "all 0.15s" }}>
                  Next <IconArrow />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── COMPLETION SCREEN ── */}
      {showCompletion && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(13,15,22,0.97)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}>
          <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>

            {/* Animated checkmark circle */}
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              backgroundColor: "rgba(34,197,94,0.12)",
              border: "2px solid #22c55e",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 32px",
              animation: "fh-pop 0.4s ease-out",
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, border: "1px solid rgba(34,197,94,0.3)", backgroundColor: "rgba(34,197,94,0.08)", marginBottom: 24 }}>
              <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 800, color: "#22c55e", letterSpacing: "0.1em", textTransform: "uppercase" }}>Course Complete</span>
            </div>

            <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "clamp(2rem,5vw,3rem)", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
              You finished<br /><span style={{ color: "#22c55e" }}>{course?.title}</span>
            </h1>

            <p style={{ fontFamily: "sans-serif", fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 48, maxWidth: 400, margin: "0 auto 48px" }}>
              You've completed all {totalLessons} lessons. Great work — the knowledge you gained here is real and applicable.
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, marginBottom: 48 }}>
              {[
                { label: "Lessons", value: totalLessons },
                { label: "Sections", value: sections.length },
                { label: "Progress", value: "100%" },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 28, color: "#fff", lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 6 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/courses")}
                style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, padding: "12px 28px", borderRadius: 10, backgroundColor: "#22c55e", color: "#fff", border: "none", cursor: "pointer" }}>
                Browse More Courses →
              </button>
              <button
                onClick={() => setShowCompletion(false)}
                style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, padding: "12px 28px", borderRadius: 10, backgroundColor: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}>
                Back to Course
              </button>
            </div>

            <style>{`
              @keyframes fh-pop {
                0% { transform: scale(0.5); opacity: 0; }
                70% { transform: scale(1.1); }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  )
}