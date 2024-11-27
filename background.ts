// Background Service Worker Script
////////////////////////////////////////////////

// Listen for extension installation or updates.
chrome.runtime.onInstalled.addListener(() => {
    console.log("WalAIWiz extension installed.");
  });
  
  // Listen for messages from other parts of the extension (e.g., content scripts).
  chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
    console.log("Background script received a message:", message);
    sendResponse({ status: "received" });
  });
  