import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, orderBy, query
} from "firebase/firestore"
import { db } from "../../config/firebase"
import { useAuth } from "../../context/AuthContext"
import PortalLayout from "../../components/layout/PortalLayout"

// ── Icons ──
const IconPlus      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconEdit      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconTrash     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
const IconChevron   = ({ up }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points={up ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></svg>
const IconEye       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconBook      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const IconVideo     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
const IconFile      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
const IconGlobe     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>

const LEVELS      = ["Beginner", "Intermediate", "Advanced"]
const CATEGORIES  = ["Course", "Cert Notes", "Study Guide", "Attack Reference", "Tool Guide", "Project", "Other"]
const EMPTY_COURSE = { title: "", description: "", price: "", level: "Beginner", category: "Course", tags: "", thumbnail: "", published: false }
const EMPTY_SECTION = { title: "" }
const EMPTY_LESSON  = { title: "", type: "text", content: "", videoUrl: "", resources: "", freePreview: false }

// ── helpers ──
const inp = (extra = {}) => ({
  width: "100%", backgroundColor: "var(--color-surface-alt)",
  border: "1px solid var(--color-border)", color: "var(--color-txt)",
  fontFamily: "sans-serif", fontSize: 13, padding: "10px 14px",
  borderRadius: 8, outline: "none", boxSizing: "border-box",
  transition: "border-color 0.15s", ...extra,
})
const label = { display: "block", fontSize: 11, fontWeight: 800, color: "var(--color-txt-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }

// ── LessonForm — defined OUTSIDE ManageCourses to prevent focus loss ──
function LessonForm({ lessonForm, setLessonForm, saving, onSave, onCancel, saveLabel }) {
  const inp = (extra = {}) => ({
    width: "100%", backgroundColor: "var(--color-surface-alt)",
    border: "1px solid var(--color-border)", color: "var(--color-txt)",
    fontFamily: "sans-serif", fontSize: 13, padding: "10px 14px",
    borderRadius: 8, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s", ...extra,
  })
  const label = { display: "block", fontSize: 11, fontWeight: 800, color: "var(--color-txt-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }

  return (
    <div style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 10, padding: 16, marginTop: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <p style={label}>Lesson Title *</p>
          <input
            value={lessonForm.title}
            onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Introduction to SQL Injection"
            style={inp()}
            onFocus={e => e.target.style.borderColor = "#00aaff"}
            onBlur={e => e.target.style.borderColor = "var(--color-border)"}
          />
        </div>
        <div>
          <p style={label}>Type</p>
          <select
            value={lessonForm.type}
            onChange={e => setLessonForm(f => ({ ...f, type: e.target.value }))}
            style={inp()}
          >
            <option value="text">Text only</option>
            <option value="video">Video only</option>
            <option value="mixed">Text + Video</option>
          </select>
        </div>
      </div>

      {(lessonForm.type === "video" || lessonForm.type === "mixed") && (
        <div style={{ marginBottom: 12 }}>
          <p style={label}>YouTube URL</p>
          <input
            value={lessonForm.videoUrl}
            onChange={e => setLessonForm(f => ({ ...f, videoUrl: e.target.value }))}
            placeholder="https://youtube.com/watch?v=..."
            style={inp()}
            onFocus={e => e.target.style.borderColor = "#00aaff"}
            onBlur={e => e.target.style.borderColor = "var(--color-border)"}
          />
        </div>
      )}

      {(lessonForm.type === "text" || lessonForm.type === "mixed") && (
        <div style={{ marginBottom: 12 }}>
          <p style={label}>Content</p>
          <textarea
            value={lessonForm.content}
            onChange={e => setLessonForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Write lesson content here..."
            rows={6}
            style={{ ...inp(), resize: "vertical", lineHeight: 1.7 }}
            onFocus={e => e.target.style.borderColor = "#00aaff"}
            onBlur={e => e.target.style.borderColor = "var(--color-border)"}
          />
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <p style={label}>Resources (one URL per line)</p>
        <textarea
          value={lessonForm.resources}
          onChange={e => setLessonForm(f => ({ ...f, resources: e.target.value }))}
          placeholder={"https://example.com/cheatsheet.pdf\nhttps://tool.com"}
          rows={3}
          style={{ ...inp(), resize: "vertical" }}
          onFocus={e => e.target.style.borderColor = "#00aaff"}
          onBlur={e => e.target.style.borderColor = "var(--color-border)"}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={lessonForm.freePreview}
            onChange={e => setLessonForm(f => ({ ...f, freePreview: e.target.checked }))}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-txt-subtle)" }}>Free preview</span>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-txt-subtle)", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onSave} disabled={saving} style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "none", backgroundColor: "#00aaff", color: "#fff", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving..." : saveLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ManageCourses() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [courses,  setCourses]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [view,     setView]     = useState("list")        // list | edit-course | edit-sections
  const [selCourse, setSelCourse] = useState(null)        // course being edited
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE)
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState("")

  // Sections & lessons state
  const [sections,    setSections]    = useState([])
  const [secLoading,  setSecLoading]  = useState(false)
  const [expandedSec, setExpandedSec] = useState({})      // { [secId]: bool }
  const [lessonsBySection, setLessonsBySection] = useState({}) // { [secId]: lesson[] }

  // Inline forms
  const [addingSection,  setAddingSection]  = useState(false)
  const [secForm,        setSecForm]        = useState(EMPTY_SECTION)
  const [addingLesson,   setAddingLesson]   = useState(null)   // secId | null
  const [lessonForm,     setLessonForm]     = useState(EMPTY_LESSON)
  const [editingLesson,  setEditingLesson]  = useState(null)   // { secId, lesson }

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 3000) }

  // ── Load courses ──
  useEffect(() => {
    getDocs(query(collection(db, "courses"), orderBy("createdAt", "desc")))
      .then(snap => setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(e => console.warn(e))
      .finally(() => setLoading(false))
  }, [])

  // ── Load sections when entering section editor ──
  useEffect(() => {
    if (view !== "edit-sections" || !selCourse) return
    setSecLoading(true)
    getDocs(query(collection(db, "courses", selCourse.id, "sections"), orderBy("order")))
      .then(async snap => {
        const secs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setSections(secs)
        // Load lessons for each section
        const bySection = {}
        await Promise.all(secs.map(async sec => {
          const lSnap = await getDocs(query(collection(db, "courses", selCourse.id, "sections", sec.id, "lessons"), orderBy("order")))
          bySection[sec.id] = lSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        }))
        setLessonsBySection(bySection)
      })
      .catch(e => console.warn(e))
      .finally(() => setSecLoading(false))
  }, [view, selCourse])

  // ── Course CRUD ──
  const handleSaveCourse = async () => {
    if (!courseForm.title.trim()) { flash("⚠ Title required."); return }
    if (!courseForm.price && courseForm.price !== 0) { flash("⚠ Price required (use 0 for free)."); return }
    setSaving(true)
    try {
      const payload = {
        ...courseForm,
        price: parseFloat(courseForm.price) || 0,
        tags:  courseForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        updatedAt: serverTimestamp(),
      }
      if (selCourse) {
        await updateDoc(doc(db, "courses", selCourse.id), payload)
        setCourses(prev => prev.map(c => c.id === selCourse.id ? { ...c, ...payload } : c))
        flash("✓ Course updated.")
      } else {
        payload.createdAt    = serverTimestamp()
        payload.totalLessons = 0
        payload.enrollments  = 0
        const ref = await addDoc(collection(db, "courses"), payload)
        const nc  = { id: ref.id, ...payload }
        setCourses(prev => [nc, ...prev])
        setSelCourse(nc)
        flash("✓ Course created. Now add sections and lessons.")
        setView("edit-sections")
        return
      }
      setView("list")
    } catch(e) { flash("⚠ " + e.message) }
    finally { setSaving(false) }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Delete this course? This cannot be undone.")) return
    await deleteDoc(doc(db, "courses", courseId))
    setCourses(prev => prev.filter(c => c.id !== courseId))
  }

  const handleTogglePublish = async (course) => {
    const next = !course.published
    await updateDoc(doc(db, "courses", course.id), { published: next })
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, published: next } : c))
  }

  // ── Section CRUD ──
  const handleAddSection = async () => {
    if (!secForm.title.trim()) return
    setSaving(true)
    try {
      const payload = { title: secForm.title.trim(), order: sections.length }
      const ref = await addDoc(collection(db, "courses", selCourse.id, "sections"), payload)
      setSections(prev => [...prev, { id: ref.id, ...payload }])
      setLessonsBySection(prev => ({ ...prev, [ref.id]: [] }))
      setSecForm(EMPTY_SECTION)
      setAddingSection(false)
    } catch(e) { flash("⚠ " + e.message) }
    finally { setSaving(false) }
  }

  const handleDeleteSection = async (secId) => {
    if (!window.confirm("Delete this section and all its lessons?")) return
    await deleteDoc(doc(db, "courses", selCourse.id, "sections", secId))
    setSections(prev => prev.filter(s => s.id !== secId))
    setLessonsBySection(prev => { const n = {...prev}; delete n[secId]; return n })
  }

  // ── Lesson CRUD ──
  const handleAddLesson = async (secId) => {
    if (!lessonForm.title.trim()) return
    setSaving(true)
    try {
      const lessons = lessonsBySection[secId] || []
      const payload = {
        ...lessonForm,
        resources: lessonForm.resources.split("\n").map(r => r.trim()).filter(Boolean),
        order: lessons.length,
      }
      const ref = await addDoc(collection(db, "courses", selCourse.id, "sections", secId, "lessons"), payload)
      const nl = { id: ref.id, ...payload }
      setLessonsBySection(prev => ({ ...prev, [secId]: [...(prev[secId] || []), nl] }))
      // Update totalLessons on course
      const total = Object.values({ ...lessonsBySection, [secId]: [...lessons, nl] }).reduce((a, l) => a + l.length, 0)
      await updateDoc(doc(db, "courses", selCourse.id), { totalLessons: total })
      setCourses(prev => prev.map(c => c.id === selCourse.id ? { ...c, totalLessons: total } : c))
      setLessonForm(EMPTY_LESSON)
      setAddingLesson(null)
      flash("✓ Lesson added.")
    } catch(e) { flash("⚠ " + e.message) }
    finally { setSaving(false) }
  }

  const handleUpdateLesson = async () => {
    if (!editingLesson) return
    const { secId, lesson } = editingLesson
    setSaving(true)
    try {
      const payload = {
        ...lessonForm,
        resources: typeof lessonForm.resources === "string"
          ? lessonForm.resources.split("\n").map(r => r.trim()).filter(Boolean)
          : lessonForm.resources,
      }
      await updateDoc(doc(db, "courses", selCourse.id, "sections", secId, "lessons", lesson.id), payload)
      setLessonsBySection(prev => ({
        ...prev,
        [secId]: prev[secId].map(l => l.id === lesson.id ? { ...l, ...payload } : l)
      }))
      setEditingLesson(null)
      setLessonForm(EMPTY_LESSON)
      flash("✓ Lesson updated.")
    } catch(e) { flash("⚠ " + e.message) }
    finally { setSaving(false) }
  }

  const handleDeleteLesson = async (secId, lessonId) => {
    if (!window.confirm("Delete this lesson?")) return
    await deleteDoc(doc(db, "courses", selCourse.id, "sections", secId, "lessons", lessonId))
    setLessonsBySection(prev => ({ ...prev, [secId]: prev[secId].filter(l => l.id !== lessonId) }))
  }

  const openEditLesson = (secId, lesson) => {
    setEditingLesson({ secId, lesson })
    setLessonForm({
      ...lesson,
      resources: Array.isArray(lesson.resources) ? lesson.resources.join("\n") : (lesson.resources || ""),
    })
    setAddingLesson(null)
  }


  // ══════════════════════════════════════════
  // VIEW: LIST
  // ══════════════════════════════════════════
  if (view === "list") return (
    <PortalLayout title="Manage Courses">
      {msg && <div style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, padding: "12px 16px", borderRadius: 10, backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)", border: "1px solid var(--color-border)", marginBottom: 20 }}>{msg}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: "var(--color-txt)", fontWeight: 900, fontSize: 22, letterSpacing: "-0.03em", margin: 0 }}>All Courses</h2>
          <p style={{ color: "var(--color-txt-muted)", fontSize: 12, marginTop: 4 }}>{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setSelCourse(null); setCourseForm(EMPTY_COURSE); setView("edit-course") }}
          style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "sans-serif", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, backgroundColor: "#00aaff", color: "#fff", border: "none", cursor: "pointer" }}>
          <IconPlus /> New Course
        </button>
      </div>

      {loading ? (
        <div style={{ color: "var(--color-txt-muted)", fontFamily: "sans-serif", fontSize: 13, textAlign: "center", padding: 48 }}>Loading...</div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, border: "1px dashed var(--color-border)", borderRadius: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
          <p style={{ fontFamily: "sans-serif", fontSize: 14, color: "var(--color-txt-muted)", marginBottom: 20 }}>No courses yet. Create your first one.</p>
          <button onClick={() => { setSelCourse(null); setCourseForm(EMPTY_COURSE); setView("edit-course") }}
            style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 13, padding: "10px 24px", borderRadius: 10, backgroundColor: "#00aaff", color: "#fff", border: "none", cursor: "pointer" }}>
            Create Course
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {courses.map(course => (
            <div key={course.id} style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "var(--color-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00aaff", flexShrink: 0 }}>
                  <IconBook />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: 15, color: "var(--color-txt)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.title}</h3>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6, backgroundColor: course.published ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)", color: course.published ? "#22c55e" : "#f59e0b", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>
                      {course.published ? "Live" : "Draft"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <span style={{ fontFamily: "sans-serif", fontSize: 12, color: "var(--color-txt-muted)" }}>${course.price || 0}</span>
                    <span style={{ fontFamily: "sans-serif", fontSize: 12, color: "var(--color-txt-muted)" }}>{course.totalLessons || 0} lessons</span>
                    <span style={{ fontFamily: "sans-serif", fontSize: 12, color: "var(--color-txt-muted)" }}>{course.level}</span>
                    <span style={{ fontFamily: "sans-serif", fontSize: 12, color: "var(--color-txt-muted)" }}>{course.enrollments || 0} enrolled</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => handleTogglePublish(course)}
                  title={course.published ? "Unpublish" : "Publish"}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--color-border)", backgroundColor: "transparent", color: course.published ? "#f59e0b" : "#22c55e", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                  {course.published ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => { navigate(`/courses/${course.id}`) }}
                  title="Preview" style={{ padding: 8, borderRadius: 8, border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-txt-subtle)", cursor: "pointer" }}>
                  <IconEye />
                </button>
                <button onClick={() => { setSelCourse(course); setSections([]); setLessonsBySection({}); setView("edit-sections") }}
                  title="Edit sections" style={{ padding: 8, borderRadius: 8, border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-txt-subtle)", cursor: "pointer" }}>
                  <IconBook />
                </button>
                <button onClick={() => { setSelCourse(course); setCourseForm({ ...course, tags: Array.isArray(course.tags) ? course.tags.join(", ") : course.tags || "", price: course.price?.toString() || "" }); setView("edit-course") }}
                  title="Edit details" style={{ padding: 8, borderRadius: 8, border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-txt-subtle)", cursor: "pointer" }}>
                  <IconEdit />
                </button>
                <button onClick={() => handleDeleteCourse(course.id)}
                  title="Delete" style={{ padding: 8, borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", backgroundColor: "transparent", color: "#ef4444", cursor: "pointer" }}>
                  <IconTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  )

  // ══════════════════════════════════════════
  // VIEW: EDIT COURSE DETAILS
  // ══════════════════════════════════════════
  if (view === "edit-course") return (
    <PortalLayout title={selCourse ? "Edit Course" : "New Course"}>
      <div style={{ maxWidth: 720 }}>
        <button onClick={() => setView("list")} style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: "var(--color-txt-muted)", background: "none", border: "none", cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>
          ← Back to courses
        </button>

        {msg && <div style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, padding: "12px 16px", borderRadius: 10, backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)", border: "1px solid var(--color-border)", marginBottom: 20 }}>{msg}</div>}

        <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>

          <div>
            <p style={label}>Course Title *</p>
            <input value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Active Directory Attacks from Zero" style={inp()}
              onFocus={e => e.target.style.borderColor = "#00aaff"} onBlur={e => e.target.style.borderColor = "var(--color-border)"} />
          </div>

          <div>
            <p style={label}>Description</p>
            <textarea value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What will students learn? Who is this for?" rows={4}
              style={{ ...inp(), resize: "vertical", lineHeight: 1.7 }}
              onFocus={e => e.target.style.borderColor = "#00aaff"} onBlur={e => e.target.style.borderColor = "var(--color-border)"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
            <div>
              <p style={label}>Price (USD) *</p>
              <input type="number" min="0" step="0.01" value={courseForm.price}
                onChange={e => setCourseForm(f => ({ ...f, price: e.target.value }))}
                placeholder="29.99" style={inp()}
                onFocus={e => e.target.style.borderColor = "#00aaff"} onBlur={e => e.target.style.borderColor = "var(--color-border)"} />
            </div>
            <div>
              <p style={label}>Category</p>
              <select value={courseForm.category} onChange={e => setCourseForm(f => ({ ...f, category: e.target.value }))} style={inp()}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <p style={label}>Level</p>
              <select value={courseForm.level} onChange={e => setCourseForm(f => ({ ...f, level: e.target.value }))} style={inp()}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <p style={label}>Tags</p>
              <input value={courseForm.tags} onChange={e => setCourseForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="pentest, AD, windows" style={inp()}
                onFocus={e => e.target.style.borderColor = "#00aaff"} onBlur={e => e.target.style.borderColor = "var(--color-border)"} />
            </div>
          </div>

          <div>
            <p style={label}>Thumbnail URL</p>
            <input value={courseForm.thumbnail} onChange={e => setCourseForm(f => ({ ...f, thumbnail: e.target.value }))}
              placeholder="https://..." style={inp()}
              onFocus={e => e.target.style.borderColor = "#00aaff"} onBlur={e => e.target.style.borderColor = "var(--color-border)"} />
            {courseForm.thumbnail && (
              <img src={courseForm.thumbnail} alt="thumbnail preview" style={{ marginTop: 12, height: 120, borderRadius: 8, objectFit: "cover", border: "1px solid var(--color-border)" }} />
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--color-border)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={courseForm.published} onChange={e => setCourseForm(f => ({ ...f, published: e.target.checked }))} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-txt-subtle)" }}>Publish immediately</span>
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setView("list")} style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 10, border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-txt-subtle)", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSaveCourse} disabled={saving} style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 10, border: "none", backgroundColor: "#00aaff", color: "#fff", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving..." : selCourse ? "Update Course" : "Create & Add Lessons →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  )

  // ══════════════════════════════════════════
  // VIEW: EDIT SECTIONS & LESSONS
  // ══════════════════════════════════════════
  return (
    <PortalLayout title={`Sections — ${selCourse?.title}`}>
      <div style={{ maxWidth: 800 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <button onClick={() => setView("list")} style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: "var(--color-txt-muted)", background: "none", border: "none", cursor: "pointer" }}>
            ← Back to courses
          </button>
          <button onClick={() => { setSelCourse(selCourse); setCourseForm({ ...selCourse, tags: Array.isArray(selCourse.tags) ? selCourse.tags.join(", ") : "", price: selCourse.price?.toString() || "" }); setView("edit-course") }}
            style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 8, border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-txt-subtle)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <IconEdit /> Edit details
          </button>
        </div>

        {msg && <div style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, padding: "12px 16px", borderRadius: 10, backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)", border: "1px solid var(--color-border)", marginBottom: 20 }}>{msg}</div>}

        {secLoading ? (
          <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "var(--color-txt-muted)", textAlign: "center", padding: 40 }}>Loading sections...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sections.map((sec, si) => {
              const lessons  = lessonsBySection[sec.id] || []
              const isOpen   = expandedSec[sec.id] !== false // default open
              return (
                <div key={sec.id} style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, overflow: "hidden" }}>
                  {/* Section header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", cursor: "pointer", userSelect: "none" }}
                    onClick={() => setExpandedSec(p => ({ ...p, [sec.id]: !isOpen }))}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 800, color: "#00aaff", backgroundColor: "rgba(0,170,255,0.1)", padding: "3px 8px", borderRadius: 6 }}>
                        S{si + 1}
                      </span>
                      <span style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: 14, color: "var(--color-txt)" }}>{sec.title}</span>
                      <span style={{ fontFamily: "sans-serif", fontSize: 11, color: "var(--color-txt-muted)" }}>{lessons.length} lesson{lessons.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button onClick={e => { e.stopPropagation(); handleDeleteSection(sec.id) }}
                        style={{ padding: 6, borderRadius: 6, border: "none", backgroundColor: "transparent", color: "#ef4444", cursor: "pointer" }}>
                        <IconTrash />
                      </button>
                      <span style={{ color: "var(--color-txt-muted)" }}><IconChevron up={isOpen} /></span>
                    </div>
                  </div>

                  {/* Lessons */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid var(--color-border)", padding: "12px 20px" }}>
                      {lessons.map((lesson, li) => (
                        <div key={lesson.id}>
                          {editingLesson?.lesson?.id === lesson.id ? (
                            <LessonForm lessonForm={lessonForm} setLessonForm={setLessonForm} saving={saving} onSave={handleUpdateLesson} onCancel={() => { setEditingLesson(null); setLessonForm(EMPTY_LESSON) }} saveLabel="Update Lesson" />
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: li < lessons.length - 1 ? "1px solid var(--color-border-soft)" : "none" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontFamily: "sans-serif", fontSize: 11, color: "var(--color-txt-muted)", width: 24 }}>{li + 1}.</span>
                                <span style={{ color: "var(--color-txt-muted)" }}>
                                  {lesson.type === "video" ? <IconVideo /> : lesson.type === "mixed" ? <IconGlobe /> : <IconFile />}
                                </span>
                                <span style={{ fontFamily: "sans-serif", fontSize: 13, color: "var(--color-txt)", fontWeight: 600 }}>{lesson.title}</span>
                                {lesson.freePreview && (
                                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 5, backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e", textTransform: "uppercase" }}>Preview</span>
                                )}
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => openEditLesson(sec.id, lesson)}
                                  style={{ padding: 6, borderRadius: 6, border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-txt-subtle)", cursor: "pointer" }}>
                                  <IconEdit />
                                </button>
                                <button onClick={() => handleDeleteLesson(sec.id, lesson.id)}
                                  style={{ padding: 6, borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)", backgroundColor: "transparent", color: "#ef4444", cursor: "pointer" }}>
                                  <IconTrash />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add lesson form */}
                      {addingLesson === sec.id ? (
                        <LessonForm lessonForm={lessonForm} setLessonForm={setLessonForm} saving={saving} onSave={() => handleAddLesson(sec.id)} onCancel={() => { setAddingLesson(null); setLessonForm(EMPTY_LESSON) }} saveLabel="Add Lesson" />
                      ) : (
                        <button onClick={() => { setAddingLesson(sec.id); setLessonForm(EMPTY_LESSON); setEditingLesson(null) }}
                          style={{ marginTop: 10, fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: "#00aaff", background: "none", border: "1px dashed rgba(0,170,255,0.3)", borderRadius: 8, padding: "8px 16px", cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <IconPlus /> Add Lesson
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Add section */}
            {addingSection ? (
              <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 20 }}>
                <p style={label}>Section Title</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <input value={secForm.title} onChange={e => setSecForm({ title: e.target.value })}
                    placeholder="e.g. Introduction" style={{ ...inp(), flex: 1 }} autoFocus
                    onFocus={e => e.target.style.borderColor = "#00aaff"} onBlur={e => e.target.style.borderColor = "var(--color-border)"}
                    onKeyDown={e => e.key === "Enter" && handleAddSection()} />
                  <button onClick={handleAddSection} disabled={saving} style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: "#00aaff", color: "#fff", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                    {saving ? "..." : "Add"}
                  </button>
                  <button onClick={() => { setAddingSection(false); setSecForm(EMPTY_SECTION) }} style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, padding: "10px 16px", borderRadius: 8, border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-txt-subtle)", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingSection(true)}
                style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, padding: "14px", borderRadius: 14, border: "2px dashed var(--color-border)", backgroundColor: "transparent", color: "var(--color-txt-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#00aaff"; e.currentTarget.style.color = "#00aaff" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-txt-muted)" }}>
                <IconPlus /> Add Section
              </button>
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  )
}