import React from 'react'
import Navbar from "./Navbar"
import Footer from "./Footer"

export default function PageLayout({ children, noFooter = false }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  )
}