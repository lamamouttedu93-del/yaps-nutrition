import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Monte l'app dans <div id="racine"></div> (défini dans index.html)
const rootEl = document.getElementById('racine')
if (!rootEl) {
  // Petit garde-fou visuel si jamais l'ID ne correspond pas
  const warn = document.createElement('div')
  warn.textContent = 'Point de montage introuvable: <div id="racine"> manquant.'
  warn.style.cssText = 'padding:16px;margin:16px;background:#300;color:#fff;font-family:system-ui'
  document.body.appendChild(warn)
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
