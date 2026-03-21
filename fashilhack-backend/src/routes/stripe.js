import { Router }    from "express"
import Stripe        from "stripe"
import { db }        from "../config/firebase.js"
import { FieldValue } from "firebase-admin/firestore"
import { verifyToken } from "../middleware/verifyToken.js"

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// ── POST /api/stripe/create-checkout ──
// Creates a Stripe Checkout session for a course purchase
router.post("/create-checkout", verifyToken, async (req, res) => {
  try {
    const { courseId } = req.body
    if (!courseId) return res.status(400).json({ error: "courseId required" })

    // Get course from Firestore
    const courseSnap = await db.collection("courses").doc(courseId).get()
    if (!courseSnap.exists) return res.status(404).json({ error: "Course not found" })
    const course = courseSnap.data()

    if (!course.published) return res.status(400).json({ error: "Course is not available" })
    if (course.price === 0) return res.status(400).json({ error: "This course is free — no checkout needed" })

    // Check not already enrolled
    const enrollSnap = await db.collection("enrollments").doc(`${req.user.uid}_${courseId}`).get()
    if (enrollSnap.exists) return res.status(400).json({ error: "Already enrolled" })

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: Math.round(course.price * 100), // Stripe uses cents
          product_data: {
            name:        course.title,
            description: course.description?.slice(0, 200) || "",
            images:      course.thumbnail ? [course.thumbnail] : [],
          },
        },
        quantity: 1,
      }],
      // Pass metadata so webhook knows who bought what
      metadata: {
        courseId,
        userId:     req.user.uid,
        userEmail:  req.user.email || "",
      },
      customer_email: req.user.email || undefined,
      success_url: `${frontendUrl}/courses/${courseId}/learn?enrolled=true`,
      cancel_url:  `${frontendUrl}/courses/${courseId}?cancelled=true`,
    })

    return res.status(200).json({ url: session.url })

  } catch (err) {
    console.error("Stripe checkout error:", err)
    return res.status(500).json({ error: err.message || "Failed to create checkout session" })
  }
})

// ── POST /api/stripe/webhook ──
// Stripe calls this after successful payment
// Must be registered BEFORE express.json() middleware in index.js
router.post("/webhook", async (req, res) => {
  const sig     = req.headers["stripe-signature"]
  const secret  = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    // req.body must be raw buffer here — see index.js setup
    event = stripe.webhooks.constructEvent(req.body, sig, secret)
  } catch (err) {
    console.error("Webhook signature failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === "checkout.session.completed") {
    const session  = event.data.object
    const { courseId, userId, userEmail } = session.metadata || {}

    if (!courseId || !userId) {
      console.error("Webhook missing metadata:", session.metadata)
      return res.status(200).send("OK") // Still return 200 so Stripe doesn't retry
    }

    try {
      // Create enrollment document
      await db.collection("enrollments").doc(`${userId}_${courseId}`).set({
        uid:             userId,
        email:           userEmail || "",
        courseId,
        purchasedAt:     FieldValue.serverTimestamp(),
        stripeSessionId: session.id,
        amount:          session.amount_total / 100,
        currency:        session.currency,
        progress:        {},
      })

      // Increment enrollments count on course
      await db.collection("courses").doc(courseId).update({
        enrollments: FieldValue.increment(1)
      })

      console.log(`✓ Enrolled user ${userId} in course ${courseId}`)
    } catch (err) {
      console.error("Enrollment creation failed:", err)
      // Return 500 so Stripe retries the webhook
      return res.status(500).send("Enrollment failed")
    }
  }

  return res.status(200).send("OK")
})

export default router