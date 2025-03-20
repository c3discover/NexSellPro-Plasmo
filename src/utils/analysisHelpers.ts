/**
 * @fileoverview Helper functions for product analysis and data processing
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No external imports needed

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// No constants needed

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// No types needed

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

/**
 * Calculate the number of days between a given date and today
 * @param dateString - The date to compare with today
 * @returns The number of days between the dates
 */
export function getDaysAgo(dateString: string): number {
  // Create Date objects for comparison
  const date = new Date(dateString);
  const now = new Date();
  
  // Calculate absolute difference in milliseconds
  const diffTime = Math.abs(now.getTime() - date.getTime());
  
  // Convert milliseconds to days and round up
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a brand name matches a seller name
 * @param brand - The brand name to check
 * @param sellerName - The seller name to check against
 * @returns True if the brand appears to be selling the product
 */
export function isBrandMatch(brand: string | undefined, sellerName: string | undefined): boolean {
  // Return false if either value is missing
  if (!brand || !sellerName) return false;
  
  // Normalize strings for case-insensitive comparison
  const normalizedBrand = brand.toLowerCase().trim();
  const normalizedSeller = sellerName.toLowerCase().trim();
  
  // Check for exact match
  if (normalizedBrand === normalizedSeller) return true;
  
  // Check for partial matches in either direction
  if (normalizedSeller.includes(normalizedBrand)) return true;
  if (normalizedBrand.includes(normalizedSeller)) return true;
  
  return false;
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
// All functions are exported above 