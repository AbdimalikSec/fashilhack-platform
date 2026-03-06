import { Router }     from "express"
import multer         from "multer"
import cloudinary     from "../config/cloudinary.js"
import { db }         from "../config/firebase.js"
import { FieldValue } from "firebase-admin/firestore"
import { verifyToken } from "../middleware/verifyToken.js"
import dotenv          from "dotenv"
dotenv.config()

const router  = Router()

// Multer — store file in memory before uploading to Cloudinary
const storage = multer.memoryStorage()
const upload  = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true)
    } else {
      cb(new Error("Only PDF files are allowed."), false)
    }
  },
})

// Helper — upload buffer to Cloudinary
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder:        "fashilhack/reports",
        public_id:     filename,
        format:        "pdf",
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
}

// ── POST /api/reports/upload ──
// Team only — upload a PDF report for a client
router.post("/upload", verifyToken, upload.single("report"), async (req, res) => {
  const { engagementId, engagementTitle, clientUid, clientName, type } = req.body

  if (!req.file) {
    return res.status(400).json({ error: "No PDF file provided." })
  }
  if (!engagementId || !clientUid || !type) {
    return res.status(400).json({ error: "engagementId, clientUid and type are required." })
  }
  if (!["technical", "executive"].includes(type)) {
    return res.status(400).json({ error: "Type must be technical or executive." })
  }

  try {
    // Verify the caller is team or admin
    const userSnap = await db.collection("users").doc(req.user.uid).get()
    if (!userSnap.exists) {
      return res.status(403).json({ error: "User not found." })
    }
    const { role } = userSnap.data()
    if (!["team", "admin"].includes(role)) {
      return res.status(403).json({ error: "Only team members can upload reports." })
    }

    // Upload to Cloudinary
    const filename = `${engagementId}_${type}_${Date.now()}`
    const result   = await uploadToCloudinary(req.file.buffer, filename)

    // Save report record to Firestore
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

    return res.status(200).json({
      success:  true,
      reportId: reportRef.id,
      fileUrl:  result.secure_url,
    })

  } catch (err) {
    console.error("Report upload error:", err)
    return res.status(500).json({ error: "Failed to upload report." })
  }
})

// ── DELETE /api/reports/:reportId ──
// Admin only — delete a report
router.delete("/:reportId", verifyToken, async (req, res) => {
  const { reportId } = req.params

  try {
    // Verify admin
    const userSnap = await db.collection("users").doc(req.user.uid).get()
    const { role } = userSnap.data()
    if (role !== "admin") {
      return res.status(403).json({ error: "Only admin can delete reports." })
    }

    // Get report to find Cloudinary publicId
    const reportSnap = await db.collection("reports").doc(reportId).get()
    if (!reportSnap.exists) {
      return res.status(404).json({ error: "Report not found." })
    }

    const { publicId } = reportSnap.data()

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" })

    // Delete from Firestore
    await db.collection("reports").doc(reportId).delete()

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error("Report delete error:", err)
    return res.status(500).json({ error: "Failed to delete report." })
  }
})

export default router