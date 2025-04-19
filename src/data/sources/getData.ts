/**
 * @fileoverview Data fetching and processing utilities
 * @author Your Name
 * @created 2025-04-18
 * @lastModified 2025-04-18
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import { logGroup, logTable, logGroupEnd, LogModule } from '../utils/logger';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////

let loggedOnce = false;

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////


////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////

function extractNextData(): any {
  const dataDiv = document.getElementById("__NEXT_DATA__");
  if (!dataDiv) throw new Error("No __NEXT_DATA__ div found");

  const rawJson = dataDiv.innerText;
  const fullData = JSON.parse(rawJson);
  return fullData.props.pageProps.initialData.data;
}


////////////////////////////////////////////////
// Main Functions:
////////////////////////////////////////////////

export default function getData(forceRefresh = false): any {
  try {
    const dataDiv = document.getElementById("__NEXT_DATA__")
    if (!dataDiv) {
      console.warn("No __NEXT_DATA__ div found, returning fallback data");
      return {
        productID: window.location.pathname.match(/\/ip\/[^\/]+\/(\d+)/)?.[1] || '',
        name: document.querySelector('h1')?.textContent || 'Unknown Product',
        upc: '',
        brand: document.querySelector('a[class*="brandText"]')?.textContent || 'Unknown Brand',
        brandUrl: '',
        modelNumber: '',
        currentPrice: parseFloat(document.querySelector('[data-testid="price-container"] [data-automation-id="price"]')?.textContent?.replace(/[^\d.]/g, '') || '0'),
        imageUrl: document.querySelector('img[data-automation-id="image-main"]')?.getAttribute('src') || '',
        images: [],
        videos: [],
        mainCategory: '',
        categories: [],
        shippingLength: '',
        shippingWidth: '',
        shippingHeight: '',
        weight: '',
        badges: [],
        variantCriteria: [],
        variantsMap: {},
        overallRating: 0,
        numberOfRatings: 0,
        numberOfReviews: 0,
        customerReviews: [],
        reviewDates: [],
        fulfillmentOptions: []
      }
    }

    const rawJson = dataDiv.innerText
    const fullData = JSON.parse(rawJson)
    const raw = fullData.props.pageProps.initialData.data

    if (forceRefresh || !loggedOnce) {
      logRawData(raw)
    }

    return raw
  } catch (error) {
    logGroup(LogModule.RAW_DATA, "❌ Error in getData.ts")
    console.error(error)
    logGroupEnd()
    return null
  }
}


////////////////////////////////////////////////
// Logging:
////////////////////////////////////////////////
function logRawData(raw: any): void {
  logGroup(LogModule.RAW_DATA, "JSON Data");
  console.log(LogModule.RAW_DATA2, "Product", raw.product);
  console.log(LogModule.RAW_DATA2, "IDML", raw.idml);
  console.log(LogModule.RAW_DATA2, "Reviews", raw.reviews);
  logGroupEnd();
  loggedOnce = true;
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export const scrapedProductData = {}