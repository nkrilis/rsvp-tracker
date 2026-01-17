/**
 * Google Apps Script - Deploy this as a Web App
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Spreadsheet
 * 2. Extensions → Apps Script
 * 3. Paste this code
 * 4. Deploy → New deployment → Web app
 * 5. Set "Execute as: Me" and "Who has access: Anyone"
 * 6. Copy the Web App URL to your .env file
 * 
 * ⚠️ IMPORTANT: This file will show errors in VS Code because it uses Google Apps Script APIs.
 * These are NOT real errors - the code will work perfectly when deployed to Google Apps Script.
 * You can safely ignore all the red underlines in VS Code.
 */

/* eslint-disable no-undef */
/* global SpreadsheetApp, ContentService, Logger */

/**
 * Handles POST requests to update guest RSVP information
 * @param {Object} e - Event object containing POST data
 * @returns {Object} JSON response with CORS headers
 */
function doPost(e) {
  try {
    // Log incoming request
    Logger.log('Received POST request');
    Logger.log('Post data: ' + e.postData.contents);
    
    // IMPORTANT: Replace this with your actual Spreadsheet ID
    // Find it in your spreadsheet URL: docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
    const SPREADSHEET_ID = '17ZDyoezTruRK7dPksHTMW3ua38vaW1QlSV0dEOpRUmE';
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName('guest-list');
    
    if (!sheet) {
      throw new Error('Sheet "guest-list" not found. Available sheets: ' + 
                      spreadsheet.getSheets().map(s => s.getName()).join(', '));
    }
    
    const data = JSON.parse(e.postData.contents);
    Logger.log('Parsed data: ' + JSON.stringify(data));
    
    // Update the row with the guest's RSVP information
    const rowIndex = parseInt(data.rowIndex);
    
    Logger.log('Updating row: ' + rowIndex);
    
    // Update each cell individually with logging
    if (data.churchAttendance) {
      sheet.getRange(rowIndex, 3).setValue(data.churchAttendance);
      Logger.log('Set church attendance: ' + data.churchAttendance);
    }
    
    if (data.receptionAttendance) {
      sheet.getRange(rowIndex, 4).setValue(data.receptionAttendance);
      Logger.log('Set reception attendance: ' + data.receptionAttendance);
    }
    
    if (data.mealPreference) {
      sheet.getRange(rowIndex, 5).setValue(data.mealPreference);
      Logger.log('Set meal preference: ' + data.mealPreference);
    }
    
    if (data.dietaryRestrictions !== undefined) {
      sheet.getRange(rowIndex, 6).setValue(data.dietaryRestrictions);
      Logger.log('Set dietary restrictions: ' + data.dietaryRestrictions);
    }
    
    // Force save
    SpreadsheetApp.flush();
    
    // Return response with CORS headers
    const output = ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'RSVP updated successfully',
      rowIndex: rowIndex,
      updatedData: data
    }));
    
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    
    const output = ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    }));
    
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

/**
 * Handles GET requests (for testing)
 * @returns {Object} Text response
 */
function doGet(e) {
  const output = ContentService.createTextOutput('RSVP Web App is running!');
  return output;
}
