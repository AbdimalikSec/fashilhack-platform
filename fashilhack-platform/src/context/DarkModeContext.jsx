import { createContext, useContext, useState, useEffect } from "react"

const DarkModeContext = createContext({
  portalDark: false,
  publicDark:  false,
  togglePortalDark: () => {},
  togglePublicDark:  () => {},
})

export function DarkModeProvider({ children }) {
  const [portalDark, setPortalDark] = useState(() =>
    localStorage.getItem("fh_theme_portal") === "dark"
  )
  const [publicDark, setPublicDark] = useState(() =>
    localStorage.getItem("fh_theme_public") === "dark"
  )

  // Portal dark → html.dark
  // Public dark → also html.dark (community pages use the same CSS variables)
  // Both can coexist: html.dark is on when either is active (managed by PortalLayout/Navbar)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", portalDark)
  }, [portalDark])

  useEffect(() => {
    document.documentElement.classList.toggle("public-dark", publicDark)
    // Community/public pages use CSS variable classes (.bg-page etc) which need html.dark
    // But only set it if portal isn't already controlling it
    if (!portalDark) {
      document.documentElement.classList.toggle("dark", publicDark)
    }
  }, [publicDark, portalDark])

  const togglePortalDark = () => {
    setPortalDark(d => {
      const next = !d
      localStorage.setItem("fh_theme_portal", next ? "dark" : "light")
      return next
    })
  }

  const togglePublicDark = () => {
    setPublicDark(d => {
      const next = !d
      localStorage.setItem("fh_theme_public", next ? "dark" : "light")
      return next
    })
  }

  return (
    <DarkModeContext.Provider value={{ portalDark, publicDark, togglePortalDark, togglePublicDark }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDark() {
  return useContext(DarkModeContext)
}