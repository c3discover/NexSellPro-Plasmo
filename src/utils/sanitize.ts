/**
 * Sanitizes a string to prevent XSS attacks
 * @param input The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  // Replace HTML special characters with their entity equivalents
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes a number input
 * @param input The input to sanitize
 * @param defaultValue The default value to return if the input is not a valid number
 * @returns The sanitized number
 */
export function sanitizeNumber(input: string | number, defaultValue = 0): number {
  if (typeof input === 'number') {
    return isNaN(input) ? defaultValue : input;
  }
  
  if (!input) return defaultValue;
  
  // Remove any non-numeric characters except decimal point and minus sign
  const sanitized = input.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(sanitized);
  
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Sanitizes an object by sanitizing all string and number properties
 * @param obj The object to sanitize
 * @returns The sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result: Record<string, any> = { ...obj };
  
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const value = result[key];
      
      if (typeof value === 'string') {
        result[key] = sanitizeString(value);
      } else if (typeof value === 'number') {
        result[key] = sanitizeNumber(value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeObject(value);
      }
    }
  }
  
  return result as T;
}

/**
 * Sanitizes a URL to prevent XSS attacks
 * @param url The URL to sanitize
 * @returns The sanitized URL or an empty string if the URL is invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    // Check if the URL is valid
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return '';
    }
    
    return parsedUrl.toString();
  } catch (error) {
    // If the URL is invalid, return an empty string
    return '';
  }
} 