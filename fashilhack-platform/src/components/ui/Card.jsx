import React from 'react'

export default function Card({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        professional-card p-6
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  )
}