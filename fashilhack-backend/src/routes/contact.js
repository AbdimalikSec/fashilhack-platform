import { Router }     from "express"
import nodemailer     from "nodemailer"
import { db }         from "../config/firebase.js"
import { FieldValue } from "firebase-admin/firestore"
import dotenv         from "dotenv"
dotenv.config()

const router = Router()

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

// ── POST /api/contact ──
router.post("/", async (req, res) => {
  const { name, email, company, service, message } = req.body

  // Validate
  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Name, email and message are required."
    })
  }

  try {
    // 1. Save to Firestore
    await db.collection("contacts").add({
      name,
      email,
      company:   company  || "",
      service:   service  || "",
      message,
      createdAt: FieldValue.serverTimestamp(),
      read:      false,
    })

    // 2. Send email to you
    await transporter.sendMail({
      from:    `"FashilHack Contact" <${process.env.GMAIL_USER}>`,
      to:      process.env.CONTACT_RECEIVER,
      subject: `New Inquiry from ${name} — FashilHack`,
      html: `
        <div style="font-family:monospace; background:#050d12; color:#e0eef5; padding:32px;">
          <h2 style="color:#00e5a0; margin-bottom:24px;">
            New Contact Form Submission
          </h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="color:#8fa8b8; padding:8px 0; width:120px;">Name</td>
              <td style="color:#fff;">${name}</td>
            </tr>
            <tr>
              <td style="color:#8fa8b8; padding:8px 0;">Email</td>
              <td style="color:#00aaff;">${email}</td>
            </tr>
            <tr>
              <td style="color:#8fa8b8; padding:8px 0;">Company</td>
              <td style="color:#fff;">${company || "—"}</td>
            </tr>
            <tr>
              <td style="color:#8fa8b8; padding:8px 0;">Service</td>
              <td style="color:#fff;">${service || "—"}</td>
            </tr>
            <tr>
              <td style="color:#8fa8b8; padding:8px 0; vertical-align:top;">Message</td>
              <td style="color:#fff; white-space:pre-line;">${message}</td>
            </tr>
          </table>
          <p style="color:#8fa8b8; margin-top:32px; font-size:12px;">
            Sent from fashilhack.so contact form
          </p>
        </div>
      `,
    })

    // 3. Send confirmation email to sender
    await transporter.sendMail({
      from:    `"FashilHack" <${process.env.GMAIL_USER}>`,
      to:      email,
      subject: "We received your message — FashilHack",
      html: `
        <div style="font-family:monospace; background:#050d12; color:#e0eef5; padding:32px;">
          <h2 style="color:#00e5a0;">Message Received</h2>
          <p style="color:#8fa8b8; line-height:1.7;">
            Hi ${name},<br><br>
            Thank you for reaching out to FashilHack. We've received your
            inquiry and will get back to you within 24 hours.<br><br>
            <span style="color:#00e5a0;">Simulating Attacks, Securing Businesses.</span>
          </p>
          <hr style="border-color:#071520; margin:24px 0;" />
          <p style="color:#8fa8b8; font-size:12px;">
            FashilHack — fashilhack.so
          </p>
        </div>
      `,
    })

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error("Contact error:", err)
    return res.status(500).json({ error: "Failed to send message." })
  }
})

export default router