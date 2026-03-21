import { Router }      from "express"
import { auth, db }    from "../config/firebase.js"
import { FieldValue }  from "firebase-admin/firestore"
import { verifyToken } from "../middleware/verifyToken.js"

const router = Router()

// POST /api/admin/create-user
// Admin only — creates a Firebase Auth account + Firestore user doc
router.post("/create-user", verifyToken, async (req, res) => {
  try {
    const callerSnap = await db.collection("users").doc(req.user.uid).get()
    if (!callerSnap.exists || callerSnap.data().role !== "admin") {
      return res.status(403).json({ error: "Admin only." })
    }

    const { displayName, email, password, role } = req.body

    if (!displayName || !email || !password || !role) {
      return res.status(400).json({ error: "displayName, email, password and role are required." })
    }
    if (!['admin', 'team', 'client', 'community'].includes(role)) {
      return res.status(400).json({ error: "Role must be admin, team, client or community." })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." })
    }

    // Create Firebase Auth account
    const userRecord = await auth.createUser({ email, password, displayName })

    // Create Firestore user doc
    await db.collection("users").doc(userRecord.uid).set({
      uid:         userRecord.uid,
      email,
      displayName,
      role,
      createdAt:   FieldValue.serverTimestamp(),
      createdBy:   req.user.uid,
    })

    return res.status(200).json({ success: true, uid: userRecord.uid })

  } catch (err) {
    console.error("Create user error:", err)
    if (err.code === "auth/email-already-exists") {
      return res.status(400).json({ error: "An account with this email already exists." })
    }
    return res.status(500).json({ error: err.message || "Failed to create user." })
  }
})

// DELETE /api/admin/delete-user/:uid
// Admin only — deletes Firebase Auth account AND Firestore doc completely
router.delete("/delete-user/:uid", verifyToken, async (req, res) => {
  try {
    const callerSnap = await db.collection("users").doc(req.user.uid).get()
    if (!callerSnap.exists || callerSnap.data().role !== "admin") {
      return res.status(403).json({ error: "Admin only." })
    }

    const { uid } = req.params

    // Prevent admin from deleting themselves
    if (uid === req.user.uid) {
      return res.status(400).json({ error: "You cannot delete your own account." })
    }

    // Delete from Firebase Auth (removes login credentials completely)
    await auth.deleteUser(uid)

    // Delete from Firestore
    await db.collection("users").doc(uid).delete()

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error("Delete user error:", err)
    if (err.code === "auth/user-not-found") {
      // Auth record already gone — still clean up Firestore
      await db.collection("users").doc(req.params.uid).delete().catch(() => {})
      return res.status(200).json({ success: true })
    }
    return res.status(500).json({ error: err.message || "Failed to delete user." })
  }
})

export default router