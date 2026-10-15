import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applySettings, loadSettings } from './settings'

// Apply theme before the first render so there is no flash of the wrong theme.
applySettings(loadSettings())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
