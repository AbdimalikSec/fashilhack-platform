// usePublicTheme.js
// Drop this in src/hooks/usePublicTheme.js
// Use in every public page to get theme-aware color tokens

import { useDark } from "../context/DarkModeContext"

export function usePublicTheme() {
  const { publicDark: dark } = useDark()

  const t = {
    // Page backgrounds
    pageBg:        dark ? "#0d0f16" : "#ffffff",
    sectionAlt:    dark ? "#111318" : "#f8fafc",
    sectionDark:   "#0a1628", // CTA sections — always dark

    // Surfaces (cards, inputs, dropdowns)
    cardBg:        dark ? "#1a1d27" : "#ffffff",
    cardBorder:    dark ? "rgba(255,255,255,0.07)" : "#e2e8f0",
    inputBg:       dark ? "#13161f" : "#ffffff",
    inputBorder:   dark ? "rgba(255,255,255,0.12)" : "#e2e8f0",
    inputBorderFocus: dark ? "#00aaff" : "#93c5fd",

    // Text
    heading:       dark ? "#f1f5f9" : "#0f172a",
    body:          dark ? "rgba(255,255,255,0.65)" : "#475569",
    muted:         dark ? "rgba(255,255,255,0.35)" : "#94a3b8",
    accent:        "#00aaff",

    // Tag / badge (the small pill labels)
    tagBg:         dark ? "rgba(0,170,255,0.12)" : "#eff6ff",
    tagBorder:     dark ? "rgba(0,170,255,0.25)" : "#dbeafe",
    tagText:       dark ? "rgba(255,255,255,0.5)" : "#64748b",

    // Dividers
    border:        dark ? "rgba(255,255,255,0.07)" : "#e2e8f0",
    borderSoft:    dark ? "rgba(255,255,255,0.04)" : "#f1f5f9",

    // Grid background pattern
    gridLine:      dark ? "rgba(255,255,255,0.03)" : "#e8f4ff",

    // Cert / small badge inside team cards
    certBg:        dark ? "#13161f" : "#f8fafc",
    certBorder:    dark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
    certText:      dark ? "rgba(255,255,255,0.45)" : "#64748b",

    // Timeline / process lines
    timelineLine:  dark ? "rgba(255,255,255,0.1)" : "#e2e8f0",

    // Hover state for service cards
    iconBg:        dark ? "#1e2130" : "#f8fafc",
    iconColor:     dark ? "rgba(255,255,255,0.45)" : "#94a3b8",

    // Contact info cards
    contactCardBg: dark ? "#1a1d27" : "#ffffff",

    // Form select/textarea
    selectBg:      dark ? "#13161f" : "#ffffff",

    dark, // expose raw bool for conditional rendering
  }

  return t
}