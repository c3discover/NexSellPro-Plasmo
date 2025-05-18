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

    // --- Google Sheets formatting for NexSellPro exports ---
    // Applies after data is written. Format spec:
    // - Row 1: Bold, light gray background
    // - Thin borders around all populated cells
    // - Column A: left-align
    // - Column B: center-align
    // - Columns C+: right-align
    // Update this block if export format changes.
    const numRows = data.length;
    const numCols = data[0].length;
    const formatResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requests: [
            // Header row formatting (row 1)
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: numCols
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.95,
                      green: 0.95,
                      blue: 0.95
                    },
                    textFormat: {
                      bold: true,
                      fontFamily: "Inter"
                    },
                    horizontalAlignment: "CENTER",
                    verticalAlignment: "MIDDLE"
                  }
                },
                fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)"
              }
            },
            // Borders for all populated cells
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: numRows,
                  startColumnIndex: 0,
                  endColumnIndex: numCols
                },
                cell: {
                  userEnteredFormat: {
                    borders: {
                      top: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
                      bottom: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
                      left: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
                      right: { style: "SOLID", width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } }
                    }
                  }
                },
                fields: "userEnteredFormat.borders"
              }
            },
            // Alignment: Column A (left)
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: numRows,
                  startColumnIndex: 0,
                  endColumnIndex: 1
                },
                cell: {
                  userEnteredFormat: {
                    horizontalAlignment: "LEFT"
                  }
                },
                fields: "userEnteredFormat.horizontalAlignment"
              }
            },
            // Alignment: Column B (center)
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: numRows,
                  startColumnIndex: 1,
                  endColumnIndex: 2
                },
                cell: {
                  userEnteredFormat: {
                    horizontalAlignment: "CENTER"
                  }
                },
                fields: "userEnteredFormat.horizontalAlignment"
              }
            },
            // Alignment: Columns C+ (right)
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: numRows,
                  startColumnIndex: 2,
                  endColumnIndex: numCols
                },
                cell: {
                  userEnteredFormat: {
                    horizontalAlignment: "RIGHT"
                  }
                },
                fields: "userEnteredFormat.horizontalAlignment"
              }
            },
            // Auto-resize columns
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: 0,
                  dimension: "COLUMNS",
                  startIndex: 0,
                  endIndex: numCols
                }
              }
            }
          ]
        })
      }
    );

    if (!formatResponse.ok) {
      throw new Error(`Failed to apply formatting: ${formatResponse.statusText}`);
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
