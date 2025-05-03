/**
 * @fileoverview Service for handling Google Sheets API operations
 * @author NexSellPro
 * @created 2024-03-21
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import { Storage } from "@plasmohq/storage";
import { LogModule, logError, logInfo, logGroup, logTable, logGroupEnd } from "~/data/utils/logger";

////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////
const storage = new Storage();
const SHEET_ID_KEY = "nsp_google_sheet_id";

////////////////////////////////////////////////
// Types:
////////////////////////////////////////////////
export interface ExportResponse {
  success: boolean;
  error?: string;
  url?: string;
}

export interface ExportData {
  rows: any[];
  sheetName: string;
}

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////

/**
 * Create a new Google Sheet with timestamp
 */
async function createNewSheet(token: string): Promise<string> {
  const timestamp = new Date().toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      properties: {
        title: `NexSellPro Export - ${timestamp}`
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create sheet: ${response.statusText}`);
  }

  const data = await response.json();
  return data.spreadsheetId;
}

/**
 * Get or create a spreadsheet ID
 */
async function getOrCreateSpreadsheetId(token: string): Promise<string> {
  try {
    // Create new sheet every time - don't reuse old ones
    const newId = await createNewSheet(token);
    await storage.set(SHEET_ID_KEY, newId);
    return newId;
  } catch (error) {
    throw new Error(`Failed to get/create spreadsheet: ${error.message}`);
  }
}

////////////////////////////////////////////////
// Main Export Function:
////////////////////////////////////////////////

/**
 * Export data to Google Sheets
 */
export async function exportToGoogleSheet({
  data,
  logger
}: {
  data: any[][];
  logger: { logGroup: Function; logTable: Function; logGroupEnd: Function; logError: Function };
}): Promise<ExportResponse> {
  try {
    logger.logGroup(LogModule.GOOGLE_SHEETS, "Starting Google Sheets Export");
    logger.logTable(LogModule.GOOGLE_SHEETS, "Export Data", { rows: data.length });

    const token = await getAccessToken();
    const spreadsheetId = await getOrCreateSpreadsheetId(token);
    const sheetName = "Sheet1";

    // Clear the sheet first
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:Z1000:clear`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    // Append the data with valueInputOption and insertDataOption as query parameters
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, 
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          values: data
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to append data: ${response.statusText}`);
    }

    logger.logTable(LogModule.GOOGLE_SHEETS, "Export Success", {
      spreadsheetId,
      rowsExported: data.length
    });
    logger.logGroupEnd();

    return {
      success: true,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
    };
  } catch (error) {
    logger.logError(LogModule.GOOGLE_SHEETS, `Export failed: ${error.message}`);
    logger.logGroupEnd();
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to get access token - implementation depends on your auth setup
async function getAccessToken(): Promise<string> {
  const token = await storage.get("googleAccessToken");
  if (!token) {
    throw new Error("No Google access token found. Please connect with Google first.");
  }
  return token;
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default exportToGoogleSheet;
