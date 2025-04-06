/**
 * @fileoverview Google authentication service for the NexSellPro extension.
 * @author NexSellPro
 * @created 2025-04-05
 * @modified 2025-04-05
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState } from "react"
import { connectToGoogle, disconnectFromGoogle, isConnectedToGoogle } from "~services/googleAuthService"
import { exportToGoogleSheets } from "~services/googleSheetsService"

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
const OptionsPage = () => {
    const [status, setStatus] = useState("Checking connection...")
    const [connected, setConnected] = useState(false)
  
    const checkConnection = async () => {
      const isConnected = await isConnectedToGoogle()
      setConnected(isConnected)
      setStatus(isConnected ? "✅ Connected to Google" : "❌ Not connected")
    }
  
    const handleConnect = async () => {
      const success = await connectToGoogle()
      setConnected(success)
      setStatus(success ? "✅ Connected to Google" : "❌ Failed to connect")
    }
  
    const handleDisconnect = async () => {
      await disconnectFromGoogle()
      setConnected(false)
      setStatus("Disconnected")
    }
  
    const handleTestExport = async () => {
      const fakeProducts = [
        {
          id: "123",
          name: "Test Product",
          price: 19.99,
          cost: 10.0,
          profit: 9.99,
          margin: 50,
          category: "Test Category",
          brand: "TestBrand",
          url: "https://walmart.com/test-product"
        }
      ]
  
      try {
        const sheetId = await exportToGoogleSheets(fakeProducts)
        window.open(`https://docs.google.com/spreadsheets/d/${sheetId}`, "_blank")
      } catch (error) {
        alert("❌ Export failed. Check console.")
        console.error("Export error:", error)
      }
    }

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////

////////////////////////////////////////////////
// Props Interface:
////////////////////////////////////////////////

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
  React.useEffect(() => {
    checkConnection()
  }, [])

////////////////////////////////////////////////
// Chrome API Handlers:
////////////////////////////////////////////////

////////////////////////////////////////////////
// Event Handlers:
////////////////////////////////////////////////

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////

////////////////////////////////////////////////
// Styles:
////////////////////////////////////////////////

////////////////////////////////////////////////
// JSX:
////////////////////////////////////////////////
return (
    <div className="p-6 font-sans max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">NexSellPro: Google Integration</h1>

      <div className="mb-4">
        <p className="mb-2 text-gray-700">Status: <span className="font-medium">{status}</span></p>
        {!connected ? (
          <button onClick={handleConnect} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Connect with Google
          </button>
        ) : (
          <>
            <button onClick={handleDisconnect} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mr-2">
              Disconnect
            </button>
            <button onClick={handleTestExport} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Export Sample Sheet
            </button>
          </>
        )}
      </div>
    </div>
  )
}


////////////////////////////////////////////////
// Export Statement:
//////////////////////////////////////////////// 
export default OptionsPage
