// Google Apps Script to handle form submissions from the Chrome extension
// and save them to a Google Sheet

// INSTRUCTIONS:
// 1. Create a new Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Copy and paste this code
// 4. Save the project with a name like "NexSellPro Feedback"
// 5. Deploy as a web app:
//    - Click "Deploy" > "New deployment"
//    - Select type: "Web app"
//    - Set "Execute as" to "Me"
//    - Set "Who has access" to "Anyone"
//    - Click "Deploy"
// 6. Copy the Web App URL and replace the scriptUrl in the FeedbackForm.tsx component

/**
 * Handles GET requests to the web app.
 * @param {Object} e - The event object.
 * @return {HtmlOutput} - HTML response indicating the service is running.
 */
function doGet(e) {
  return HtmlService.createHtmlOutput("The NexSellPro feedback service is running.");
}

/**
 * Handles POST requests to the web app.
 * @param {Object} e - The event object containing form data.
 * @return {TextOutput} - JSON response indicating success or failure.
 */
function doPost(e) {
  try {
    // Get the active spreadsheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Feedback");
    
    // Create the sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet("Feedback");
      // Add headers
      sheet.appendRow([
        "Timestamp", 
        "Feedback", 
        "Email", 
        "URL"
      ]);
    }
    
    // Get form data
    var feedback = e.parameter.feedback || "No feedback provided";
    var email = e.parameter.email || "Not provided";
    var timestamp = e.parameter.timestamp || new Date().toISOString();
    var url = e.parameter.url || "Not provided";
    
    // Append data to sheet
    sheet.appendRow([
      timestamp,
      feedback,
      email,
      url
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log the error
    Logger.log(error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
} 