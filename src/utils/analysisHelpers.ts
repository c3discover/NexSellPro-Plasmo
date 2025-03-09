/**
 * Shared helper functions for Analysis-related components
 */

/**
 * Calculate the number of days between a given date and today
 * @param dateString - The date to compare with today
 * @returns The number of days between the dates
 */
export function getDaysAgo(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a brand name matches a seller name
 * @param brandName - The brand name to check
 * @param sellerName - The seller name to check against
 * @returns True if the brand appears to be selling the product
 */
export function isBrandMatch(brand: string | undefined, sellerName: string | undefined): boolean {
  if (!brand || !sellerName) return false;
  
  // Convert both to lowercase for case-insensitive comparison
  const normalizedBrand = brand.toLowerCase().trim();
  const normalizedSeller = sellerName.toLowerCase().trim();
  
  // Direct match
  if (normalizedBrand === normalizedSeller) return true;
  
  // Check if seller contains brand or vice versa
  if (normalizedSeller.includes(normalizedBrand)) return true;
  if (normalizedBrand.includes(normalizedSeller)) return true;
  
  return false;
} 