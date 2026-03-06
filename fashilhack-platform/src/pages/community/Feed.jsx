import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../../config/firebase"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import PageLayout from "../../components/layout/PageLayout"
import Card from "../../components/ui/Card"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import SectionTag from "../../components/ui/SectionTag"

const CATEGORIES = ["all", "writeup", "blog", "tutorial", "news", "ctf"]

export default function Feed() {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "posts"),
            where("status", "==", "published"),
          )
        )
        const data = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const aTime = a.publishedAt?.toDate?.() || new Date(0)
            const bTime = b.publishedAt?.toDate?.() || new Date(0)
            return bTime - aTime
          })
        setPosts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const filtered = posts
    .filter(p => filter === "all" ? true : p.category === filter)
    .filter(p =>
      search === "" ? true :
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(search.toLowerCase())
    )

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <PageLayout>
      <div className="bg-slate-50 min-h-screen">
        {/* ── TOP HEADER (Subtle) ── */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 flex flex-col items-center text-center">
            <SectionTag text="FashilHack Community" />
            <h1 className="font-heading font-black text-3xl md:text-5xl mt-4 mb-4 text-primary tracking-tight">
              Community <span className="text-secondary">Hub</span>
            </h1>
            <p className="font-sans text-slate-500 max-w-2xl font-medium">
              Daily research, CTF insights, and cybersecurity discussions from the frontlines.
            </p>
          </div>
        </div>

        {/* ── MAIN FEED AREA ── */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* ── LEFT SIDEBAR (Categories) ── */}
            <aside className="lg:w-1/4 order-2 lg:order-1">
              <div className="sticky top-24 space-y-8">
                {/* Categories Card */}
                <Card className="!p-6 border-slate-200 shadow-sm bg-white">
                  <h3 className="font-heading font-black text-xs uppercase tracking-widest text-slate-400 mb-6">
                    Research Topics
                  </h3>
                  <div className="flex flex-col gap-2">
                    {CATEGORIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setFilter(c)}
                        className={`
                          flex items-center justify-between px-4 py-3 rounded-xl font-sans text-sm font-bold transition-all
                          ${filter === c
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                          }
                        `}
                      >
                        <span className="capitalize">{c}</span>
                        {filter === c && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Trending Mock Card */}
                <Card className="!p-6 border-slate-200 shadow-sm bg-white hidden xl:block">
                  <h3 className="font-heading font-black text-xs uppercase tracking-widest text-slate-400 mb-6">
                    Trending Research
                  </h3>
                  <div className="space-y-4">
                    <div className="cursor-pointer group">
                      <p className="font-sans text-[10px] font-black text-accent uppercase tracking-tighter mb-1">Latest</p>
                      <h4 className="font-heading font-bold text-sm text-primary group-hover:text-accent transition-colors">Zero-Day Vulnerability Analysis</h4>
                    </div>
                    <div className="cursor-pointer group font-sans">
                      <p className="font-sans text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Hot Topic</p>
                      <h4 className="font-heading font-bold text-sm text-primary group-hover:text-accent transition-colors">Advanced Pentesting Tools 2026</h4>
                    </div>
                  </div>
                </Card>
              </div>
            </aside>

            {/* ── CENTRAL FEED ── */}
            <main className="lg:w-1/2 order-1 lg:order-2 space-y-8">
              {/* Quick Post Box */}
              <Card className="!p-6 border-slate-200 shadow-sm bg-white flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center font-heading font-black text-primary border border-slate-200 text-sm">
                    {user?.displayName?.[0] || user?.email?.[0] || "U"}
                  </div>
                  <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 cursor-text hover:bg-slate-100 transition-colors flex items-center">
                    <span className="text-slate-400 font-sans text-sm font-medium">Share your latest research or writeup...</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  <div className="flex gap-6">
                    <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-accent font-sans">
                      <span className="text-lg">📄</span> Writeup
                    </button>
                    <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-accent font-sans">
                      <span className="text-lg">💡</span> Idea
                    </button>
                  </div>
                  {(role === "team" || role === "admin") && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate("/community/writeup")}
                    >
                      Create Post
                    </Button>
                  )}
                </div>
              </Card>

              {/* Feed Content */}
              <div className="space-y-6">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="!p-10 border-slate-200 animate-pulse bg-white">
                      <div className="w-1/4 h-2 bg-slate-100 mb-4" />
                      <div className="w-3/4 h-4 bg-slate-100 mb-6" />
                      <div className="w-full h-20 bg-slate-50" />
                    </Card>
                  ))
                ) : filtered.length === 0 ? (
                  <Card className="text-center py-20 w-full bg-white border-dashed border-slate-300">
                    <p className="font-sans text-slate-500 font-medium">
                      No matching posts found.{" "}
                      {search && (
                        <button
                          className="text-accent font-bold hover:underline ml-1"
                          onClick={() => setSearch("")}
                        >
                          Clear search →
                        </button>
                      )}
                    </p>
                  </Card>
                ) : (
                  filtered.map(post => (
                    <Card
                      key={post.id}
                      onClick={() => navigate(`/community/${post.id}`)}
                      className="!p-8 hover:shadow-lg hover:shadow-primary/5 bg-white border-slate-200 cursor-pointer group transition-all"
                    >
                      {/* Author Line */}
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-heading font-black text-primary text-[10px]">
                            {post.authorName?.[0] || post.authorEmail?.[0] || "F"}
                          </div>
                          <div>
                            <p className="font-sans text-sm font-bold text-primary leading-none mb-1">
                              {post.authorName || "FashilHack Member"}
                            </p>
                            <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {post.category || "Post"} • {post.publishedAt?.toDate?.()?.toLocaleDateString() || "Today"}
                            </p>
                          </div>
                        </div>
                        <Badge label={post.category || "General"} type={post.category === "writeup" ? "team" : "community"} />
                      </div>

                      {/* Content Section */}
                      <div className="mb-8">
                        <h2 className="font-heading font-black text-xl md:text-2xl mb-4 text-primary group-hover:text-accent transition-colors leading-tight">
                          {post.title}
                        </h2>
                        <p className="font-sans text-base text-slate-500 font-medium leading-relaxed line-clamp-4">
                          {post.excerpt || post.content?.slice(0, 200) + "..."}
                        </p>
                      </div>

                      {/* Interaction Bar */}
                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex gap-6">
                          <div className="flex items-center gap-2 font-sans text-xs font-bold text-slate-400">
                            <span className="text-base text-slate-300">👁️</span> {Math.floor(Math.random() * 500) + 100}
                          </div>
                          <div className="flex items-center gap-2 font-sans text-xs font-bold text-slate-400">
                            <span className="text-base text-slate-300">💬</span> {Math.floor(Math.random() * 20)}
                          </div>
                          <div className="flex items-center gap-2 font-sans text-xs font-bold text-slate-400">
                            <span className="text-base text-slate-300">🛡️</span> {Math.floor(Math.random() * 50)}
                          </div>
                        </div>
                        <div className="font-sans text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          {post.readTime || "5 Min Read"}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </main>

            {/* ── RIGHT SIDEBAR (Search & Actions) ── */}
            <aside className="lg:w-1/4 order-3 hidden lg:block">
              <div className="sticky top-24 space-y-8">
                {/* Search Box */}
                <Card className="!p-6 border-slate-200 shadow-sm bg-white">
                  <h3 className="font-heading font-black text-xs uppercase tracking-widest text-slate-400 mb-6">
                    Universal Search
                  </h3>
                  <div className="relative">
                    <input
                      placeholder="Keywords..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="
                        w-full bg-slate-50 border border-slate-100
                        text-primary font-sans text-sm px-4 py-3.5 outline-none
                        focus:border-accent transition-colors
                        focus:bg-white rounded-xl placeholder-slate-400
                      "
                    />
                  </div>
                </Card>

                {/* Newsletter Box */}
                <Card className="!p-8 border-none shadow-xl bg-primary text-white text-center flex flex-col items-center overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
                  <h3 className="font-heading font-bold text-lg mb-3 relative">Get Weekly Research</h3>
                  <p className="font-sans text-xs text-white/70 mb-6 relative">The best exploits and defenses delivered to your inbox.</p>
                  <Button variant="secondary" size="sm" full>Subscribe Now</Button>
                </Card>
              </div>
            </aside>

          </div>
        </div>
      </div>
    </PageLayout>
  )
}