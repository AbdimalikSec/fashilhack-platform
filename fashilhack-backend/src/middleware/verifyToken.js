import { auth } from "../config/firebase.js"

export async function verifyToken(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided." })
  }

  const token = header.split("Bearer ")[1]

  try {
    const decoded = await auth.verifyIdToken(token)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." })
  }
}

export async function verifyRole(roles) {
  return async (req, res, next) => {
    try {
      const snap = await db
        .collection("users")
        .doc(req.user.uid)
        .get()

      if (!snap.exists) {
        return res.status(403).json({ error: "User not found." })
      }

      const { role } = snap.data()

      if (!roles.includes(role)) {
        return res.status(403).json({ error: "Insufficient permissions." })
      }

      req.role = role
      next()
    } catch (err) {
      return res.status(500).json({ error: "Role verification failed." })
    }
  }
}