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
    // - Freeze Row 1 and Columns A & B
    // - Set entire sheet font to Inter (fallback Arial), center/middle align, wrap text
    // - Add thin borders to all cells
    // - Row 1: bold, light gray background
    // - Cell B1: bold font (overrides column B style)
    // - Column A: width 100px, light blue, bold
    // - Column B: width 200px, light gray, medium font (except B1)
    // - Columns C+: width 150px, center align
    // - Set row height to 100px for row with 'Main Image' in col B
    // Dynamic range detection
    const numRows = data.length;
    const numCols = data[0].length;
    // Find the row index (zero-based) where column B is 'Main Image'
    let mainImageRow = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i][1] && typeof data[i][1] === 'string' && data[i][1].trim().toLowerCase() === 'main image') {
        mainImageRow = i;
        break;
      }
    }
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
            // Freeze row 1 and columns A & B
            {
              updateSheetProperties: {
                properties: {
                  sheetId: 0,
                  gridProperties: {
                    frozenRowCount: 1,
                    frozenColumnCount: 2
                  }
                },
                fields: "gridProperties.frozenRowCount,gridProperties.frozenColumnCount"
              }
            },
            // Set font, center/middle align, wrap for all cells
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
                    textFormat: { fontFamily: "Inter" },
                    horizontalAlignment: "CENTER",
                    verticalAlignment: "MIDDLE",
                    wrapStrategy: "WRAP"
                  }
                },
                fields: "userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)"
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
            // Header row formatting (row 1): bold, light gray
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
                    backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
                    textFormat: { bold: true, fontFamily: "Inter" }
                  }
                },
                fields: "userEnteredFormat(backgroundColor,textFormat)"
              }
            },
            // Cell B1: bold font (overrides column B style)
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 1,
                  endColumnIndex: 2
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: { bold: true, fontFamily: "Inter" }
                  }
                },
                fields: "userEnteredFormat.textFormat"
              }
            },
            // Column A: width 100px, light blue, bold
            {
              updateDimensionProperties: {
                range: {
                  sheetId: 0,
                  dimension: "COLUMNS",
                  startIndex: 0,
                  endIndex: 1
                },
                properties: { pixelSize: 100 },
                fields: "pixelSize"
              }
            },
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
                    backgroundColor: { red: 0.85, green: 0.92, blue: 0.98 },
                    textFormat: { bold: true, fontFamily: "Inter" }
                  }
                },
                fields: "userEnteredFormat(backgroundColor,textFormat)"
              }
            },
            // Column B: width 200px, light gray, medium font (except B1)
            {
              updateDimensionProperties: {
                range: {
                  sheetId: 0,
                  dimension: "COLUMNS",
                  startIndex: 1,
                  endIndex: 2
                },
                properties: { pixelSize: 200 },
                fields: "pixelSize"
              }
            },
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 1,
                  endRowIndex: numRows,
                  startColumnIndex: 1,
                  endColumnIndex: 2
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
                    textFormat: { bold: false, fontSize: 11, fontFamily: "Inter" }
                  }
                },
                fields: "userEnteredFormat(backgroundColor,textFormat)"
              }
            },
            // Columns C+: width 150px, center align
            ...(numCols > 2 ? [{
              updateDimensionProperties: {
                range: {
                  sheetId: 0,
                  dimension: "COLUMNS",
                  startIndex: 2,
                  endIndex: numCols
                },
                properties: { pixelSize: 150 },
                fields: "pixelSize"
              }
            }] : []),
            // Set row height to 100px for mainImage row
            ...(mainImageRow >= 0 ? [{
              updateDimensionProperties: {
                range: {
                  sheetId: 0,
                  dimension: "ROWS",
                  startIndex: mainImageRow,
                  endIndex: mainImageRow + 1
                },
                properties: { pixelSize: 100 },
                fields: "pixelSize"
              }
            }] : [])
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
