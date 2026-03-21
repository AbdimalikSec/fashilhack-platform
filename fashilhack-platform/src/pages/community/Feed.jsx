import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../../config/firebase"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import PageLayout from "../../components/layout/PageLayout"

const CATEGORIES = ["all","writeup","blog","tutorial","news","ctf"]

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconPen = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
)
const IconMessage = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconHeart = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const IconHeartOut = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const IconReply = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
  </svg>
)

export default function Feed() {
  const { user, userData } = useAuth()
  const navigate = useNavigate()
  const [posts,   setPosts]   = useState([])
  const [filter,  setFilter]  = useState("all")
  const [search,  setSearch]  = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDocs(query(collection(db, "posts"), where("status", "==", "published")))
      .then(snap => {
        const data = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.publishedAt?.toDate?.() || 0) - (a.publishedAt?.toDate?.() || 0))
        setPosts(data)
      })
      .catch(e => console.warn("posts:", e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = posts
    .filter(p => filter === "all" || p.category === filter)
    .filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase()))

  return (
    <PageLayout>
      <div className="min-h-screen bg-page">

        {/* Top bar */}
        <div className="bg-surface border-b border-theme sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

            <div className="flex items-center gap-6">
              <span className="font-heading font-black text-lg text-main tracking-tight">Community</span>
              <div className="hidden md:flex items-center gap-1">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setFilter(c)}
                    className="font-sans text-[11px] font-black px-3 py-1.5 rounded-lg capitalize transition-all"
                    style={{
                      backgroundColor: filter === c ? "var(--color-accent)" : "transparent",
                      color: filter === c ? "white" : "var(--color-txt-muted)",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-surface-alt border border-theme rounded-xl px-3 py-2">
                <span className="text-muted"><IconSearch /></span>
                <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  className="bg-transparent outline-none font-sans text-sm w-36 text-main placeholder:text-muted" />
              </div>

              {user ? (
                <button onClick={() => navigate("/community/writeup")}
                  className="flex items-center gap-2 text-white font-sans text-xs font-black px-4 py-2 rounded-xl hover:opacity-90 transition-all"
                  style={{ backgroundColor: "var(--color-accent)" }}>
                  <IconPen /> Write
                </button>
              ) : (
                <button onClick={() => navigate("/login")}
                  className="font-sans text-xs font-black px-4 py-2 rounded-xl border border-theme text-muted hover:text-main transition-all">
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile filter */}
          <div className="md:hidden flex gap-1 overflow-x-auto px-6 pb-3">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className="font-sans text-[11px] font-black px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-all"
                style={{
                  backgroundColor: filter === c ? "var(--color-accent)" : "transparent",
                  color: filter === c ? "white" : "var(--color-txt-muted)",
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Feed + Sidebar */}
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">

          {/* Posts */}
          <main className="flex-1 space-y-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-surface border border-theme rounded-2xl p-6 animate-pulse">
                  <div className="h-3 bg-surface-alt rounded w-1/4 mb-3" />
                  <div className="h-5 bg-surface-alt rounded w-3/4 mb-4" />
                  <div className="h-12 bg-surface-alt rounded" />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="bg-surface border border-theme border-dashed rounded-2xl p-16 text-center">
                <p className="text-sm text-muted">
                  No posts found.{" "}
                  {search && <button className="text-accent font-bold hover:underline" onClick={() => setSearch("")}>Clear search</button>}
                </p>
              </div>
            ) : filtered.map(post => (
              <div key={post.id} onClick={() => navigate(`/community/${post.id}`)}
                className="bg-surface border border-theme rounded-2xl p-6 cursor-pointer group transition-all hover:border-theme"
                style={{ "--tw-shadow": "none" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-accent)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--color-border)"}
              >
                {/* Author */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-alt border border-theme flex items-center justify-center font-heading font-black text-main text-xs">
                      {post.authorName?.[0] || "F"}
                    </div>
                    <div>
                      <p className="font-sans text-xs font-black text-main leading-none mb-0.5">{post.authorName || "FashilHack Member"}</p>
                      <p className="font-sans text-[10px] text-muted uppercase tracking-wider">
                        {post.publishedAt?.toDate?.()?.toLocaleDateString() || "Today"}
                      </p>
                    </div>
                  </div>
                  <span className="font-sans text-[10px] font-black text-muted uppercase tracking-widest px-2 py-1 rounded-md bg-surface-alt capitalize">
                    {post.category || "post"}
                  </span>
                </div>

                {/* Title + excerpt */}
                <h2 className="font-heading font-black text-lg text-main mb-2 leading-snug group-hover:text-accent transition-colors">
                  {post.title}
                </h2>
                <p className="font-sans text-sm text-subtle leading-relaxed line-clamp-2 mb-4">
                  {post.excerpt || post.content?.slice(0, 160) + "..."}
                </p>

                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-4">
                    {post.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="font-sans text-[10px] font-bold text-muted bg-surface-alt px-2 py-1 rounded-md uppercase tracking-wider">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-theme">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-sans text-xs text-muted">
                      <span style={{ color: (post.likes?.length || 0) > 0 ? "#ef4444" : "var(--color-txt-muted)" }}>
                        {(post.likes?.length || 0) > 0 ? <IconHeart /> : <IconHeartOut />}
                      </span>
                      {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1.5 font-sans text-xs text-muted">
                      <IconMessage /> {post.comments?.length || 0}
                    </span>
                    {(post.comments || []).reduce((a, c) => a + (c.replies?.length || 0), 0) > 0 && (
                      <span className="flex items-center gap-1.5 font-sans text-xs text-muted">
                        <IconReply /> {(post.comments || []).reduce((a, c) => a + (c.replies?.length || 0), 0)}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1.5 font-sans text-[10px] font-black text-muted uppercase tracking-widest">
                    <IconClock /> {post.readTime || "5 min read"}
                  </span>
                </div>
              </div>
            ))}
          </main>

          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-5">

              {user && (
                <div className="bg-surface border border-theme rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-surface-alt border border-theme flex items-center justify-center font-heading font-black text-main text-sm">
                      {userData?.displayName?.[0] || user?.email?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-sans text-sm font-black text-main">{userData?.displayName || "Member"}</p>
                      <p className="font-sans text-[10px] text-muted uppercase tracking-wider">{userData?.role || "community"}</p>
                    </div>
                  </div>
                  <button onClick={() => navigate("/community/writeup")}
                    className="w-full text-white font-sans text-xs font-black py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: "var(--color-accent)" }}>
                    <IconPen /> Write a Post
                  </button>
                </div>
              )}

              <div className="bg-surface border border-theme rounded-2xl p-5">
                <p className="font-sans text-[10px] font-black text-muted uppercase tracking-widest mb-4">Stats</p>
                {[
                  { label: "Total Posts",  value: posts.length },
                  { label: "This Month",   value: posts.filter(p => p.publishedAt?.toDate?.()?.getMonth() === new Date().getMonth()).length },
                  { label: "Writeups",     value: posts.filter(p => p.category === "writeup").length },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2 border-b border-theme last:border-0">
                    <span className="font-sans text-xs text-subtle">{s.label}</span>
                    <span className="font-sans text-xs font-black text-main">{s.value}</span>
                  </div>
                ))}
              </div>


            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  )
}