/**
 * @fileoverview Centralized logging utility for NexSellPro
 * @author NexSellPro
 * @created 2024-03-21
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Types:
////////////////////////////////////////////////
export enum LogModule {
  RAW_DATA = '📥 RAW DATA',            // getData.ts
  SELLER_DATA = '🏪 SELLER DATA',     // sellerData.ts
  LOCAL_DATA = '📌 LOCAL DATA',        // localData.ts (user inputs)
  CALCULATIONS = '🔢 CALCULATIONS', // calculations.ts
  USED_DATA = '📦 USED DATA',          // Final output
  GOOGLE_SHEETS = "𝄜 GOOGLE SHEETS",
  SETTINGS = "⚙️ SETTINGS",
  WALMART = "🏪 WALMART",
  RAW_DATA2 = '📥',            // getData.ts
  SELLER_DATA2 = '🏪',     // sellerData.ts
  LOCAL_DATA2 = '📌',        // localData.ts (user inputs)
  CALCULATIONS2 = '🔢', // calculations.ts
  USED_DATA2 = '📦',          // Final output

}

interface LogData {
  [key: string]: any;
}

////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////
const LOG_STYLES = {
  group: "color: #0891b2; font-weight: bold;",
  info: "color: #0284c7;",
  success: "color: #059669;",
  warning: "color: #d97706;",
  error: "color: #dc2626;",
  table: "color: #6366f1;"
};

////////////////////////////////////////////////
// Logging Functions:
////////////////////////////////////////////////

/**
 * Start a collapsible log group
 */
export function logGroup(module: LogModule, title: string): void {
  console.group(`%c[${module}] ${title}`, LOG_STYLES.group);
}

/**
 * End the current log group
 */
export function logGroupEnd(): void {
  console.groupEnd();
}

/**
 * Log tabular data
 */
export function logTable(module: LogModule, title: string, data: LogData): void {
  console.log(`%c[${module}] ${title}:`, LOG_STYLES.table);
  console.table(data);
}

/**
 * Log informational message
 */
export function logInfo(module: LogModule, message: string): void {
  console.log(`%c[${module}] ${message}`, LOG_STYLES.info);
}

/**
 * Log success message
 */
export function logSuccess(module: LogModule, message: string): void {
  console.log(`%c[${module}] ✓ ${message}`, LOG_STYLES.success);
}

/**
 * Log warning message
 */
export function logWarning(module: LogModule, message: string): void {
  console.log(`%c[${module}] ⚠ ${message}`, LOG_STYLES.warning);
}

/**
 * Log error message
 */
export function logError(module: LogModule, message: string): void {
  console.error(`%c[${module}] ❌ ${message}`, LOG_STYLES.error);
}

/**
 * Log debug message (only in development)
 */
export function logDebug(module: LogModule, message: string, data?: any): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`%c[${module}] 🔍 ${message}`, "color: #9333ea;");
    if (data) {
      console.dir(data);
    }
  }
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default {
  logGroup,
  logGroupEnd,
  logTable,
  logInfo,
  logSuccess,
  logWarning,
  logError,
  logDebug
};