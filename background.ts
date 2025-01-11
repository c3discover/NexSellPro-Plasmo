/// <reference types="chrome"/>

// Background Service Worker Script
////////////////////////////////////////////////

// Listen for extension installation or updates.
chrome.runtime.onInstalled.addListener(() => {
  console.log("NexSellPro extension installed.");
});

// Listen for messages from other parts of the extension (e.g., content scripts).
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  console.log("Background script received a message:", message);
  sendResponse({ status: "received" });
});


chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url.includes("GetAllSellerOffers")) {
      fetch(details.url)
        .then((response) => response.json())
        .then((data) => {
          console.log("All Offers Data:", data);
          // Send the data to the content script
          chrome.tabs.sendMessage(details.tabId!, { type: "ALL_OFFERS_DATA", data });
        })
        .catch((error) => console.error("Error fetching alloffers data:", error));
    }
  },
  { urls: ["*://*.walmart.com/*"] }
);