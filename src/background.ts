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
const PRODUCT_PAGE_IDENTIFIER = '/ip/';

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Message type for URL change notifications
interface UrlChangeMessage {
  type: 'URL_CHANGED';
  url: string;
  isProductPage: boolean;
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
const isProductPage = (url: string): boolean => {
  return url.includes(PRODUCT_PAGE_IDENTIFIER);
};

const sendUrlChangeMessage = async (tabId: number, url: string) => {
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'URL_CHANGED',
      url,
      isProductPage: isProductPage(url)
    });
    console.log('URL change message sent:', url);
  } catch (error) {
    // Ignore errors from closed tabs or unloaded content scripts
    console.debug('Could not send URL change message:', error);
  }
};

////////////////////////////////////////////////
// Event Handlers:
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
const handleTabUpdate = async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  if (changeInfo.url && tab.url?.startsWith(WALMART_DOMAIN)) {
    await sendUrlChangeMessage(tabId, changeInfo.url);
  }
};

// Navigation handler
const handleNavigation = async (details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) => {
  if (details.url.startsWith(WALMART_DOMAIN)) {
    await sendUrlChangeMessage(details.tabId, details.url);
  }
};

// Network request handler
const handleWebRequest = async (details: chrome.webRequest.WebResponseCacheDetails) => {
  if (details.url.includes("GetAllSellerOffers")) {
    try {
      const response = await fetch(details.url);
      const data = await response.json();
      await chrome.tabs.sendMessage(details.tabId!, { 
        type: "ALL_OFFERS_DATA", 
        data 
      });
    } catch (error) {
      console.error("Error fetching alloffers data:", error);
    }
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
if (chrome.webNavigation) {
  chrome.webNavigation.onHistoryStateUpdated.addListener(handleNavigation);
  chrome.webNavigation.onCompleted.addListener(handleNavigation);
}

// Listen for network requests to capture seller data
if (chrome.webRequest) {
  chrome.webRequest.onCompleted.addListener(
    handleWebRequest,
    webRequestFilter
  );
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
// No exports needed for background service worker 