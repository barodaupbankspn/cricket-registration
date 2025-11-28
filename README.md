# Shahjahanpur Spartans - Cricket Team Registration Portal

A modern, responsive web application for managing cricket team registrations for the Shahjahanpur Spartans (Uttar Pradesh Gramin Bank).

## Features

- **Player Registration**: Easy-to-use form for new players to sign up.
- **Status Check**: Players can check their application status (Approved, Rejected, or Under Observation) using their mobile number.
- **Admin Dashboard**: Secure area for administrators to manage players, approve/reject applications, and export data.
- **Google Sheets Integration**: All data is stored and synced with Google Sheets for easy management and backup.
- **Responsive Design**: Works seamlessly on mobile and desktop devices.

## Setup Instructions

1.  **Google Sheets Setup**:
    - Create a new Google Sheet.
    - Open `Extensions` > `Apps Script`.
    - Copy the code from `google-apps-script.js` into the script editor.
    - Deploy as a Web App (Execute as: Me, Who has access: Anyone).
    - Copy the Web App URL.
    - Paste the URL into `sheets-api.js` (replace the `GOOGLE_SHEETS_URL` variable).

2.  **Hosting**:
    - Upload all files in this folder to GitHub.
    - Enable GitHub Pages (Settings > Pages > Source: main branch / root).
    - Your website will be live!

## Technologies Used

- HTML5, CSS3 (Vanilla + Custom Animations)
- JavaScript (ES6+)
- Google Apps Script (Backend)
- Google Sheets (Database)

## Credits

Developed for the BUPGB STAFF SPORTS CLUB.
