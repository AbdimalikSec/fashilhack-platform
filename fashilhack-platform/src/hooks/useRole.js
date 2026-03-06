import { useAuth } from "../context/AuthContext"

export function useRole() {
  const { role } = useAuth()

  return {
    role,
    isAdmin:     role === "admin",
    isTeam:      role === "team"      || role === "admin",
    isClient:    role === "client"    || role === "admin",
    isCommunity: role === "community" || role === "admin",
    isPending:   role === "pending",
    isLoggedIn:  role !== null,

    // Check if role is one of a list
    hasRole: (roles) => roles.includes(role),
  }
}