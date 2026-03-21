import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
} from "firebase/auth"
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore"
import { auth, db, provider } from "../config/firebase"

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null)
  const [role,     setRole]     = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {

        // Block unverified email/password accounts from accessing the portal
        if (
          !firebaseUser.emailVerified &&
          firebaseUser.providerData[0]?.providerId === "password"
        ) {
          setUser(null)
          setRole(null)
          setUserData(null)
          setLoading(false)
          return
        }

        const ref  = doc(db, "users", firebaseUser.uid)
        const snap = await getDoc(ref)

        if (snap.exists()) {
          const data = snap.data()
          setUser(firebaseUser)
          setRole(data.role)
          setUserData(data)
        } else {
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

  // ── Community Signup ──
  // Creates account, writes Firestore doc, sends verification email, signs out.
  // Returns so Signup.jsx can show the verify screen.
  const signUpEmail = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)

    // Write Firestore doc
    await setDoc(doc(db, "users", cred.user.uid), {
      uid:         cred.user.uid,
      email,
      displayName,
      role:        "community",
      createdAt:   serverTimestamp(),
      approvedAt:  serverTimestamp(),
      approvedBy:  "self",
    })

    // Send verification email while still signed in (Firebase requires this)
    await sendEmailVerification(cred.user)

    // Sign out — onAuthStateChanged fires but hits the unverified check above
    // and returns early without touching state, so no freeze
    await signOut(auth)

    return cred
  }

  // ── Google Sign In / Sign Up ──
  const signInGoogle = async () => {
    const cred = await signInWithPopup(auth, provider)
    const ref  = doc(db, "users", cred.user.uid)
    const snap = await getDoc(ref)

    if (!snap.exists()) {
      await setDoc(ref, {
        uid:         cred.user.uid,
        email:       cred.user.email,
        displayName: cred.user.displayName,
        role:        "community",
        createdAt:   serverTimestamp(),
        approvedAt:  serverTimestamp(),
        approvedBy:  "self",
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

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="font-heading font-black text-primary text-xs tracking-[0.3em] uppercase animate-pulse">
          FashilHack — Initializing
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