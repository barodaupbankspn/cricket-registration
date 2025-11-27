# Google Sheets Setup Guide

Follow these steps to set up Google Sheets as your registration database.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ Blank"** to create a new spreadsheet
3. Name it: **"Cricket Registration Database"**
4. In the first row, add these column headers:
   - A1: `ID`
   - B1: `Name`
   - C1: `Age`
   - D1: `Contact`
   - E1: `Email`
   - F1: `Place of Posting`
   - G1: `Address`
   - H1: `Role`
   - I1: `Batting Style`
   - J1: `Bowling Style`
   - K1: `Experience`
   - L1: `Jersey Size`
   - M1: `Status`
   - N1: `Registered At`

## Step 2: Create Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code in the editor
3. Copy and paste the code from `google-apps-script.js` (provided below)
4. Click **File** → **Save** (or Ctrl+S)
5. Name the project: **"Cricket Registration API"**

## Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **"Web app"**
4. Configure settings:
   - **Description**: Cricket Registration API
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** → **Go to Cricket Registration API (unsafe)**
9. Click **Allow**
10. **COPY THE WEB APP URL** - You'll need this!

## Step 4: Update Your Website Code

1. Open `sheets-api.js` in your project
2. Find this line:
   ```javascript
   const GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
   ```
3. Replace `YOUR_GOOGLE_SCRIPT_URL_HERE` with the URL you copied
4. Save the file

## Step 5: Test the Integration

1. Open `register.html` in your browser
2. Fill out and submit a registration form
3. Check your Google Sheet - you should see the new registration!
4. Open `admin.html` and login
5. Click "Sync from Google Sheets" - you should see the registration

## Troubleshooting

### Registration not appearing in Google Sheets?
- Check the browser console (F12) for errors
- Verify the Web App URL is correct in `sheets-api.js`
- Make sure the Web App is deployed with "Anyone" access

### Admin dashboard not showing players?
- Click the "Sync from Google Sheets" button
- Check your internet connection
- Verify the Google Sheet has data

### "Not configured" error?
- Make sure you updated the `GOOGLE_SHEETS_URL` in `sheets-api.js`
- The URL should start with `https://script.google.com/`

## Security Notes

- The Web App URL is public but only accepts data in the expected format
- Consider adding validation in the Apps Script for production use
- Regularly backup your Google Sheet data

## Next Steps

Once setup is complete:
1. Upload your website files to your hosting service
2. Test registration from different devices
3. Use the GitHub backup feature to save player data
