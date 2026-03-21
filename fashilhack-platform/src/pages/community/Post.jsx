import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "../../config/firebase"
import { useAuth } from "../../context/AuthContext"
import PageLayout from "../../components/layout/PageLayout"

// ── Icons ──
const IconArrowLeft = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
const IconEdit      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconSend      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IconHeart     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconHeartOut  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconReply     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
const IconMessage   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>

// ── Avatar ──
const Avatar = ({ name, size = 8 }) => (
  <div className={`w-${size} h-${size} rounded-full bg-surface-alt border border-theme flex-shrink-0 flex items-center justify-center font-heading font-black text-main`}
    style={{ fontSize: size <= 6 ? 10 : 13, width: size * 4, height: size * 4 }}>
    {name?.[0]?.toUpperCase() || "?"}
  </div>
)

export default function Post() {
  const { postId }         = useParams()
  const { user, userData } = useAuth()
  const navigate           = useNavigate()

  const [post,       setPost]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [msg,        setMsg]        = useState("")

  // Main comment input
  const [comment,    setComment]    = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Reply state — keyed by comment index
  const [replyOpen,  setReplyOpen]  = useState({})  // { [idx]: bool }
  const [replyText,  setReplyText]  = useState({})  // { [idx]: string }
  const [replySub,   setReplySub]   = useState({})  // { [idx]: bool }

  // Like optimistic state
  const [liking, setLiking] = useState(false)

  const role = userData?.role

  useEffect(() => {
    getDoc(doc(db, "posts", postId))
      .then(snap => { if (snap.exists()) setPost({ id: snap.id, ...snap.data() }) })
      .catch(e => console.warn("post fetch:", e.message))
      .finally(() => setLoading(false))
  }, [postId])

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 2500) }

  // ── Like post ──
  const handleLike = async () => {
    if (!user) { navigate("/login"); return }
    if (liking) return
    setLiking(true)
    const likes     = post.likes || []
    const liked     = likes.includes(user.uid)
    const newLikes  = liked ? likes.filter(id => id !== user.uid) : [...likes, user.uid]
    setPost(p => ({ ...p, likes: newLikes }))
    try {
      await updateDoc(doc(db, "posts", postId), { likes: newLikes })
    } catch (e) {
      setPost(p => ({ ...p, likes: likes })) // revert on fail
    } finally {
      setLiking(false)
    }
  }

  // ── Post comment ──
  const handleComment = async () => {
    if (!comment.trim() || !user) return
    setSubmitting(true)
    try {
      const nc = {
        id:         crypto.randomUUID(),
        uid:        user.uid,
        authorName: userData?.displayName || user.email,
        content:    comment.trim(),
        createdAt:  new Date().toISOString(),
        likes:      [],
        replies:    [],
      }
      await updateDoc(doc(db, "posts", postId), { comments: arrayUnion(nc) })
      setPost(p => ({ ...p, comments: [...(p.comments || []), nc] }))
      setComment("")
      flash("✓ Comment posted.")
    } catch (e) {
      console.error(e)
      flash("⚠ Failed to post comment.")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Like a comment ──
  const handleLikeComment = async (commentIdx) => {
    if (!user) { navigate("/login"); return }
    const comments  = [...(post.comments || [])]
    const c         = { ...comments[commentIdx] }
    const likes     = c.likes || []
    const liked     = likes.includes(user.uid)
    c.likes         = liked ? likes.filter(id => id !== user.uid) : [...likes, user.uid]
    comments[commentIdx] = c
    setPost(p => ({ ...p, comments }))
    try {
      await updateDoc(doc(db, "posts", postId), { comments })
    } catch (e) {
      // revert
      const orig = [...(post.comments || [])]
      setPost(p => ({ ...p, comments: orig }))
    }
  }

  // ── Post reply ──
  const handleReply = async (commentIdx) => {
    const text = (replyText[commentIdx] || "").trim()
    if (!text || !user) return
    setReplySub(s => ({ ...s, [commentIdx]: true }))
    try {
      const comments = [...(post.comments || [])]
      const c        = { ...comments[commentIdx] }
      const nr = {
        id:         crypto.randomUUID(),
        uid:        user.uid,
        authorName: userData?.displayName || user.email,
        content:    text,
        createdAt:  new Date().toISOString(),
        likes:      [],
      }
      c.replies = [...(c.replies || []), nr]
      comments[commentIdx] = c
      await updateDoc(doc(db, "posts", postId), { comments })
      setPost(p => ({ ...p, comments }))
      setReplyText(t => ({ ...t, [commentIdx]: "" }))
      setReplyOpen(o => ({ ...o, [commentIdx]: false }))
    } catch (e) {
      console.error(e)
    } finally {
      setReplySub(s => ({ ...s, [commentIdx]: false }))
    }
  }

  // ── Like a reply ──
  const handleLikeReply = async (commentIdx, replyIdx) => {
    if (!user) { navigate("/login"); return }
    const comments = [...(post.comments || [])]
    const c        = { ...comments[commentIdx] }
    const replies  = [...(c.replies || [])]
    const r        = { ...replies[replyIdx] }
    const likes    = r.likes || []
    r.likes        = likes.includes(user.uid) ? likes.filter(id => id !== user.uid) : [...likes, user.uid]
    replies[replyIdx]    = r
    c.replies            = replies
    comments[commentIdx] = c
    setPost(p => ({ ...p, comments }))
    try {
      await updateDoc(doc(db, "posts", postId), { comments })
    } catch (e) {
      setPost(p => ({ ...p, comments: post.comments }))
    }
  }

  if (loading) return (
    <PageLayout>
      <div className="min-h-screen bg-page flex items-center justify-center">
        <p className="font-sans text-sm text-muted font-black tracking-widest uppercase animate-pulse">Loading...</p>
      </div>
    </PageLayout>
  )

  if (!post) return (
    <PageLayout>
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="bg-surface border border-theme rounded-2xl p-12 text-center max-w-sm">
          <p className="font-heading font-bold text-main mb-6">Post not found.</p>
          <button onClick={() => navigate("/community")}
            className="font-sans text-xs font-black text-accent hover:underline flex items-center gap-2 mx-auto">
            <IconArrowLeft /> Back to Feed
          </button>
        </div>
      </div>
    </PageLayout>
  )

  const postLikes  = post.likes || []
  const userLiked  = user && postLikes.includes(user.uid)
  const comments   = [...(post.comments || [])].reverse()

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
            {(role === "admin" || role === "team") && (
              <button onClick={() => navigate(`/community/writeup?edit=${postId}`)}
                className="flex items-center gap-1.5 font-sans text-[11px] font-black text-muted hover:text-accent transition-colors">
                <IconEdit /> Edit
              </button>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">

          {/* ── META ── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="font-sans text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-accent-dim text-accent">
                {post.category || "post"}
              </span>
              <span className="font-sans text-[11px] text-muted uppercase tracking-widest">
                {post.publishedAt?.toDate?.()?.toLocaleDateString() || "—"}
              </span>
              <span className="font-sans text-[11px] text-muted uppercase tracking-widest">
                {post.readTime || "5 min read"}
              </span>
            </div>

            <h1 className="font-heading font-black text-3xl md:text-4xl text-main leading-tight mb-5">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="font-sans text-lg text-subtle leading-relaxed mb-6 italic">{post.excerpt}</p>
            )}

            {/* Author strip */}
            <div className="flex items-center justify-between py-4 border-y border-theme">
              <div className="flex items-center gap-3">
                <Avatar name={post.authorName} size={9} />
                <div>
                  <p className="font-sans text-sm font-black text-main leading-none mb-0.5">{post.authorName || "FashilHack Team"}</p>
                  <p className="font-sans text-[10px] text-muted uppercase tracking-wider">Author</p>
                </div>
              </div>
              {post.tags?.length > 0 && (
                <div className="hidden sm:flex gap-2 flex-wrap justify-end">
                  {post.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="font-sans text-[10px] font-bold text-muted bg-surface-alt border border-theme px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── CONTENT ── */}
          <div className="font-sans text-base text-subtle leading-[1.9] whitespace-pre-line mb-10">
            {post.content}
          </div>

          {/* ── REACTIONS BAR ── */}
          <div className="flex items-center gap-6 py-5 border-y border-theme mb-12">
            {/* Like post */}
            <button
              onClick={handleLike}
              disabled={liking}
              className="flex items-center gap-2 transition-all group"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <span style={{
                width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: userLiked ? "rgba(239,68,68,0.12)" : "var(--color-surface-alt)",
                border: `1px solid ${userLiked ? "rgba(239,68,68,0.3)" : "var(--color-border)"}`,
                color: userLiked ? "#ef4444" : "var(--color-txt-muted)",
                transition: "all 0.15s",
              }}>
                {userLiked ? <IconHeart /> : <IconHeartOut />}
              </span>
              <span className="font-sans text-sm font-bold text-muted">
                {postLikes.length} {postLikes.length === 1 ? "like" : "likes"}
              </span>
            </button>

            {/* Comment count */}
            <div className="flex items-center gap-2">
              <span style={{
                width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: "var(--color-surface-alt)", border: "1px solid var(--color-border)",
                color: "var(--color-txt-muted)",
              }}>
                <IconMessage />
              </span>
              <span className="font-sans text-sm font-bold text-muted">
                {post.comments?.length || 0} {(post.comments?.length || 0) === 1 ? "comment" : "comments"}
              </span>
            </div>
          </div>

          {/* ── COMMENTS SECTION ── */}
          <div id="comments">
            <h2 className="font-heading font-black text-xl text-main mb-8 tracking-tight">
              Discussion
            </h2>

            {msg && (
              <div className="font-sans text-xs font-bold px-4 py-3 mb-5 rounded-xl bg-accent-dim text-accent border border-theme">
                {msg}
              </div>
            )}

            {/* Main comment input */}
            {user ? (
              <div className="flex items-start gap-3 mb-10">
                <Avatar name={userData?.displayName || user.email} size={9} />
                <div className="flex-1">
                  <textarea
                    rows={3}
                    placeholder="Share your thoughts..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleComment() }}
                    className="input mb-2 resize-none"
                    style={{ borderRadius: 12 }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] text-muted">⌘ + Enter to post</span>
                    <button
                      onClick={handleComment}
                      disabled={submitting || !comment.trim()}
                      className="flex items-center gap-2 text-white font-sans text-xs font-black px-5 py-2 rounded-xl hover:opacity-90 transition-all disabled:opacity-40"
                      style={{ backgroundColor: "var(--color-accent)" }}
                    >
                      <IconSend />
                      {submitting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface-alt border border-theme rounded-2xl p-6 mb-10 text-center">
                <p className="font-sans text-sm text-subtle mb-3">Join the discussion</p>
                <button
                  onClick={() => navigate("/login")}
                  className="font-sans text-sm font-black text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-all"
                  style={{ backgroundColor: "var(--color-accent)" }}
                >
                  Sign In to Comment
                </button>
              </div>
            )}

            {/* Comments list */}
            {comments.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-theme rounded-2xl">
                <p className="font-sans text-sm text-muted mb-1">No comments yet.</p>
                <p className="font-sans text-xs text-muted">Be the first to start the discussion.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {comments.map((c, idx) => {
                  // idx in reversed array — find original index for mutations
                  const origIdx  = (post.comments || []).length - 1 - idx
                  const cLikes   = c.likes || []
                  const cLiked   = user && cLikes.includes(user.uid)
                  const replies  = c.replies || []
                  const isOpen   = replyOpen[origIdx]

                  return (
                    <div key={c.id || idx}>
                      {/* ── COMMENT BUBBLE ── */}
                      <div className="flex items-start gap-3 group py-3">
                        <Avatar name={c.authorName} size={8} />
                        <div className="flex-1 min-w-0">
                          {/* Bubble */}
                          <div className="bg-surface-alt border border-theme rounded-2xl rounded-tl-sm px-4 py-3 inline-block w-full">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-sans text-xs font-black text-main">{c.authorName || "Member"}</span>
                              <span className="font-sans text-[10px] text-muted">·</span>
                              <span className="font-sans text-[10px] text-muted">
                                {new Date(c.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              </span>
                            </div>
                            <p className="font-sans text-sm text-subtle leading-relaxed">{c.content}</p>
                          </div>

                          {/* Actions row */}
                          <div className="flex items-center gap-4 mt-1.5 px-1">
                            {/* Like comment */}
                            <button
                              onClick={() => user ? handleLikeComment(origIdx) : navigate("/login")}
                              className="flex items-center gap-1.5 transition-all"
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                            >
                              <span style={{ color: cLiked ? "#ef4444" : "var(--color-txt-muted)", transition: "color 0.15s" }}>
                                {cLiked ? <IconHeart /> : <IconHeartOut />}
                              </span>
                              {cLikes.length > 0 && (
                                <span className="font-sans text-[11px] font-bold text-muted">{cLikes.length}</span>
                              )}
                            </button>

                            {/* Reply button */}
                            {user && (
                              <button
                                onClick={() => setReplyOpen(o => ({ ...o, [origIdx]: !o[origIdx] }))}
                                className="flex items-center gap-1.5 font-sans text-[11px] font-bold text-muted hover:text-accent transition-colors"
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                              >
                                <IconReply />
                                {isOpen ? "Cancel" : "Reply"}
                              </button>
                            )}

                            {replies.length > 0 && (
                              <span className="font-sans text-[11px] text-muted">
                                {replies.length} {replies.length === 1 ? "reply" : "replies"}
                              </span>
                            )}
                          </div>

                          {/* ── REPLY INPUT ── */}
                          {isOpen && (
                            <div className="flex items-start gap-2 mt-3 ml-1">
                              <Avatar name={userData?.displayName || user?.email} size={6} />
                              <div className="flex-1">
                                <textarea
                                  rows={2}
                                  autoFocus
                                  placeholder={`Replying to ${c.authorName}...`}
                                  value={replyText[origIdx] || ""}
                                  onChange={e => setReplyText(t => ({ ...t, [origIdx]: e.target.value }))}
                                  onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleReply(origIdx) }}
                                  className="input resize-none mb-2"
                                  style={{ fontSize: 13, borderRadius: 10 }}
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => setReplyOpen(o => ({ ...o, [origIdx]: false }))}
                                    className="font-sans text-xs font-bold text-muted hover:text-main transition-colors px-3 py-1.5 rounded-lg border border-theme"
                                    style={{ background: "none", cursor: "pointer" }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleReply(origIdx)}
                                    disabled={replySub[origIdx] || !replyText[origIdx]?.trim()}
                                    className="flex items-center gap-1.5 font-sans text-xs font-black text-white px-4 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-40 transition-all"
                                    style={{ backgroundColor: "var(--color-accent)", border: "none", cursor: "pointer" }}
                                  >
                                    <IconSend />
                                    {replySub[origIdx] ? "Posting..." : "Reply"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ── REPLIES ── */}
                          {replies.length > 0 && (
                            <div className="mt-2 ml-4 pl-4 border-l-2 border-theme space-y-1">
                              {replies.map((r, ri) => {
                                const rLikes = r.likes || []
                                const rLiked = user && rLikes.includes(user.uid)
                                return (
                                  <div key={r.id || ri} className="flex items-start gap-2 py-2 group">
                                    <Avatar name={r.authorName} size={6} />
                                    <div className="flex-1 min-w-0">
                                      <div className="bg-surface border border-theme rounded-2xl rounded-tl-sm px-3 py-2.5 inline-block w-full">
                                        <div className="flex items-center gap-2 mb-1.5">
                                          <span className="font-sans text-[11px] font-black text-main">{r.authorName || "Member"}</span>
                                          <span className="font-sans text-[10px] text-muted">·</span>
                                          <span className="font-sans text-[10px] text-muted">
                                            {new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                          </span>
                                        </div>
                                        <p className="font-sans text-sm text-subtle leading-relaxed">{r.content}</p>
                                      </div>
                                      {/* Like reply */}
                                      <div className="flex items-center gap-2 mt-1 px-1">
                                        <button
                                          onClick={() => user ? handleLikeReply(origIdx, ri) : navigate("/login")}
                                          className="flex items-center gap-1.5 transition-all"
                                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                                        >
                                          <span style={{ color: rLiked ? "#ef4444" : "var(--color-txt-muted)", transition: "color 0.15s" }}>
                                            {rLiked ? <IconHeart /> : <IconHeartOut />}
                                          </span>
                                          {rLikes.length > 0 && (
                                            <span className="font-sans text-[11px] font-bold text-muted">{rLikes.length}</span>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Divider between top-level comments */}
                      {idx < comments.length - 1 && (
                        <div className="border-b border-theme mx-2 opacity-50" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}