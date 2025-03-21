/**
 * @fileoverview Chrome Extension Background Service Worker for NexSellPro
 * @author NexSellPro
 * @created 2024-03-07
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
/// <reference types="chrome"/>
// This special comment tells TypeScript to include Chrome extension types

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Target domain for URL monitoring
const WALMART_DOMAIN = 'https://www.walmart.com/';

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Message type for URL change notifications
interface UrlChangeMessage {
  type: 'URL_CHANGED';
  url: string;
}

// Message type for seller offers data
interface SellerOffersMessage {
  type: 'ALL_OFFERS_DATA';
  data: any;
}

// Combined message types
type ExtensionMessage = UrlChangeMessage | SellerOffersMessage;

////////////////////////////////////////////////
// Enums:
////////////////////////////////////////////////
// No enums needed for this service worker

////////////////////////////////////////////////
// Configuration:
////////////////////////////////////////////////
// Web request filter configuration
const webRequestFilter = {
  urls: ["*://*.walmart.com/*"]
};

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
// Installation handler
const handleInstallation = () => {
  console.log("NexSellPro extension installed.");
};

// Message handler
const handleMessage = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  sendResponse({ status: "received" });
};

// Tab update handler
const handleTabUpdate = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  if (changeInfo.url && tab.url?.startsWith(WALMART_DOMAIN)) {
    chrome.tabs.sendMessage(tabId, {
      type: 'URL_CHANGED',
      url: changeInfo.url
    }).catch(() => {
      // Ignore errors from closed tabs or unloaded content scripts
    });
  }
};

// Navigation handler
const handleNavigation = (details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) => {
  if (details.url.startsWith(WALMART_DOMAIN)) {
    // Send message for both regular navigation and history state updates
    chrome.tabs.sendMessage(details.tabId, {
      type: 'URL_CHANGED',
      url: details.url
    }).catch(() => {
      // Ignore errors from closed tabs or unloaded content scripts
    });
  }
};

// Network request handler
const handleWebRequest = (details: chrome.webRequest.WebResponseCacheDetails) => {
  if (details.url.includes("GetAllSellerOffers")) {
    fetch(details.url)
      .then((response) => response.json())
      .then((data) => {
        // Send the seller data to the content script
        chrome.tabs.sendMessage(details.tabId!, { 
          type: "ALL_OFFERS_DATA", 
          data 
        }).catch(() => {
          // Ignore errors from closed tabs or unloaded content scripts
        });
      })
      .catch((error) => console.error("Error fetching alloffers data:", error));
  }
};

////////////////////////////////////////////////
// Event Listeners:
////////////////////////////////////////////////
// Listen for extension installation or updates
chrome.runtime.onInstalled.addListener(handleInstallation);

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener(handleMessage);

// Listen for tab URL changes
chrome.tabs.onUpdated.addListener(handleTabUpdate);

// Listen for navigation state changes (e.g., single-page app navigation)
chrome.webNavigation.onHistoryStateUpdated.addListener(handleNavigation);

// Listen for completed navigation
chrome.webNavigation.onCompleted.addListener(handleNavigation);

// Listen for network requests to capture seller data
chrome.webRequest.onCompleted.addListener(
  handleWebRequest,
  webRequestFilter
);

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
// No exports needed for background service worker