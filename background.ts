/// <reference types="chrome"/>

// Background Service Worker Script
////////////////////////////////////////////////

// Listen for extension installation or updates.
chrome.runtime.onInstalled.addListener(() => {
  console.log("NexSellPro extension installed.");
});

// Listen for messages from other parts of the extension (e.g., content scripts).
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  sendResponse({ status: "received" });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.url?.startsWith('https://www.walmart.com/')) {
    chrome.tabs.sendMessage(tabId, {
      type: 'URL_CHANGED',
      url: changeInfo.url
    });
  }
});

// Listen for navigation events
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.url.startsWith('https://www.walmart.com/')) {
    chrome.tabs.sendMessage(details.tabId, {
      type: 'URL_CHANGED',
      url: details.url
    });
  }
});

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url.includes("GetAllSellerOffers")) {
      fetch(details.url)
        .then((response) => response.json())
        .then((data) => {
          // Send the data to the content script
          chrome.tabs.sendMessage(details.tabId!, { type: "ALL_OFFERS_DATA", data });
        })
        .catch((error) => console.error("Error fetching alloffers data:", error));
    }
  },
  { urls: ["*://*.walmart.com/*"] }
);