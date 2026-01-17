import axios from 'axios';

const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;
const SHEET_NAME = process.env.REACT_APP_SHEET_NAME || 'Sheet1';
const WEB_APP_URL = process.env.REACT_APP_WEB_APP_URL;

export const searchGuest = async (fullName) => {
  try {
    const range = `${SHEET_NAME}!A:F`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
    
    const response = await axios.get(url);
    const rows = response.data.values || [];
    
    // Skip header row and search for matching name
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] && row[0].toLowerCase().trim() === fullName.toLowerCase().trim()) {
        const guestData = {
          rowIndex: i + 1, // 1-indexed for Google Sheets (i=1 means row 2, so i+1=2)
          fullName: row[0] || '',
          email: row[1] || '',
          churchAttendance: row[2] || '',
          receptionAttendance: row[3] || '',
          mealPreference: row[4] || '',
          dietaryRestrictions: row[5] || ''
        };
        console.log('Found guest at row:', guestData.rowIndex, guestData);
        return guestData;
      }
    }
    
    return null; // No match found
  } catch (error) {
    console.error('Error searching guest:', error);
    throw error;
  }
};

export const updateGuestRSVP = async (rowIndex, data) => {
  try {
    if (!WEB_APP_URL) {
      throw new Error('Web App URL not configured. Please set REACT_APP_WEB_APP_URL in your .env file.');
    }
    
    console.log('Updating row:', rowIndex, 'with data:', data);
    
    const response = await axios.post(WEB_APP_URL, {
      rowIndex,
      churchAttendance: data.churchAttendance,
      receptionAttendance: data.receptionAttendance,
      mealPreference: data.mealPreference,
      dietaryRestrictions: data.dietaryRestrictions
    }, {
      headers: {
        'Content-Type': 'text/plain' // Required for Google Apps Script
      }
    });
    
    console.log('Update response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error updating guest RSVP:', error);
    throw error;
  }
};
