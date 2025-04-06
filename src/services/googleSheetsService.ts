/**
 * @fileoverview Google Sheets service for the NexSellPro extension.
 * @author NexSellPro
 * @created 2024-03-21
 * @modified 2024-03-21
 */

/////////////////////////////////////////////////
// Imports
/////////////////////////////////////////////////

import { getValidAccessToken, connectToGoogle } from "./googleAuthService"

/////////////////////////////////////////////////
// Constants
/////////////////////////////////////////////////
let accessToken: string | null = null;

const GOOGLE_SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/////////////////////////////////////////////////
// Types
/////////////////////////////////////////////////

export interface ProductData {
  id: string;
  name: string;
  price: number;
  cost: number;
  profit: number;
  margin: number;
  category: string;
  brand: string;
  url: string;
}

interface ExportOptions {
  title?: string;
  sheetName?: string;
}

/////////////////////////////////////////////////
// Functions
/////////////////////////////////////////////////
/**
 * Authenticate and set access token
 */
export async function authenticate(): Promise<boolean> {
  try {
    const token = await getValidAccessToken()

    if (token) {
      accessToken = token
      return true
    }

    const connected = await connectToGoogle()

    if (connected) {
      const newToken = await getValidAccessToken()
      if (newToken) {
        accessToken = newToken
        return true
      }
    }

    return false
  } catch (error) {
    console.error("Authentication failed:", error)
    return false
  }
}


/**
 * Create a new Google Sheet
 */
async function createSpreadsheet(title: string): Promise<string> {
  console.log('Creating new Google Sheet with title:', title);

  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    console.error('No valid access token available for creating spreadsheet');
    throw new Error('No valid access token available. Please reconnect to Google.');
  }

  console.log('Creating spreadsheet with token:', accessToken.substring(0, 10) + '...');

  try {
    const response = await fetch(`${GOOGLE_SHEETS_API_BASE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title
        },
        sheets: [{
          properties: {
            title: 'Product Data',
            gridProperties: {
              rowCount: 1000,
              columnCount: 26
            }
          }
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error creating spreadsheet:', response.status, errorText);
      throw new Error(`Failed to create spreadsheet: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully created spreadsheet with ID:', data.spreadsheetId);
    return data.spreadsheetId;
  } catch (error) {
    console.error('Error in createSpreadsheet:', error);
    throw error;
  }
}

/**
 * Export product data to Google Sheets
 */
export async function exportToGoogleSheets(
  products: ProductData[],
  options: ExportOptions = {}
): Promise<string> {
  console.log('Starting export to Google Sheets with', products.length, 'products');

  try {
    // Create a new spreadsheet
    const title = options.title || `NexSellPro Export ${new Date().toLocaleDateString()}`;
    const spreadsheetId = await createSpreadsheet(title);

    // Prepare the data
    const headers = [
      'Product ID',
      'Name',
      'Price',
      'Cost',
      'Profit',
      'Margin',
      'Category',
      'Brand',
      'URL'
    ];

    const values = [
      headers,
      ...products.map(product => [
        product.id,
        product.name,
        product.price,
        product.cost,
        product.profit,
        product.margin,
        product.category,
        product.brand,
        product.url
      ])
    ];

    // Update the spreadsheet with data
    console.log('Updating spreadsheet with data...');
    const accessToken = await getValidAccessToken();

    if (!accessToken) {
      console.error('No valid access token available for updating spreadsheet');
      throw new Error('No valid access token available. Please reconnect to Google.');
    }

    try {
      const updateResponse = await fetch(
        `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/A1:Z${values.length}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            range: `A1:Z${values.length}`,
            majorDimension: 'ROWS',
            values
          })
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Error updating spreadsheet:', updateResponse.status, errorText);
        throw new Error(`Failed to update spreadsheet: ${updateResponse.status} ${updateResponse.statusText}`);
      }

      console.log('Successfully updated spreadsheet with data');
    } catch (error) {
      console.error('Error updating spreadsheet with data:', error);
      throw error;
    }

    // Format the spreadsheet
    console.log('Formatting spreadsheet...');
    try {
      await formatSpreadsheet(spreadsheetId, accessToken);
      console.log('Successfully formatted spreadsheet');
    } catch (error) {
      console.error('Error formatting spreadsheet:', error);
      // Don't throw here, we still want to return the spreadsheet ID even if formatting fails
    }

    return spreadsheetId;
  } catch (error) {
    console.error('Error exporting to Google Sheets:', error);
    throw error;
  }
}

/**
 * Format the spreadsheet
 */
async function formatSpreadsheet(spreadsheetId: string, accessToken: string): Promise<void> {
  try {
    console.log('Applying formatting to spreadsheet...');

    // Apply formatting to the spreadsheet
    const formatResponse = await fetch(
      `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            // Format header row
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.8,
                      green: 0.8,
                      blue: 0.8
                    },
                    textFormat: {
                      bold: true
                    },
                    horizontalAlignment: 'CENTER'
                  }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
              }
            },
            // Auto-resize columns
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: 0,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: 9
                }
              }
            }
          ]
        })
      }
    );

    if (!formatResponse.ok) {
      const errorText = await formatResponse.text();
      console.error('Error formatting spreadsheet:', formatResponse.status, errorText);
      throw new Error(`Failed to format spreadsheet: ${formatResponse.status} ${formatResponse.statusText}`);
    }

    console.log('Successfully applied formatting to spreadsheet');
  } catch (error) {
    console.error('Error formatting spreadsheet:', error);
    throw error;
  }
} 