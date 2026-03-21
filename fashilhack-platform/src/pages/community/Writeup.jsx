import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { useNavigate, useSearchParams } from "react-router-dom"
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../config/firebase"
import { useAuth } from "../../context/AuthContext"
import PageLayout from "../../components/layout/PageLayout"

const CATEGORIES = ["writeup","blog","tutorial","news","ctf"]
const EMPTY = { title:"", excerpt:"", content:"", category:"blog", tags:"", readTime:"5 min read", status:"published" }

const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)

export default function Writeup() {
  const { user, userData } = useAuth()
  const navigate           = useNavigate()
  const [searchParams]     = useSearchParams()
  const editId             = searchParams.get("edit")
  const role               = userData?.role

  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [loading, setLoading] = useState(!!editId)
  const [msg,     setMsg]     = useState("")
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    if (!editId) return
    getDoc(doc(db, "posts", editId))
      .then(snap => {
        if (snap.exists()) {
          const d = snap.data()
          setForm({ title: d.title||"", excerpt: d.excerpt||"", content: d.content||"", category: d.category||"blog", tags: d.tags?.join(", ")||"", readTime: d.readTime||"5 min read", status: d.status||"published" })
        }
      })
      .catch(e => console.warn(e.message))
      .finally(() => setLoading(false))
  }, [editId])

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 3000) }
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async (status = "published") => {
    if (!form.title.trim() || !form.content.trim()) { flash("⚠ Title and content are required."); return }
    setSaving(true)
    try {
      const payload = {
        ...form, status,
        tags:       form.tags.split(",").map(t => t.trim()).filter(Boolean),
        authorUid:  user.uid,
        authorName: userData?.displayName || user.displayName || user.email,
        updatedAt:  serverTimestamp(),
      }
      if (editId) {
        await updateDoc(doc(db, "posts", editId), payload)
        flash("✓ Post updated.")
        setTimeout(() => navigate(`/community/${editId}`), 1000)
      } else {
        payload.publishedAt = serverTimestamp()
        payload.createdAt   = serverTimestamp()
        payload.comments    = []
        const ref = await addDoc(collection(db, "posts"), payload)
        flash("✓ Post published.")
        setTimeout(() => navigate(`/community/${ref.id}`), 1000)
      }
    } catch (e) {
      console.error(e)
      flash("⚠ Failed to publish. Check Firestore rules.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <PageLayout>
      <div className="min-h-screen bg-page flex items-center justify-center">
        <p className="font-sans text-sm text-muted font-black tracking-widest uppercase animate-pulse">Loading...</p>
      </div>
    </PageLayout>
  )

  if (!user) return (
    <PageLayout>
      <div className="min-h-screen bg-page flex items-center justify-center px-6">
        <div className="bg-surface border border-theme rounded-2xl p-12 text-center max-w-sm">
          <p className="font-heading font-bold text-main mb-4 uppercase tracking-widest text-sm">Sign In Required</p>
          <button onClick={() => navigate("/login")}
            className="text-white font-sans text-xs font-black px-6 py-3 rounded-xl hover:opacity-90 transition-all"
            style={{ backgroundColor: "var(--color-accent)" }}>
            Sign In →
          </button>
        </div>
      </div>
    </PageLayout>
  )

  if (editId && role !== "team" && role !== "admin") return (
    <PageLayout>
      <div className="min-h-screen bg-page flex items-center justify-center px-6">
        <div className="bg-surface border border-red-200 rounded-2xl p-12 text-center max-w-sm">
          <p className="font-heading font-bold text-red-500 uppercase tracking-widest text-sm">Access Denied</p>
          <p className="font-sans text-sm text-subtle mt-2">Only team members can edit posts.</p>
        </div>
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      <div className="min-h-screen bg-page">

        {/* Top bar */}
        <div className="bg-surface border-b border-theme sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={() => navigate("/community")}
              className="flex items-center gap-2 font-sans text-xs font-black text-muted hover:text-accent transition-colors uppercase tracking-widest">
              <IconArrowLeft /> Community
            </button>
            <button onClick={() => setPreview(p => !p)}
              className="flex items-center gap-1.5 font-sans text-[11px] font-black text-muted hover:text-accent transition-colors">
              <IconEye /> {preview ? "Editor" : "Preview"}
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10">

          <div className="mb-8">
            <p className="font-sans text-[11px] font-black text-muted uppercase tracking-widest mb-2">
              {editId ? "Editing Post" : "New Post"}
            </p>
            <h1 className="font-heading font-black text-3xl text-main tracking-tight">
              {editId ? "Update" : "Create"} <span className="text-accent">Post</span>
            </h1>
          </div>

          {msg && (
            <div className="font-sans text-xs font-bold px-4 py-3 mb-6 rounded-xl bg-accent-dim text-accent border border-theme">
              {msg}
            </div>
          )}

          {preview ? (
            <div className="bg-surface border border-theme rounded-2xl p-8 md:p-12">
              <span className="font-sans text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-accent-dim text-accent mb-6 inline-block">
                {form.category}
              </span>
              <h2 className="font-heading font-black text-3xl text-main leading-tight mb-4 mt-4">
                {form.title || "Untitled"}
              </h2>
              {form.excerpt && <p className="font-sans text-lg text-subtle italic mb-8">{form.excerpt}</p>}
              {form.tags && (
                <div className="flex gap-2 flex-wrap mb-8">
                  {form.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="font-sans text-[10px] font-bold text-muted bg-surface-alt border border-theme px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <style>{`
                .wup-md h1 { font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 1.8rem; color: var(--color-txt); margin: 0 0 20px; letter-spacing: -0.03em; border-bottom: 1px solid var(--color-border); padding-bottom: 12px; }
                .wup-md h2 { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.4rem; color: var(--color-txt); margin: 32px 0 14px; }
                .wup-md h3 { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1.15rem; color: var(--color-txt); margin: 24px 0 10px; }
                .wup-md h4 { font-family: sans-serif; font-weight: 700; font-size: 0.9rem; color: var(--color-accent); margin: 18px 0 8px; text-transform: uppercase; letter-spacing: 0.06em; }
                .wup-md p { margin: 0 0 16px; font-size: 15px; line-height: 1.85; color: var(--color-txt-subtle); }
                .wup-md ul, .wup-md ol { margin: 0 0 16px; padding-left: 24px; }
                .wup-md li { margin-bottom: 8px; font-size: 15px; line-height: 1.7; color: var(--color-txt-subtle); }
                .wup-md li::marker { color: var(--color-accent); }
                .wup-md strong { color: var(--color-txt); font-weight: 700; }
                .wup-md em { color: var(--color-txt-muted); font-style: italic; }
                .wup-md code { font-family: monospace; font-size: 13px; background: var(--color-accent-dim); color: var(--color-accent); padding: 2px 7px; border-radius: 5px; }
                .wup-md pre { background: var(--color-surface-alt); border: 1px solid var(--color-border); border-radius: 10px; padding: 18px 22px; margin: 0 0 18px; overflow-x: auto; }
                .wup-md pre code { background: none; color: var(--color-txt-subtle); padding: 0; font-size: 13px; line-height: 1.8; }
                .wup-md blockquote { border-left: 3px solid var(--color-accent); margin: 0 0 16px; padding: 10px 0 10px 18px; color: var(--color-txt-muted); font-style: italic; }
                .wup-md hr { border: none; border-top: 1px solid var(--color-border); margin: 28px 0; }
                .wup-md table { width: 100%; border-collapse: collapse; margin: 0 0 18px; font-size: 14px; }
                .wup-md th { text-align: left; padding: 9px 13px; background: var(--color-accent-dim); color: var(--color-accent); font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid var(--color-border); }
                .wup-md td { padding: 9px 13px; border-bottom: 1px solid var(--color-border-soft); color: var(--color-txt-subtle); }
                .wup-md a { color: var(--color-accent); text-decoration: none; }
                .wup-md a:hover { text-decoration: underline; }
              `}</style>
              <div className="wup-md">
                {form.content ? <ReactMarkdown>{form.content}</ReactMarkdown> : <p className="font-sans text-sm text-muted italic">No content yet.</p>}
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-theme rounded-2xl p-6 md:p-10 flex flex-col gap-6">

              <div>
                <label className="label">Title *</label>
                <input name="title" placeholder="What is this post about?"
                  value={form.title} onChange={handleChange}
                  className="input text-base font-bold py-4" />
              </div>

              <div>
                <label className="label">Summary</label>
                <input name="excerpt" placeholder="A short overview..."
                  value={form.excerpt} onChange={handleChange} className="input" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className="input">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Read Time</label>
                  <input name="readTime" placeholder="5 min read"
                    value={form.readTime} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label">Tags</label>
                  <input name="tags" placeholder="ctf, pentest, sqli"
                    value={form.tags} onChange={handleChange} className="input" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label">Content *</label>
                  <span className="font-sans text-[9px] font-black text-muted uppercase tracking-widest">{form.content.length} chars</span>
                </div>
                <textarea name="content"
                  placeholder={`Write your post here...\n\nTips:\n- Share what you found\n- Include commands or steps\n- Explain the impact`}
                  value={form.content} onChange={handleChange}
                  rows={22} className="input resize-y leading-[1.8]" />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-theme">
                <div className="flex gap-3 w-full sm:w-auto">
                  <button onClick={() => handleSave("published")} disabled={saving}
                    className="flex-1 sm:flex-none text-white font-sans text-sm font-black px-8 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40"
                    style={{ backgroundColor: "var(--color-accent)" }}>
                    {saving ? "Publishing..." : editId ? "Update Post" : "Publish Post"}
                  </button>
                  <button onClick={() => handleSave("draft")} disabled={saving}
                    className="flex-1 sm:flex-none font-sans text-sm font-black px-8 py-3 rounded-xl border border-theme text-subtle hover:opacity-70 transition-all disabled:opacity-40">
                    Save Draft
                  </button>
                </div>
                <button onClick={() => navigate("/community")}
                  className="font-sans text-xs font-black text-red-400 hover:text-red-500 transition-colors uppercase tracking-widest">
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}