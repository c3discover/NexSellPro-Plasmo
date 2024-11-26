// background.js

let port;

// Function to connect to runtime with error handling
function connectToRuntime() {
  try {
    if (port) {
      port.disconnect(); // Disconnect existing port if already connected
    }
    // Establish a new runtime connection
    port = chrome.runtime.connect({ name: "my-extension-connection" });

    // Handle disconnection
    port.onDisconnect.addListener(() => {
      if (chrome.runtime.lastError) {
        console.error("Runtime connection error:", chrome.runtime.lastError.message);
      } else {
        console.warn("Runtime disconnected. Reconnecting...");
        setTimeout(connectToRuntime, 1000); // Retry connection after 1 second
      }
    });

    // Handle incoming messages
    port.onMessage.addListener((msg) => {
      console.log("Received message:", msg);
      // Handle your extension messages here
    });
  } catch (error) {
    console.error("Error connecting to runtime:", error);
  }
}

// Connect when the background script runs
connectToRuntime();
