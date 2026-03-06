import { auth } from "../config/firebase"

const BASE = import.meta.env.VITE_API_URL

// Helper — gets Firebase token and calls the backend
async function apiFetch(endpoint, options = {}) {
  const user = auth.currentUser

  // Get token if user is logged in
  const token = user ? await user.getIdToken() : null

  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong.")
  }

  return data
}

// ── Contact ──
export const sendContactForm = (form) =>
  apiFetch("/api/contact", {
    method: "POST",
    body:   JSON.stringify(form),
  })

// ── Reports ──
export const uploadReport = async (formData) => {
  const user  = auth.currentUser
  const token = user ? await user.getIdToken() : null

  const res = await fetch(`${BASE}/api/reports/upload`, {
    method:  "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Don't set Content-Type here — browser sets it with boundary for FormData
    },
    body: formData,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Upload failed.")
  return data
}

export const deleteReport = (reportId) =>
  apiFetch(`/api/reports/${reportId}`, { method: "DELETE" })

// ── Notifications ──
export const notifyFinding = (payload) =>
  apiFetch("/api/notify/finding", {
    method: "POST",
    body:   JSON.stringify(payload),
  })

export const notifyReport = (payload) =>
  apiFetch("/api/notify/report", {
    method: "POST",
    body:   JSON.stringify(payload),
  })

export const notifyApproved = (payload) =>
  apiFetch("/api/notify/approved", {
    method: "POST",
    body:   JSON.stringify(payload),
  })