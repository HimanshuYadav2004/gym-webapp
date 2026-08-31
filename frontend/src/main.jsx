import React from 'react'
import ReactDOM from 'react-dom/client'
import toast from 'react-hot-toast'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

const updateSW = registerSW({
  onNeedRefresh() {
    toast(
      (t) => (
        <span className="flex items-center gap-3">
          A new version is ready
          <button
            onClick={() => { updateSW(true); toast.dismiss(t.id); }}
            className="btn-primary !py-1.5 !px-3 text-xs"
          >
            Refresh
          </button>
        </span>
      ),
      { duration: Infinity, icon: '🚀' }
    );
  }
})
