import React from 'react'
import Navbar from "./Navbar"
import Footer from "./Footer"

export default function PageLayout({ children, noFooter = false }) {
  return (
    <div className="min-h-screen bg-white flex flex-col public-page pt-20">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  )
}