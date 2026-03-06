import React from 'react'

export default function Button({
  children,
  variant = "primary",  // primary | ghost | danger
  size = "md",       // sm | md | lg
  full = false,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}) {

  const base = `
    font-sans font-bold tracking-wide transition-all duration-300
    disabled:opacity-40 disabled:cursor-not-allowed
    rounded-lg flex items-center justify-center
  `

  const sizes = {
    sm: "text-xs px-5 py-2.5",
    md: "text-sm px-8 py-4",
    lg: "text-base px-10 py-5",
  }

  const variants = {
    primary: `
      bg-primary text-white border-2 border-primary
      hover:bg-primary-light hover:border-primary-light
      shadow-sm active:transform active:scale-95
    `,
    ghost: `
      bg-transparent border-2 border-accent text-accent
      hover:bg-accent hover:text-white
      active:transform active:scale-95
    `,
    danger: `
      bg-transparent border-2 border-red-600 text-red-600
      hover:bg-red-600 hover:text-white
      active:transform active:scale-95
    `,
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${base}
        ${sizes[size]}
        ${variants[variant]}
        ${full ? "w-full" : "w-fit"}
        ${className}
      `}
    >
      {children}
    </button>
  )
}