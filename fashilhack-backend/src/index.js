import express    from "express"
import cors       from "cors"
import dotenv     from "dotenv"
import contactRouter  from "./routes/contact.js"
import reportsRouter  from "./routes/reports.js"
import notifyRouter   from "./routes/notify.js"

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ──
app.use(cors({
  origin: [
    "http://localhost:5173",          // local frontend dev
    "https://fashilhack.so",          // production domain
    "https://www.fashilhack.so",
  ],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ──
app.use("/api/contact", contactRouter)
app.use("/api/reports", reportsRouter)
app.use("/api/notify",  notifyRouter)

// ── Health check ──
app.get("/", (req, res) => {
  res.json({
    status:  "online",
    service: "FashilHack API",
    version: "1.0.0",
  })
})

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." })
})

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ error: err.message || "Internal server error." })
})

// ── Start ──
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════╗
  ║   FashilHack API — Online      ║
  ║   Port: ${PORT}                    ║
  ╚════════════════════════════════╝
  `)
})