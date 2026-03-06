import { Navigate } from "react-router-dom"
import { useAuth }  from "../../context/AuthContext"

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role } = useAuth()

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />

  // Logged in but pending approval
  if (role === "pending") return <Navigate to="/pending" replace />

  // Logged in but wrong role
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />

  // All good
  return children
}