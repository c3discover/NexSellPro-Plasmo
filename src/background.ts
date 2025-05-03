/**
 * @fileoverview Chrome Extension Background Service Worker for NexSellPro
 * @author NexSellPro
 * @created 2025-04-27
 * @lastModified 2025-04-27
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import { Storage } from "@plasmohq/storage";
import { LogModule, logGroup, logTable, logGroupEnd, logError } from "~/data/utils/logger";

////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const CLIENT_ID = "469074340331-62763q6jvgj6voqg4vu8mi5bgfhs0qkd.apps.googleusercontent.com";
const REDIRECT_URI = "https://oeoabefdhedmaeoghdmbcechbiepmfpc.chromiumapp.org";
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file"
].join(" ");

const EXPORT_ALL_DATA = "EXPORT_ALL_DATA";
const START_GOOGLE_AUTH = "START_GOOGLE_AUTH";
const REVOKE_TOKEN = "REVOKE_TOKEN";

// Sheet formatting constants
const HEADER_FORMAT = {
  backgroundColor: { red: 0.2, green: 0.8, blue: 0.8 },
  textFormat: {
    bold: true,
    fontSize: 11
  }
};

const DATA_FORMAT = {
  backgroundColor: { red: 1, green: 1, blue: 1 },
  textFormat: {
    fontSize: 10
  }
};

////////////////////////////////////////////////
// Types:
////////////////////////////////////////////////
interface MessageResponse {
  success: boolean;
  error?: string;
  token?: string;
  url?: string;
}

interface ExportData {
  type: string;
  token: string;
  data: Record<string, any>;
  fields: string[];
  settings?: {
    enabled: boolean;
    order: number;
  }[];
}

////////////////////////////////////////////////
// Message Handlers:
////////////////////////////////////////////////
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === START_GOOGLE_AUTH) {
    handleGoogleAuth(sendResponse);
    return true; // Keep message channel open
  }

  if (message.type === REVOKE_TOKEN) {
    handleTokenRevocation(message.token, sendResponse);
    return true; // Keep message channel open
  }

  if (message.type === "EXPORT_TO_SHEETS") {
    const { token, sheetTitle, fields, values } = message.payload;

    (async () => {
      try {
        const sheetUrl = await exportToGoogleSheet(token, sheetTitle, fields, values);
        sendResponse({ success: true, sheetUrl });
      } catch (err) {
        console.error("[GOOGLE SHEETS EXPORT] Failed:", err);
        sendResponse({ 
          success: false, 
          error: err instanceof Error ? err.message : err.toString() 
        });
      }
    })();

    return true; // Keep message channel open for async response
  }
});

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////

/**
 * Handle Google OAuth2 authentication flow
 */
async function handleGoogleAuth(sendResponse: (response: MessageResponse) => void) {
  try {
    logGroup(LogModule.GOOGLE_SHEETS, "Starting Google Auth");
    
    const authUrl = `${GOOGLE_AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${encodeURIComponent(SCOPES)}&prompt=consent`;

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true
      },
      (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          const error = chrome.runtime.lastError?.message || "Authentication failed";
          logError(LogModule.GOOGLE_SHEETS, `Auth Error: ${error}`);
          sendResponse({ success: false, error });
          return;
        }

        const accessToken = new URL(redirectUrl).hash
          .split("&")
          .find((part) => part.startsWith("#access_token") || part.startsWith("access_token"))
          ?.split("=")[1];

        if (!accessToken) {
          logError(LogModule.GOOGLE_SHEETS, "No access token in response");
          sendResponse({ success: false, error: "No access token received" });
          return;
        }

        logTable(LogModule.GOOGLE_SHEETS, "Auth Success", {
          tokenLength: accessToken.length
        });
        logGroupEnd();

        sendResponse({ success: true, token: accessToken });
      }
    );
  } catch (err) {
    const error = err instanceof Error ? err.message : "Authentication failed";
    logError(LogModule.GOOGLE_SHEETS, `Auth Error: ${error}`);
    sendResponse({ success: false, error });
  }
}

/**
 * Handle token revocation
 */
async function handleTokenRevocation(token: string, sendResponse: (response: MessageResponse) => void) {
  try {
    logGroup(LogModule.GOOGLE_SHEETS, "Revoking Token");

    const response = await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`, {
      method: "GET"
    });

    if (!response.ok) {
      throw new Error("Token revocation failed");
    }

    logTable(LogModule.GOOGLE_SHEETS, "Revocation Success", {
      status: response.status
    });
    logGroupEnd();

    sendResponse({ success: true });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Token revocation failed";
    logError(LogModule.GOOGLE_SHEETS, `Revocation Error: ${error}`);
    sendResponse({ success: false, error });
  }
}

/**
 * Handle data export to Google Sheets
 */
async function handleDataExport(message: ExportData, sendResponse: (response: MessageResponse) => void) {
  try {
    logGroup(LogModule.GOOGLE_SHEETS, "Starting Data Export");
    
    const { token, data, fields } = message;

    // Validate token
    if (!token) {
      throw new Error("No access token provided");
    }

    // Validate data and fields
    if (!data || typeof data !== "object") {
      throw new Error("Invalid data format");
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      throw new Error("Invalid fields format");
    }

    logTable(LogModule.GOOGLE_SHEETS, "Export Data", {
      fields: fields.length,
      dataKeys: Object.keys(data).length
    });

    // Create new spreadsheet
    const createResponse = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        properties: {
          title: `NexSellPro Export - ${data.itemId || new Date().toISOString()}`,
          defaultFormat: {
            ...DATA_FORMAT,
            wrapStrategy: "WRAP"
          }
        },
        sheets: [{
          properties: {
            title: "Product Data",
            gridProperties: {
              frozenRowCount: 1,
              rowCount: 2,
              columnCount: fields.length
            }
          },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: fields.map(field => ({
                  userEnteredValue: { stringValue: field },
                  userEnteredFormat: HEADER_FORMAT
                }))
              },
              {
                values: fields.map(field => ({
                  userEnteredValue: { stringValue: String(data[field] ?? "") },
                  userEnteredFormat: DATA_FORMAT
                }))
              }
            ]
          }]
        }]
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create sheet: ${await createResponse.text()}`);
    }

    const sheet = await createResponse.json();
    const sheetId = sheet.spreadsheetId;

    if (!sheetId) {
      throw new Error("No spreadsheet ID in response");
    }

    // Apply auto-resizing to all columns
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requests: [{
          autoResizeDimensions: {
            dimensions: {
              sheetId: 0,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: fields.length
            }
          }
        }]
      })
    });

    const url = `https://docs.google.com/spreadsheets/d/${sheetId}`;
    
    logTable(LogModule.GOOGLE_SHEETS, "Export Success", {
      url,
      fields: fields.length
    });
    logGroupEnd();

    sendResponse({
      success: true,
      url
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Export failed";
    logError(LogModule.GOOGLE_SHEETS, `Export Error: ${error}`);
    sendResponse({ success: false, error });
  }
}

// Add the exportToGoogleSheet function
async function exportToGoogleSheet(
  token: string,
  sheetTitle: string,
  fields: string[],
  values: any[][]
): Promise<string> {
  try {
    // Create new spreadsheet
    const createResponse = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        properties: {
          title: sheetTitle
        }
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create spreadsheet: ${createResponse.statusText}`);
    }

    const { spreadsheetId } = await createResponse.json();

    // Update values
    const range = `Sheet1!A1:${String.fromCharCode(65 + fields.length - 1)}${values.length}`;

    console.log("[EXPORT DEBUG] Preparing to send to Google Sheets");
    console.log("[EXPORT DEBUG] Sheet ID:", spreadsheetId);
    console.log("[EXPORT DEBUG] Range:", range);
    console.log("[EXPORT DEBUG] Fields:", fields);
    console.log("[EXPORT DEBUG] Values:", values);

    if (!Array.isArray(values) || !Array.isArray(values[0])) {
      throw new Error("[GOOGLE SHEETS EXPORT] Invalid values payload. Must be a 2D array.");
    }

    const updateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ values })
      }
    );

    if (!updateResponse.ok) {
      throw new Error(`Failed to update values: ${updateResponse.statusText}`);
    }

    // Apply formatting
    const requests = [
      // Format header row
      {
        updateCells: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: fields.length
          },
          rows: [
            {
              values: fields.map(() => ({
                userEnteredFormat: HEADER_FORMAT
              }))
            }
          ],
          fields: "userEnteredFormat"
        }
      },
      // Format data rows
      {
        updateCells: {
          range: {
            sheetId: 0,
            startRowIndex: 1,
            endRowIndex: values.length,
            startColumnIndex: 0,
            endColumnIndex: fields.length
          },
          rows: values.slice(1).map(() => ({
            values: fields.map(() => ({
              userEnteredFormat: DATA_FORMAT
            }))
          })),
          fields: "userEnteredFormat"
        }
      },
      // Auto-resize columns
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: 0,
            dimension: "COLUMNS",
            startIndex: 0,
            endIndex: fields.length
          }
        }
      }
    ];

    const formatResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ requests })
      }
    );

    if (!formatResponse.ok) {
      throw new Error(`Failed to apply formatting: ${formatResponse.statusText}`);
    }

    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  } catch (error) {
    console.error("[GOOGLE SHEETS EXPORT] Error:", error);
    throw error;
  }
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export {}; 
