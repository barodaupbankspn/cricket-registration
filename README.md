# Shahjahanpur Spartans - Cricket Team Registration Portal

A modern, responsive web application for managing cricket team registrations for the Shahjahanpur Spartans (Uttar Pradesh Gramin Bank).

## Features

- **Player Registration**: Easy-to-use form for new players to sign up.
- **Status Check**: Players can check their application status (Approved, Rejected, or Under Observation) using their mobile number.
- **Admin Dashboard**: Secure area for administrators to manage players, approve/reject applications, and export data.
- **Admin player corrections**: Admins can edit a registered player's contact, personal, and cricket profile details from the player list.
- **Google Sheets Integration**: All data is stored and synced with Google Sheets for easy management and backup.
- **Selected-player email**: Send individual email messages to selected players through the protected Google Apps Script backend.
- **Responsive Design**: Works seamlessly on mobile and desktop devices.

## Setup Instructions

1.  **Google Sheets Setup**:
    - Create a new Google Sheet.
    - Open `Extensions` > `Apps Script`.
    - Copy the code from `google-apps-script.js` into the script editor.
    - Deploy as a Web App (Execute as: Me). The web app must allow the published site to call it without a Google sign-in; otherwise registration fails. Consider the privacy implications of exposing player records before enabling public access.
    - Copy the Web App URL.
    - Paste the URL into `sheets-api.js` (replace the `GOOGLE_SHEETS_URL` variable).
    - After changing `google-apps-script.js`, deploy a new version of the Apps Script web app. The deployed script must include the `addPlayer` and `updatePlayerDetails` handlers or registrations and admin corrections will remain only on the current device.

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

The admin portal sends email individually to the selected players' registered addresses through Google Apps Script. Set `EMAIL_SENDER_ADDRESS` and `EMAIL_ADMIN_KEY` in Apps Script Script Properties, authorize Gmail sending, and deploy the current `google-apps-script.js`. The same private `EMAIL_ADMIN_KEY` is required to save admin corrections to player details; it is requested when saving and is not stored by the website. To send as `barodaupbankspn@gmail.com`, the web app must execute under that Google account or use it as a verified Gmail send-as alias. See [EMAIL-SETUP.md](EMAIL-SETUP.md). Never commit the email admin key to this public repository.

## Credits

Developed for the BUPGB STAFF SPORTS CLUB.
