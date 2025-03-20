/**
 * @fileoverview Type definitions for seller-related data
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No imports needed as this is a type definition file

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// No constants needed

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////

/**
 * Represents detailed information about a seller on the marketplace
 * Used for displaying seller information and pricing details
 */
export interface SellerInfo {
  // Basic seller information
  sellerName: string;  // Name of the seller
  price: string;       // Price as a formatted string
  type: 'WMT' | 'WFS' | 'WFS-Pro' | 'SF' | 'SF-Pro' | string;  // Seller type (Walmart, Walmart Fulfilled, Seller Fulfilled)
  arrives: string;     // Estimated arrival time
  isProSeller: boolean;  // Whether the seller is a pro seller
  isWFS: boolean;      // Whether the seller uses Walmart Fulfillment Services

  // Optional pricing details
  priceInfo?: {
    currentPrice?: {
      price: number;        // Numeric price value
      priceString: string;  // Formatted price string
    };
  };

  // Optional fulfillment information
  fulfillmentStatus?: string;  // Current fulfillment status
  arrivalDate?: string;       // Expected arrival date
}

/**
 * Represents raw seller data as received from the API
 * Used for data transformation and processing
 */
export interface RawSellerData {
  name: string | null;        // Seller name
  price: string | null;       // Price as string
  deliveryInfo: string | null;  // Delivery information
  isWFS: boolean;            // Whether using Walmart Fulfillment Services
  isProSeller: boolean;      // Whether a pro seller
}

////////////////////////////////////////////////
// Enums:
////////////////////////////////////////////////
// No enums needed

////////////////////////////////////////////////
// Configuration:
////////////////////////////////////////////////
// No configuration needed

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
// No helper functions needed

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
// All types are exported above 