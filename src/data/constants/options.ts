/**
 * @fileoverview Constants for various options used throughout the application
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

//////////////////////////////////////////////////
// Imports:
//////////////////////////////////////////////////
// No imports needed here.

//////////////////////////////////////////////////
// Constants and Variables:
//////////////////////////////////////////////////
// These arrays contain predefined options used in dropdowns and forms throughout the application

// List of all contract categories for Walmart Marketplace fees.
// These categories determine the applicable referral fees for each type of product.
// Each category has its own fee structure based on Walmart's marketplace rules.
export const contractCategoryOptions: string[] = [
  "Apparel & Accessories",      // Clothing, jewelry, accessories
  "Automotive & Powersports",   // Cars, motorcycles, parts
  "Automotive Electronics",     // Car audio, GPS, etc.
  "Baby",                       // Baby clothes, toys, equipment
  "Beauty",                     // Cosmetics, skincare, haircare
  "Books",                      // Physical and digital books
  "Camera & Photo",             // Cameras, lenses, accessories
  "Cell Phones",                // Mobile phones and accessories
  "Consumer Electronics",       // TVs, audio equipment, etc.
  "Electronics Accessories",    // Cables, cases, chargers
  "Indoor & Outdoor Furniture", // Home and garden furniture
  "Decor",                      // Home decoration items
  "Gourmet Food",               // Specialty food items
  "Grocery",                    // Regular food and household items
  "Health & Personal Care",     // Health products, toiletries
  "Home & Garden",              // Home improvement, gardening
  "Industrial & Scientific",    // Industrial equipment, lab supplies
  "Jewelry",                    // Fine jewelry and watches
  "Kitchen",                    // Kitchen appliances and tools
  "Luggage & Travel Accessories", // Bags, suitcases, travel items
  "Major Appliances",           // Large home appliances
  "Music",                      // CDs, vinyl records
  "Musical Instruments",        // Instruments and accessories
  "Office Products",            // Office supplies and equipment
  "Outdoors",                   // Outdoor recreation items
  "Outdoor Power Tools",        // Lawn equipment, power tools
  "Personal Computers",         // Desktop and laptop computers
  "Pet Supplies",               // Pet food, toys, accessories
  "Plumbing Heating Cooling & Ventilation", // HVAC and plumbing
  "Shoes, Handbags & Sunglasses", // Footwear and accessories
  "Software & Computer Video Games", // Digital software and games
  "Sporting Goods",             // Sports equipment and gear
  "Tires & Wheels",             // Vehicle tires and wheels
  "Tools & Home Improvement",   // Hand tools, building materials
  "Toys & Games",               // Children's toys and games
  "Video & DVD",                // Physical video media
  "Video Game Consoles",        // Gaming systems
  "Video Games",                // Physical video games
  "Watches",                    // Timepieces and accessories
  "Everything Else (Most Items)" // Default category for unlisted items
];

// Available seasons for storage fees.
// These seasons affect how storage fees are calculated in Walmart's fulfillment centers.
// Jan-Sep: Standard storage rates
// Oct-Dec: Peak season rates (usually higher due to holiday season)
export const seasonOptions: string[] = [
  "Jan-Sep",  // Standard season
  "Oct-Dec"   // Peak season (holiday period)
];

//////////////////////////////////////////////////
// Props and Types:
//////////////////////////////////////////////////
// No props or types needed here.

//////////////////////////////////////////////////
// State and Hooks:
//////////////////////////////////////////////////
// No state or hooks needed here.

//////////////////////////////////////////////////
// Helper Functions:
//////////////////////////////////////////////////
// No helper functions at the moment. This section can be used for reusable utility functions.

//////////////////////////////////////////////////
// Event Handlers:
//////////////////////////////////////////////////
// No event handlers needed here.

//////////////////////////////////////////////////
// JSX (Return):
//////////////////////////////////////////////////
// No JSX return in this file.

//////////////////////////////////////////////////
// Export Statement:
//////////////////////////////////////////////////
// (Exports are already done inline)
