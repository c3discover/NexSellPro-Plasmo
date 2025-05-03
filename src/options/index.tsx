/**
 * @fileoverview Options page for handling Google OAuth2 connection (hosted at options.html)
 * @author NexSellPro
 * @created 2025-04-29
 * @lastModified 2025-04-29
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React from "react"
import ReactDOM from "react-dom/client"
import ConnectWithGoogle from "../components/common/ConnectWithGoogle"

////////////////////////////////////////////////
// Mount Options Page:
////////////////////////////////////////////////
const App = () => (
  <div className="p-4 font-sans text-sm text-gray-700">
    <h1 className="text-lg font-semibold mb-3">NexSellPro: Integrations</h1>
    <ConnectWithGoogle />
  </div>
)

const container = document.getElementById("root")
if (container) {
  const root = ReactDOM.createRoot(container)
  root.render(<App />)
} else {
  const fallback = document.createElement("div")
  fallback.id = "root"
  document.body.appendChild(fallback)
  const root = ReactDOM.createRoot(fallback)
  root.render(<App />)
}