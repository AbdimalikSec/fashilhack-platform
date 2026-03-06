import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  collection, addDoc, doc,
  getDoc, updateDoc, serverTimestamp
} from "firebase/firestore"
import { db } from "../../config/firebase"
import { useAuth } from "../../context/AuthContext"
import PageLayout from "../../components/layout/PageLayout"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import SectionTag from "../../components/ui/SectionTag"

const CATEGORIES = ["writeup", "blog", "tutorial", "news", "ctf"]

const EMPTY = {
  title: "",
  excerpt: "",
  content: "",
  category: "blog",
  tags: "",
  readTime: "5 min read",
  status: "published",
}

export default function Writeup() {
  const { user, userData, role } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get("edit")

  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!editId)
  const [msg, setMsg] = useState("")
  const [preview, setPreview] = useState(false)

  // Load post for editing
  useEffect(() => {
    if (!editId) return
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "posts", editId))
        if (snap.exists()) {
          const data = snap.data()
          setForm({
            title: data.title || "",
            excerpt: data.excerpt || "",
            content: data.content || "",
            category: data.category || "blog",
            tags: data.tags?.join(", ") || "",
            readTime: data.readTime || "5 min read",
            status: data.status || "published",
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [editId])

  const flash = (text) => {
    setMsg(text)
    setTimeout(() => setMsg(""), 3000)
  }

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async (status = "published") => {
    if (!form.title.trim() || !form.content.trim()) {
      flash("⚠ Title and content are required.")
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        status,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        authorUid: user.uid,
        authorName: userData?.displayName || user.email,
        updatedAt: serverTimestamp(),
      }

      if (editId) {
        await updateDoc(doc(db, "posts", editId), payload)
        flash("✓ Research paper updated.")
        setTimeout(() => navigate(`/community/${editId}`), 1000)
      } else {
        payload.publishedAt = serverTimestamp()
        payload.createdAt = serverTimestamp()
        payload.comments = []
        const ref = await addDoc(collection(db, "posts"), payload)
        flash("✓ Research paper published.")
        setTimeout(() => navigate(`/community/${ref.id}`), 1000)
      }
    } catch (err) {
      console.error(err)
      flash("⚠ Failed to publish research.")
    } finally {
      setSaving(false)
    }
  }

  const inputClass = `
    w-full bg-white border-2 border-slate-100
    text-primary font-sans text-sm px-5 py-4 outline-none
    focus:border-accent transition-colors
    placeholder-slate-400 rounded-xl
  `
  const labelClass = `
    font-sans text-[10px] font-black tracking-widest uppercase
    text-slate-400 block mb-2.5
  `

  if (loading) return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
        <p className="font-heading font-bold text-primary tracking-widest text-sm uppercase">ESTABLISHING SECURE CONNECTION...</p>
      </div>
    </PageLayout>
  )

  // Only team and admin can write
  if (role !== "team" && role !== "admin") return (
    <PageLayout>
      <div className="px-6 py-40 text-center">
        <Card className="max-w-xl mx-auto py-16 border-red-50">
          <p className="font-heading font-bold text-red-500 uppercase tracking-widest text-sm">
            ⚠ ACCESS DENIED
          </p>
          <p className="font-sans text-slate-500 mt-4">Research credentials required to contribute to the community feed.</p>
        </Card>
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-center">

        {/* Header Section */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <SectionTag text={editId ? "Update Research" : "Publish Insight"} />
            <h1 className="font-heading font-bold text-3xl md:text-5xl mt-4 text-primary tracking-tight leading-tight">
              {editId ? "Refine" : "Create"}{" "}
              <span className="text-accent underline decoration-slate-100 underline-offset-8">Research</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPreview(p => !p)}
              className="
                font-sans text-[10px] font-black tracking-widest uppercase
                text-slate-400 hover:text-accent
                border-2 border-slate-100 hover:border-accent/20
                px-8 py-3.5 rounded-full transition-all
              "
            >
              {preview ? "✎ Back to Editor" : "👁 Visual Preview"}
            </button>
            <button
              onClick={() => navigate("/community")}
              className="font-sans text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest"
            >
              ← Cancel
            </button>
          </div>
        </div>

        {/* Flash Message */}
        {msg && (
          <div className="
            w-full font-sans text-sm font-bold px-6 py-5 mb-10
            border-2 border-slate-100 bg-slate-50
            text-primary text-center rounded-2xl
          ">
            {msg}
          </div>
        )}

        {/* Workspace Section */}
        <div className="w-full max-w-4xl">
          {preview ? (
            /* PREVIEW MODE */
            <div className="bg-white border-2 border-slate-50 p-12 md:p-16 rounded-[2.5rem] shadow-xl">
              <div className="mb-10 pb-10 border-b border-slate-100 text-center flex flex-col items-center">
                <Badge
                  label={form.category || "research"}
                  type={form.category === "writeup" ? "team" : "community"}
                />
                <h2 className="font-heading font-bold text-3xl md:text-4xl mt-8 mb-4 text-primary leading-tight">
                  {form.title || "Untitled Document"}
                </h2>
                <p className="font-sans text-xs font-bold text-accent uppercase tracking-widest mb-6">
                  Researcher: {userData?.displayName || user?.email}
                </p>
                {form.excerpt && (
                  <p className="font-sans text-lg text-slate-500 italic font-medium max-w-2xl leading-relaxed">
                    "{form.excerpt}"
                  </p>
                )}
                {form.tags && (
                  <div className="flex gap-2 flex-wrap mt-8 justify-center">
                    {form.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="
                        font-sans text-[10px] font-bold text-slate-400
                        bg-slate-50 border border-slate-100 px-4 py-2 rounded-full uppercase tracking-widest
                      ">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="font-sans text-lg text-slate-600 leading-[1.8] whitespace-pre-line font-medium">
                {form.content || "Operational data missing. No content provided."}
              </div>
            </div>
          ) : (
            /* EDITOR MODE */
            <Card className="!p-12 md:!p-16 !rounded-[2.5rem] shadow-2xl border-slate-100 flex flex-col gap-10">

              {/* Field: Title */}
              <div>
                <label className={labelClass}>Document Title *</label>
                <input
                  name="title"
                  placeholder="The focus of this security research..."
                  value={form.title}
                  onChange={handleChange}
                  className={`${inputClass} text-lg font-bold py-5`}
                />
              </div>

              {/* Field: Excerpt */}
              <div>
                <label className={labelClass}>Executive Summary</label>
                <input
                  name="excerpt"
                  placeholder="A concise overview of the findings..."
                  value={form.excerpt}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Grid: Category + Reading Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className={labelClass}>Domain Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer py-4`}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Estimated Complexity (Est. Time)</label>
                  <input
                    name="readTime"
                    placeholder="e.g. 5 MIN READ"
                    value={form.readTime}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Field: Tags */}
              <div>
                <label className={labelClass}>Indexing Tags (CSV)</label>
                <input
                  name="tags"
                  placeholder="sqli, infrastructure, vulnerability, ctf"
                  value={form.tags}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Field: Content Area */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <label className={labelClass}>Research Data / Methodology *</label>
                  <span className="font-sans text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    {form.content.length} / 100k Character Load
                  </span>
                </div>
                <textarea
                  name="content"
                  placeholder={`Document your research methodology, findings, and technical remediation steps...\n\nStructure Suggestion:\n1. Overview\n2. Intelligence/Recon\n3. Proof of Concept\n4. Business Risk\n5. Strategic Mitigations`}
                  value={form.content}
                  onChange={handleChange}
                  rows={20}
                  className={`${inputClass} resize-y leading-[1.7] whitespace-pre-wrap font-medium`}
                />
              </div>

              {/* Workspace Actions */}
              <div className="pt-10 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex gap-4 w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleSave("published")}
                    disabled={saving}
                    className="flex-1 sm:flex-none shadow-xl shadow-accent/20"
                  >
                    {saving ? "Deploying..." : editId ? "Update Research" : "Publish to Community"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => handleSave("draft")}
                    disabled={saving}
                    className="flex-1 sm:flex-none"
                  >
                    Archive as Draft
                  </Button>
                </div>

                <button
                  onClick={() => navigate("/community")}
                  className="font-sans text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest"
                >
                  Discard Changes
                </button>
              </div>

            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  )
}