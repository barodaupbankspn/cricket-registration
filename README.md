# Shahjahanpur Spartans - Cricket Team Registration Portal

A modern, responsive web application for managing cricket team registrations for the Shahjahanpur Spartans (Uttar Pradesh Gramin Bank).

## Features

- **Player Registration**: Easy-to-use form for new players to sign up.
- **Status Check**: Players can check their application status (Approved, Rejected, or Under Observation) using their mobile number.
- **Admin Dashboard**: Secure area for administrators to manage players, approve/reject applications, and export data.
- **Google Sheets Integration**: All data is stored and synced with Google Sheets for easy management and backup.
- **Selected-player messages**: Email opens a mail-app draft. WhatsApp can be sent through the protected Apps Script/UltraMsg integration after credentials are configured, or opened as manual click-to-chat drafts.
- **Responsive Design**: Works seamlessly on mobile and desktop devices.

## Setup Instructions

1.  **Google Sheets Setup**:
    - Create a new Google Sheet.
    - Open `Extensions` > `Apps Script`.
    - Copy the code from `google-apps-script.js` into the script editor.
    - Deploy as a Web App (Execute as: Me). The web app must allow the published site to call it without a Google sign-in; otherwise registration fails. Consider the privacy implications of exposing player records before enabling public access.
    - Copy the Web App URL.
    - Paste the URL into `sheets-api.js` (replace the `GOOGLE_SHEETS_URL` variable).
    - After changing `google-apps-script.js`, deploy a new version of the Apps Script web app. The deployed script must include the `addPlayer` handler or registrations will remain only in that browser's local storage.

2.  **Hosting**:
    - Upload all files in this folder to GitHub.
    - Enable GitHub Pages (Settings > Pages > Source: main branch / root).
    - Your website will be live!

## Technologies Used

- HTML5, CSS3 (Vanilla + Custom Animations)
- JavaScript (ES6+)
- Google Apps Script (Backend)
- Google Sheets (Database)

## Registration visibility and messaging

Registrations are saved to the current browser immediately, so that device can show them in the admin portal and registered-player views even when Sheets is unavailable. Showing registrations on other devices requires a working, deployed Apps Script endpoint connected to the team spreadsheet. `sheets-api.js` contains a **web app endpoint**, not a Google Sheets document URL; the document link is owned by the Google account that created the spreadsheet and is not stored in this repository.

Email remains a draft with selected players in BCC. Automated WhatsApp uses the Apps Script endpoint and requires `ULTRAMSG_INSTANCE_ID`, `ULTRAMSG_TOKEN`, and `WHATSAPP_ADMIN_KEY` in Apps Script Script Properties. Never commit provider credentials or the admin key to this public repository. See [ULTRAMSG-GUIDE.md](ULTRAMSG-GUIDE.md) for setup and deployment instructions. The manual WhatsApp draft option still requires the admin to press Send in each chat.

If the previously committed UltraMsg token was active, revoke and rotate it in the provider dashboard; removing it from the current source does not remove it from Git history.

## Credits

Developed for the BUPGB STAFF SPORTS CLUB.
