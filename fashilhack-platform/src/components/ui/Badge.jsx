import React from 'react'

const COLORS = {
  admin: "bg-red-50    text-red-700    border-red-200",
  team: "bg-blue-50   text-accent     border-blue-200",
  client: "bg-slate-50  text-primary    border-slate-200",
  community: "bg-amber-50  text-amber-700   border-amber-200",
  pending: "bg-slate-50  text-slate-500  border-slate-200",
  rejected: "bg-red-50    text-red-700    border-red-200",

  // severity
  critical: "bg-red-100   text-red-700    border-red-300",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-amber-50  text-amber-700  border-amber-200",
  low: "bg-blue-50   text-accent     border-blue-200",
  info: "bg-slate-50  text-slate-500  border-slate-200",

  // status
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-blue-50    text-accent      border-blue-200",
  scoping: "bg-amber-50   text-amber-700   border-amber-200",
  reporting: "bg-orange-50  text-orange-700  border-orange-200",
}

export default function Badge({ label, type = "pending" }) {
  const color = COLORS[type] || COLORS.pending

  return (
    <span className={`
      font-sans text-[10px] font-bold tracking-tight uppercase
      border px-2 py-0.5 rounded ${color}
    `}>
      {label || type}
    </span>
  )
}