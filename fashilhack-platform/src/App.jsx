import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/guards/ProtectedRoute'

// Public pages
import Home     from './pages/public/Home'
import About    from './pages/public/About'
import Services from './pages/public/Services'
import Contact  from './pages/public/Contact'

// Auth pages
import Login   from './pages/auth/Login'
import Signup  from './pages/auth/Signup'
import Pending from './pages/auth/Pending'

// Client pages
import ClientDashboard from './pages/client/ClientDashboard'
import Engagements     from './pages/client/Engagements'
import Findings        from './pages/client/Findings'
import Reports         from './pages/client/Reports'

// Team pages
import TeamDashboard      from './pages/team/TeamDashboard'
import ManageEngagements  from './pages/team/ManageEngagements'
import ManageFindings     from './pages/team/ManageFindings'
import ManageUsers        from './pages/team/ManageUsers'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'

// Community
import Feed    from './pages/community/Feed'
import Post    from './pages/community/Post'
import Writeup from './pages/community/Writeup'

export default function App() {
  return (
    <Routes>

      {/* ── PUBLIC ── */}
      <Route path="/"         element={<Home />} />
      <Route path="/about"    element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact"  element={<Contact />} />

      {/* ── AUTH ── */}
      <Route path="/login"   element={<Login />} />
      <Route path="/signup"  element={<Signup />} />
      <Route path="/pending" element={<Pending />} />

      {/* ── CLIENT PORTAL ── */}
      <Route path="/client" element={
        <ProtectedRoute allowedRoles={["client", "admin"]}>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/client/engagements" element={
        <ProtectedRoute allowedRoles={["client", "admin"]}>
          <Engagements />
        </ProtectedRoute>
      } />
      <Route path="/client/findings" element={
        <ProtectedRoute allowedRoles={["client", "admin"]}>
          <Findings />
        </ProtectedRoute>
      } />
      <Route path="/client/reports" element={
        <ProtectedRoute allowedRoles={["client", "admin"]}>
          <Reports />
        </ProtectedRoute>
      } />

      {/* ── TEAM PORTAL ── */}
      <Route path="/team" element={
        <ProtectedRoute allowedRoles={["team", "admin"]}>
          <TeamDashboard />
        </ProtectedRoute>
      } />
      <Route path="/team/engagements" element={
        <ProtectedRoute allowedRoles={["team", "admin"]}>
          <ManageEngagements />
        </ProtectedRoute>
      } />
      <Route path="/team/findings" element={
        <ProtectedRoute allowedRoles={["team", "admin"]}>
          <ManageFindings />
        </ProtectedRoute>
      } />
      <Route path="/team/users" element={
        <ProtectedRoute allowedRoles={["team", "admin"]}>
          <ManageUsers />
        </ProtectedRoute>
      } />

      {/* ── ADMIN ── */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* ── COMMUNITY ── */}
      <Route path="/community"         element={<Feed />} />
      <Route path="/community/:postId" element={<Post />} />
      <Route path="/community/writeup" element={
        <ProtectedRoute allowedRoles={["team", "admin", "community"]}>
          <Writeup />
        </ProtectedRoute>
      } />

      {/* ── FALLBACK ── */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  )
}