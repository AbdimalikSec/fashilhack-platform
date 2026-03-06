import React from 'react'
import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth"
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore"
import { auth, db, provider } from "../config/firebase"

// ── Create context ──
const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// ── Provider ──
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen to auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user doc from Firestore
        const ref = doc(db, "users", firebaseUser.uid)
        const snap = await getDoc(ref)

        if (snap.exists()) {
          const data = snap.data()
          setUser(firebaseUser)
          setRole(data.role)
          setUserData(data)
        } else {
          // Doc missing — treat as pending
          setUser(firebaseUser)
          setRole("pending")
          setUserData(null)
        }
      } else {
        setUser(null)
        setRole(null)
        setUserData(null)
      }
      setLoading(false)
    })

    return unsub
  }, [])

  // ── Email + Password Signup ──
  const signUpEmail = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)

    // Create user document in Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      email: email,
      displayName: displayName,
      role: "pending",
      createdAt: serverTimestamp(),
      approvedAt: null,
      approvedBy: null,
    })

    return cred
  }

  // ── Google Signup / Login ──
  const signInGoogle = async () => {
    const cred = await signInWithPopup(auth, provider)
    const ref = doc(db, "users", cred.user.uid)
    const snap = await getDoc(ref)

    // Only create doc if first time
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        role: "pending",
        createdAt: serverTimestamp(),
        approvedAt: null,
        approvedBy: null,
      })
    }

    return cred
  }

  // ── Email Login ──
  const signInEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  // ── Logout ──
  const logout = () => signOut(auth)

  const value = {
    user,
    role,
    userData,
    loading,
    signUpEmail,
    signInEmail,
    signInGoogle,
    logout,
  }

  // Don't render children until auth state is known
  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="font-heading font-black text-primary text-xs tracking-[0.3em] uppercase animate-pulse">
          FashilHack 🛡️ Initializing
        </div>
      </div>
    </div>
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}