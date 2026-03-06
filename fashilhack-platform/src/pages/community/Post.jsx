import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "../../config/firebase"
import { useAuth } from "../../context/AuthContext"
import PageLayout from "../../components/layout/PageLayout"
import Card from "../../components/ui/Card"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import SectionTag from "../../components/ui/SectionTag"

export default function Post() {
  const { postId } = useParams()
  const { user, userData, role } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "posts", postId))
        if (snap.exists()) setPost({ id: snap.id, ...snap.data() })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [postId])

  const flash = (text) => {
    setMsg(text)
    setTimeout(() => setMsg(""), 2500)
  }

  const handleComment = async () => {
    if (!comment.trim()) return
    if (!user) { navigate("/login"); return }

    setSubmitting(true)
    try {
      const newComment = {
        uid: user.uid,
        authorName: userData?.displayName || user.email,
        content: comment.trim(),
        createdAt: new Date().toISOString(),
      }
      await updateDoc(doc(db, "posts", postId), {
        comments: arrayUnion(newComment)
      })
      setPost(p => ({
        ...p,
        comments: [...(p.comments || []), newComment]
      }))
      setComment("")
      flash("✓ Comment posted.")
    } catch (err) {
      flash("⚠ Failed to post comment.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <p className="font-heading font-bold text-primary text-sm tracking-widest">LOADING CONTENT...</p>
      </div>
    </PageLayout>
  )

  if (!post) return (
    <PageLayout>
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <Card className="flex flex-col items-center gap-8 py-16">
          <p className="font-heading font-bold text-xl text-primary">Post not found.</p>
          <Button
            variant="ghost"
            onClick={() => navigate("/community")}
          >
            ← Back to Feed
          </Button>
        </Card>
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-6 py-14 flex flex-col items-center">

        {/* Header Section */}
        <div className="w-full text-center flex flex-col items-center mb-16">
          <button
            onClick={() => navigate("/community")}
            className="
              font-sans text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase
              hover:text-accent transition-colors mb-12 flex items-center gap-2
            "
          >
            ← Back to Community
          </button>

          <div className="flex items-center gap-4 mb-6 justify-center">
            <Badge
              label={post.category || "post"}
              type={post.category === "writeup" ? "team" : "community"}
            />
            <span className="h-1 w-1 rounded-full bg-slate-200" />
            <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {post.publishedAt?.toDate?.()?.toLocaleDateString() || "—"}
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-200" />
            <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {post.readTime || "5 MIN READ"}
            </span>
          </div>

          <h1 className="font-heading font-bold text-3xl md:text-5xl leading-tight mb-8 text-primary max-w-3xl">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 py-8 border-y border-slate-100 w-full justify-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-heading font-bold text-primary text-sm">
                {post.authorName?.[0] || "F"}
              </div>
              <div className="text-left">
                <p className="font-sans text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Published By</p>
                <p className="font-sans text-sm font-bold text-primary leading-none uppercase">{post.authorName || "FashilHack Team"}</p>
              </div>
            </div>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="hidden sm:flex gap-3 ml-8 pl-8 border-l border-slate-100">
                {post.tags.map(tag => (
                  <span key={tag} className="
                    font-sans text-[10px] font-bold text-slate-400
                    bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-widest
                  ">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-3xl w-full">
          <div className="
            font-sans text-lg text-slate-600 leading-[1.8]
            whitespace-pre-line mb-24 font-medium
            [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-primary
            [&_h2]:text-2xl [&_h2]:mt-12 [&_h2]:mb-6
            [&_code]:bg-slate-50 [&_code]:text-accent
            [&_code]:px-2 [&_code]:py-1 [&_code]:rounded-md [&_code]:font-mono [&_code]:text-sm
          ">
            {post.content}
          </div>

          {/* Admin/Team edit button */}
          {(role === "admin" || role === "team") && (
            <div className="mb-20 pt-10 border-t border-slate-100 flex justify-center">
              <Button
                variant="ghost"
                onClick={() => navigate(`/community/writeup?edit=${postId}`)}
              >
                Edit Research Paper →
              </Button>
            </div>
          )}

          {/* Flash */}
          {msg && (
            <div className="
              font-sans text-xs font-bold px-5 py-4 mb-8
              border-2 border-slate-100 bg-slate-50
              text-primary text-center rounded-xl
            ">
              {msg}
            </div>
          )}

          {/* Comments */}
          <div className="bg-slate-50/50 rounded-3xl p-10 md:p-14 border border-slate-100">
            <SectionTag text={`${post.comments?.length || 0} Discussions`} />

            {/* Comment input */}
            {user ? (
              <div className="mt-8 mb-12">
                <textarea
                  rows={4}
                  placeholder="Share your perspective or ask a technical question..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="
                    w-full bg-white border-2 border-slate-100
                    text-primary font-sans text-sm px-5 py-4 outline-none
                    focus:border-accent transition-colors
                    placeholder-slate-400 rounded-2xl resize-none mb-4
                  "
                />
                <Button
                  variant="primary"
                  onClick={handleComment}
                  disabled={submitting || !comment.trim()}
                >
                  {submitting ? "Submitting..." : "Join Discussion →"}
                </Button>
              </div>
            ) : (
              <div className="
                bg-white border-2 border-slate-100 border-dashed
                p-10 mt-8 mb-12 rounded-3xl text-center
              ">
                <p className="font-sans text-sm text-slate-500 font-medium">
                  <button
                    className="text-accent font-bold hover:underline"
                    onClick={() => navigate("/login")}
                  >
                    Authenticate
                  </button>
                  {" "}to participate in researchers' discussions.
                </p>
              </div>
            )}

            {/* Comments list */}
            <div className="flex flex-col gap-6">
              {(post.comments || []).length === 0 ? (
                <p className="font-sans text-sm text-slate-400 italic text-center py-10">
                  Secure communication channel clear. Be the first to start a discussion.
                </p>
              ) : [...(post.comments || [])].reverse().map((c, i) => (
                <div
                  key={i}
                  className="
                    bg-white border border-slate-100
                    p-6 rounded-2xl shadow-sm
                  "
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center font-heading font-bold text-primary text-[10px]">
                        {c.authorName?.[0] || "U"}
                      </div>
                      <span className="font-sans text-xs font-black text-primary uppercase tracking-widest">
                        {c.authorName || "Anonymous Researcher"}
                      </span>
                    </div>
                    <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-sans text-sm text-slate-600 leading-relaxed font-normal">
                    {c.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}