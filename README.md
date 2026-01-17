# Wedding RSVP Tracker

An elegant React application for managing wedding RSVP information for Nicholas Krilis and Elisabeth Feliciani.

## Features

- **Secure Login**: Name-based authentication via Google Sheets
- **Event Information**: Church ceremony and reception details
- **RSVP Management**: Meal preferences, dietary restrictions, and attendance tracking
- **Elegant Design**: Grayscale theme with elegant typography

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Google Sheets API:
   - Create a Google Cloud Project
   - Enable Google Sheets API
   - Create an API key
   - Create a Google Sheet with guest information
   - Copy `.env.example` to `.env` and add your credentials

3. Google Sheet Format:
   - Column A: Full Name
   - Column B: Email (optional)
   - Column C: Church Attendance
   - Column D: Reception Attendance
   - Column E: Meal Preference
   - Column F: Dietary Restrictions

4. Run the application:
```bash
npm start
```

## Development

The app will open at [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
```
