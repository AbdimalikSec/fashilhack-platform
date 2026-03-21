import React from 'react'
export default function SectionTag({ text }) {
  return (
    <p className=" text-xs tracking-widest uppercase text-green-primary mb-2">
      <span className="opacity-50"></span>{text}
    </p>
  )
}