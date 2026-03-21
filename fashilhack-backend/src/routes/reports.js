import { Router }      from "express"
import multer          from "multer"
import cloudinary      from "../config/cloudinary.js"
import { db }          from "../config/firebase.js"
import { FieldValue }  from "firebase-admin/firestore"
import { verifyToken } from "../middleware/verifyToken.js"
import https           from "https"
import http            from "http"
import dotenv          from "dotenv"
dotenv.config()

const router  = Router()

const storage = multer.memoryStorage()
const upload  = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true)
    else cb(new Error("Only PDF files are allowed."), false)
  },
})

// Upload PDF as an IMAGE resource type with page:1 -- Cloudinary serves these publicly
// This avoids the raw resource 401 issue entirely
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder:        "fashilhack/reports",
        public_id:     filename,
        format:        "pdf",
        pages:         true,
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
}

// Fetch URL and return Buffer, follows redirects
const fetchBuffer = (targetUrl) => {
  return new Promise((resolve, reject) => {
    const get = (url, hops = 0) => {
      if (hops > 5) return reject(new Error("Too many redirects"))
      const lib = url.startsWith("https") ? https : http
      lib.get(url, (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          return get(res.headers.location, hops + 1)
        }
        if (res.statusCode !== 200) {
          return reject(new Error("HTTP " + res.statusCode))
        }
        const chunks = []
        res.on("data",  c => chunks.push(c))
        res.on("end",   () => resolve(Buffer.concat(chunks)))
        res.on("error", reject)
      }).on("error", reject)
    }
    get(targetUrl)
  })
}

// POST /api/reports/upload
router.post("/upload", verifyToken, upload.single("report"), async (req, res) => {
  const { engagementId, engagementTitle, clientUid, clientName, type } = req.body

  if (!req.file)                             return res.status(400).json({ error: "No PDF file provided." })
  if (!engagementId || !clientUid || !type)  return res.status(400).json({ error: "engagementId, clientUid and type are required." })
  if (!["technical", "executive"].includes(type)) return res.status(400).json({ error: "Type must be technical or executive." })

  try {
    const userSnap = await db.collection("users").doc(req.user.uid).get()
    if (!userSnap.exists) return res.status(403).json({ error: "User not found." })
    const { role } = userSnap.data()
    if (!["team", "admin"].includes(role)) return res.status(403).json({ error: "Only team members can upload reports." })

    const filename = `${engagementId}_${type}_${Date.now()}`
    const result   = await uploadToCloudinary(req.file.buffer, filename)

    console.log("Uploaded to Cloudinary:", result.public_id, "|", result.secure_url)

    const reportRef = await db.collection("reports").add({
      engagementId,
      engagementTitle: engagementTitle || "",
      clientUid,
      clientName:      clientName      || "",
      type,
      fileUrl:         result.secure_url,
      publicId:        result.public_id,
      uploadedBy:      req.user.uid,
      createdAt:       FieldValue.serverTimestamp(),
    })

    return res.status(200).json({ success: true, reportId: reportRef.id, fileUrl: result.secure_url })

  } catch (err) {
    console.error("Report upload error:", err)
    return res.status(500).json({ error: "Failed to upload report." })
  }
})

// GET /api/reports/view/:reportId
router.get("/view/:reportId", verifyToken, async (req, res) => {
  const { reportId } = req.params

  try {
    const reportSnap = await db.collection("reports").doc(reportId).get()
    if (!reportSnap.exists) return res.status(404).json({ error: "Report not found." })

    const report = reportSnap.data()

    const userSnap = await db.collection("users").doc(req.user.uid).get()
    if (!userSnap.exists) return res.status(403).json({ error: "User not found." })
    const { role } = userSnap.data()

    const isTeamOrAdmin = ["team", "admin"].includes(role)
    const isOwner       = role === "client" && report.clientUid === req.user.uid
    if (!isTeamOrAdmin && !isOwner) return res.status(403).json({ error: "Access denied." })

    // Build the correct URL based on resource type
    // New uploads use resource_type:"image" so URL uses /image/upload/
    // Old uploads used resource_type:"raw" so URL uses /raw/upload/
    // We detect by checking the stored fileUrl
    let fetchUrl = report.fileUrl

    // For old raw uploads -- convert to use fl_attachment flag which forces download
    // bypassing the 401 on raw delivery
    if (fetchUrl.includes("/raw/upload/")) {
      // Replace raw/upload with image/upload and add fl_attachment transformation
      // This won't work for truly private files but worth trying
      fetchUrl = fetchUrl.replace("/raw/upload/", "/raw/upload/fl_attachment/")
    }

    console.log("Fetching PDF:", fetchUrl)

    const fileBuffer = await fetchBuffer(fetchUrl)
    console.log("PDF fetched OK, size:", fileBuffer.length, "bytes")

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `inline; filename="${report.engagementTitle || "report"}-${report.type}.pdf"`)
    res.setHeader("Content-Length", fileBuffer.length)
    return res.send(fileBuffer)

  } catch (err) {
    console.error("View report error:", err.message)
    return res.status(500).json({ error: "Failed to retrieve report: " + err.message })
  }
})

// DELETE /api/reports/:reportId
router.delete("/:reportId", verifyToken, async (req, res) => {
  const { reportId } = req.params

  try {
    const userSnap = await db.collection("users").doc(req.user.uid).get()
    const { role } = userSnap.data()
    if (role !== "admin") return res.status(403).json({ error: "Only admin can delete reports." })

    const reportSnap = await db.collection("reports").doc(reportId).get()
    if (!reportSnap.exists) return res.status(404).json({ error: "Report not found." })

    const { publicId } = reportSnap.data()
    // Try both resource types since old files were raw, new ones are image
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
    } catch (_) {
      await cloudinary.uploader.destroy(publicId, { resource_type: "raw" })
    }
    await db.collection("reports").doc(reportId).delete()

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error("Report delete error:", err)
    return res.status(500).json({ error: "Failed to delete report." })
  }
})

export default router