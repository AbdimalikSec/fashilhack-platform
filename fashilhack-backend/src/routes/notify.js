import { Router }     from "express"
import nodemailer     from "nodemailer"
import { db }         from "../config/firebase.js"
import { verifyToken } from "../middleware/verifyToken.js"
import dotenv          from "dotenv"
dotenv.config()

const router = Router()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

// Helper — get client email from Firestore
const getClientEmail = async (clientUid) => {
  const snap = await db.collection("users").doc(clientUid).get()
  if (!snap.exists) return null
  return snap.data().email
}

// ── POST /api/notify/finding ──
// Called by team when a new finding is logged
router.post("/finding", verifyToken, async (req, res) => {
  const { clientUid, clientName, findingTitle, severity, engagementTitle } = req.body

  if (!clientUid || !findingTitle || !severity) {
    return res.status(400).json({ error: "clientUid, findingTitle and severity are required." })
  }

  try {
    // Verify caller is team or admin
    const callerSnap = await db.collection("users").doc(req.user.uid).get()
    const { role }   = callerSnap.data()
    if (!["team", "admin"].includes(role)) {
      return res.status(403).json({ error: "Not authorized." })
    }

    const clientEmail = await getClientEmail(clientUid)
    if (!clientEmail) {
      return res.status(404).json({ error: "Client email not found." })
    }

    const severityColors = {
      critical: "#ff4444",
      high:     "#ff8c00",
      medium:   "#f7c948",
      low:      "#00aaff",
      info:     "#8fa8b8",
    }
    const color = severityColors[severity] || "#8fa8b8"

    await transporter.sendMail({
      from:    `"FashilHack" <${process.env.GMAIL_USER}>`,
      to:      clientEmail,
      subject: `[${severity.toUpperCase()}] New Finding — ${engagementTitle || "Your Engagement"}`,
      html: `
        <div style="font-family:monospace; background:#050d12; color:#e0eef5; padding:32px;">
          <h2 style="color:#00e5a0; margin-bottom:8px;">New Finding Discovered</h2>
          <p style="color:#8fa8b8; margin-bottom:24px;">
            A new vulnerability has been identified in your engagement.
          </p>

          <div style="border:1px solid #071520; padding:16px; margin-bottom:24px;">
            <table style="width:100%;">
              <tr>
                <td style="color:#8fa8b8; padding:6px 0; width:140px;">Finding</td>
                <td style="color:#fff;">${findingTitle}</td>
              </tr>
              <tr>
                <td style="color:#8fa8b8; padding:6px 0;">Severity</td>
                <td style="color:${color}; text-transform:uppercase; font-weight:bold;">
                  ${severity}
                </td>
              </tr>
              <tr>
                <td style="color:#8fa8b8; padding:6px 0;">Engagement</td>
                <td style="color:#fff;">${engagementTitle || "—"}</td>
              </tr>
            </table>
          </div>

          <p style="color:#8fa8b8; line-height:1.7;">
            Log in to your FashilHack portal to view the full details,
            impact assessment and remediation steps.
          </p>

          <a href="${process.env.FRONTEND_URL}/client/findings"
            style="
              display:inline-block; margin-top:16px;
              background:#00e5a0; color:#050d12;
              padding:12px 24px; text-decoration:none;
              font-weight:bold; letter-spacing:0.1em;
            "
          >
            VIEW FINDING →
          </a>

          <hr style="border-color:#071520; margin:32px 0;" />
          <p style="color:#8fa8b8; font-size:12px;">
            FashilHack — Simulating Attacks, Securing Businesses.
          </p>
        </div>
      `,
    })

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error("Notify finding error:", err)
    return res.status(500).json({ error: "Failed to send notification." })
  }
})

// ── POST /api/notify/report ──
// Called when a report is ready for a client
router.post("/report", verifyToken, async (req, res) => {
  const { clientUid, clientName, engagementTitle, reportType, fileUrl } = req.body

  if (!clientUid || !engagementTitle || !reportType) {
    return res.status(400).json({ error: "clientUid, engagementTitle and reportType are required." })
  }

  try {
    // Verify caller is team or admin
    const callerSnap = await db.collection("users").doc(req.user.uid).get()
    const { role }   = callerSnap.data()
    if (!["team", "admin"].includes(role)) {
      return res.status(403).json({ error: "Not authorized." })
    }

    const clientEmail = await getClientEmail(clientUid)
    if (!clientEmail) {
      return res.status(404).json({ error: "Client email not found." })
    }

    await transporter.sendMail({
      from:    `"FashilHack" <${process.env.GMAIL_USER}>`,
      to:      clientEmail,
      subject: `Your ${reportType} Report Is Ready — ${engagementTitle}`,
      html: `
        <div style="font-family:monospace; background:#050d12; color:#e0eef5; padding:32px;">
          <h2 style="color:#00e5a0; margin-bottom:8px;">Your Report Is Ready</h2>
          <p style="color:#8fa8b8; margin-bottom:24px;">
            Your ${reportType} report for <strong style="color:#fff;">
            ${engagementTitle}</strong> has been completed and is now
            available in your portal.
          </p>

          <div style="border:1px solid #071520; padding:16px; margin-bottom:24px;">
            <table style="width:100%;">
              <tr>
                <td style="color:#8fa8b8; padding:6px 0; width:140px;">Engagement</td>
                <td style="color:#fff;">${engagementTitle}</td>
              </tr>
              <tr>
                <td style="color:#8fa8b8; padding:6px 0;">Report Type</td>
                <td style="color:#00e5a0; text-transform:capitalize;">
                  ${reportType}
                </td>
              </tr>
            </table>
          </div>

          <a href="${process.env.FRONTEND_URL}/client/reports"
            style="
              display:inline-block; margin-top:8px;
              background:#00e5a0; color:#050d12;
              padding:12px 24px; text-decoration:none;
              font-weight:bold; letter-spacing:0.1em;
            "
          >
            DOWNLOAD REPORT →
          </a>

          <hr style="border-color:#071520; margin:32px 0;" />
          <p style="color:#8fa8b8; font-size:12px;">
            FashilHack — Simulating Attacks, Securing Businesses.
          </p>
        </div>
      `,
    })

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error("Notify report error:", err)
    return res.status(500).json({ error: "Failed to send notification." })
  }
})

// ── POST /api/notify/approved ──
// Called when admin approves a user
router.post("/approved", verifyToken, async (req, res) => {
  const { clientUid, displayName, role } = req.body

  if (!clientUid || !role) {
    return res.status(400).json({ error: "clientUid and role are required." })
  }

  try {
    const clientEmail = await getClientEmail(clientUid)
    if (!clientEmail) {
      return res.status(404).json({ error: "User email not found." })
    }

    const portalLinks = {
      client:    "/client",
      team:      "/team",
      community: "/community",
      admin:     "/admin",
    }
    const portal = portalLinks[role] || "/"

    await transporter.sendMail({
      from:    `"FashilHack" <${process.env.GMAIL_USER}>`,
      to:      clientEmail,
      subject: "Your FashilHack Account Has Been Approved",
      html: `
        <div style="font-family:monospace; background:#050d12; color:#e0eef5; padding:32px;">
          <h2 style="color:#00e5a0; margin-bottom:8px;">Account Approved</h2>
          <p style="color:#8fa8b8; line-height:1.7; margin-bottom:24px;">
            Hi ${displayName || "there"},<br><br>
            Your FashilHack account has been reviewed and approved.
            You now have access to the
            <strong style="color:#fff; text-transform:capitalize;">
              ${role}
            </strong> portal.
          </p>

          <a href="${process.env.FRONTEND_URL}${portal}"
            style="
              display:inline-block;
              background:#00e5a0; color:#050d12;
              padding:12px 24px; text-decoration:none;
              font-weight:bold; letter-spacing:0.1em;
            "
          >
            ACCESS YOUR PORTAL →
          </a>

          <hr style="border-color:#071520; margin:32px 0;" />
          <p style="color:#8fa8b8; font-size:12px;">
            FashilHack — Simulating Attacks, Securing Businesses.
          </p>
        </div>
      `,
    })

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error("Notify approved error:", err)
    return res.status(500).json({ error: "Failed to send approval email." })
  }
})

export default router