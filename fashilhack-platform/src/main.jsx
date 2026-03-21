import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DarkModeProvider } from "./context/DarkModeContext"
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DarkModeProvider>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
    </DarkModeProvider>
  </StrictMode>
)