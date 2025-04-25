/**
 * @fileoverview Centralized logging utility for consistent formatting and control
 * @author NexSellPro
 * @created 2025-04-15
 * @lastModified 2025-04-18
 */

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////

/**
 * Configuration options for the logger
 */
export interface LoggerConfig {
  enabled: boolean;       // Master toggle for all logging
  level: LogLevel;        // Minimum level to log
  groupCollapsed: boolean; // Whether to use groupCollapsed (true) or group (false)
  showTimestamps: boolean; // Whether to include timestamps in logs
  moduleFilter: string[]; // Only show logs from these modules (empty array = show all)
}

/**
 * Log level enum for filtering
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export enum LogModule {
  RAW_DATA = '📥 RAW DATA',            // getData.ts
  SELLER_DATA = '🏪 SELLER DATA',     // sellerData.ts
  LOCAL_DATA = '📌 LOCAL DATA',        // localData.ts (user inputs)
  CALCULATIONS = '🔢 CALCULATIONS', // calculations.ts
  USED_DATA = '📦 USED DATA',          // Final output
  RAW_DATA2 = '📥',            // getData.ts
  SELLER_DATA2 = '🏪',     // sellerData.ts
  LOCAL_DATA2 = '📌',        // localData.ts (user inputs)
  CALCULATIONS2 = '🔢', // calculations.ts
  USED_DATA2 = '📦',          // Final output
}

/**
 * Styles for different modules and log levels
 */
const LOG_STYLES = {
  // Module styles
  [LogModule.RAW_DATA]: 'color: #22c55e; font-weight: bold; font-size: 12px',     // Green
  [LogModule.SELLER_DATA]: 'color: #6366f1; font-weight: bold; font-size: 12px',  // Indigo
  [LogModule.LOCAL_DATA]: 'color: #f43f5e; font-weight: bold; font-size: 12px',    // Rose
  [LogModule.CALCULATIONS]: 'color: #f59e0b; font-weight: bold; font-size: 12px',  // Amber
  [LogModule.USED_DATA]: 'color: #0ea5e9; font-weight: bold; font-size: 12px',    // Sky blue

  // Level styles (used as secondary styles)
  DEBUG: 'color: #9ca3af; font-style: italic;',                                  // Gray
  INFO: 'color: #ffffff;',                                                       // White
  WARN: 'color: #fbbf24; font-weight: bold;',                                    // Yellow
  ERROR: 'color: #ef4444; font-weight: bold;'                                    // Red
};

////////////////////////////////////////////////
// Default Configuration:
////////////////////////////////////////////////

// Default configuration (can be modified by setLoggerConfig)
let config: LoggerConfig = {
  enabled: true,
  level: LogLevel.DEBUG,
  groupCollapsed: true,
  showTimestamps: false,
  moduleFilter: []
};

// Storage key for persisting config in localStorage
const LOGGER_CONFIG_KEY = 'nexSellPro_loggerConfig';

// Try to load config from localStorage
try {
  const savedConfig = localStorage.getItem(LOGGER_CONFIG_KEY);
  if (savedConfig) {
    config = { ...config, ...JSON.parse(savedConfig) };
  }
} catch (e) {
  // Silent fail if localStorage isn't available or valid
}

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////

/**
 * Format a message with proper styling
 */
const formatMessage = (module: LogModule, level: LogLevel, message: string): string => {
  const levelName = LogLevel[level];
  return `[${module}] ${level > LogLevel.INFO ? `[${levelName}] ` : ''}${message}`;
};

/**
 * Check if a log should be shown based on level and module filters
 */
const shouldLog = (module: LogModule, level: LogLevel): boolean => {
  if (!config.enabled) return false;
  if (level < config.level) return false;
  if (config.moduleFilter.length > 0 && !config.moduleFilter.includes(module)) return false;
  return true;
};

/**
 * Save the current config to localStorage
 */
const saveConfig = (): void => {
  try {
    localStorage.setItem(LOGGER_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    // Silent fail if localStorage isn't available
  }
};

////////////////////////////////////////////////
// Main Logging Functions:
////////////////////////////////////////////////

/**
 * Update logger configuration
 * @param newConfig - Partial config to merge with existing config
 */
export const setLoggerConfig = (newConfig: Partial<LoggerConfig>): void => {
  config = { ...config, ...newConfig };
  saveConfig();
};

/**
 * Toggle debug mode on/off
 * @param enable - Whether to enable debug mode 
 */
export const setDebugMode = (enable: boolean): void => {
  config.level = enable ? LogLevel.DEBUG : LogLevel.INFO;
  saveConfig();
};

/**
 * Log a debug message
 * @param module - The module the log is coming from
 * @param message - Message to log
 * @param ...args - Additional arguments to log
 */
export const logDebug = (module: LogModule, message: string, ...args: any[]): void => {
  if (!shouldLog(module, LogLevel.DEBUG)) return;
  console.debug(`%c${formatMessage(module, LogLevel.DEBUG, message)}`, LOG_STYLES[module], ...args);
};

/**
 * Log an info message
 * @param module - The module the log is coming from
 * @param message - Message to log
 * @param ...args - Additional arguments to log
 */
export const logInfo = (module: LogModule, message: string, ...args: any[]): void => {
  if (!shouldLog(module, LogLevel.INFO)) return;
};

/**
 * Log a warning message
 * @param module - The module the log is coming from
 * @param message - Message to log
 * @param ...args - Additional arguments to log
 */
export const logWarn = (module: LogModule, message: string, ...args: any[]): void => {
  if (!shouldLog(module, LogLevel.WARN)) return;
  console.warn(`%c${formatMessage(module, LogLevel.WARN, message)}`, LOG_STYLES[module], ...args);
};

/**
 * Log an error message
 * @param module - The module the log is coming from
 * @param message - Message to log
 * @param ...args - Additional arguments to log
 */
export const logError = (module: LogModule, message: string, ...args: any[]): void => {
  if (!shouldLog(module, LogLevel.ERROR)) return;
  console.error(`%c${formatMessage(module, LogLevel.ERROR, message)}`, LOG_STYLES[module], ...args);
};

/**
 * Start a collapsible log group
 * @param module - The module the group is coming from
 * @param title - Group title
 */
export const logGroup = (module: LogModule, title: string): void => {
  if (!shouldLog(module, LogLevel.DEBUG)) return;
  const groupMethod = config.groupCollapsed ? console.groupCollapsed : console.group;
  groupMethod(`%c${formatMessage(module, LogLevel.INFO, title)}`, LOG_STYLES[module]);
};

/**
 * End a log group
 */
export const logGroupEnd = (): void => {
  if (!config.enabled) return;
  console.groupEnd();
};

/**
 * Log an object as a table
 * @param module - The module the table is coming from
 * @param title - Table title
 * @param data - Data to display in table format
 */
export const logTable = (module: LogModule, title: string, data: any): void => {
  if (!shouldLog(module, LogLevel.DEBUG)) return;
  logGroup(module, title);
  console.table(data);
  logGroupEnd();
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default {
  setLoggerConfig,
  setDebugMode,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logGroup,
  logGroupEnd,
  logTable,
  LogModule,
  LogLevel
}