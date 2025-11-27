# Quick Start Guide - Google Sheets Setup

## 🎯 What You Need to Do

You have **5 simple steps** to complete to activate the centralized registration system:

### ✅ Step 1: Create Google Sheet (2 minutes)
1. Open [Google Sheets](https://sheets.google.com)
2. Click "+ Blank" to create new spreadsheet
3. Name it: **Cricket Registration Database**
4. Copy these headers into Row 1:
   ```
   ID | Name | Age | Contact | Email | Place of Posting | Address | Role | Batting Style | Bowling Style | Experience | Jersey Size | Status | Registered At
   ```

### ✅ Step 2: Create Apps Script (3 minutes)
1. In your Google Sheet: **Extensions → Apps Script**
2. Delete any existing code
3. Open the file `google-apps-script.js` from your project folder
4. Copy ALL the code and paste into Apps Script editor
5. **Save** (Ctrl+S) and name it: **Cricket Registration API**

### ✅ Step 3: Deploy Web App (4 minutes)
1. Click **Deploy → New deployment**
2. Click gear icon ⚙️ → Select **Web app**
3. Settings:
   - Description: `Cricket Registration API`
   - Execute as: `Me`
   - Who has access: `Anyone`
4. Click **Deploy**
5. Click **Authorize access** → Choose your account
6. Click **Advanced** → **Go to Cricket Registration API (unsafe)** → **Allow**
7. **📋 COPY THE WEB APP URL** (it looks like: `https://script.google.com/macros/s/AKfycby...`)

### ✅ Step 4: Update Your Code (1 minute)
1. Open `sheets-api.js` in your project folder
2. Find line 5: `const GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';`
3. Replace `'YOUR_GOOGLE_SCRIPT_URL_HERE'` with the URL you copied (keep the quotes!)
4. **Save the file**

Example:
```javascript
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyXXXXXXXXXXXXXXXXXXXXXXXXX/exec';
```

### ✅ Step 5: Test & Deploy (5 minutes)
1. **Test locally:**
   - Open `register.html` in your browser
   - Fill out a test registration
   - Check your Google Sheet - the data should appear!
   
2. **Test admin:**
   - Open `admin.html` and login (ID: 109058, Password: admin12345)
   - Click "Sync from Google Sheets"
   - You should see the test registration!

3. **Deploy online:**
   - Upload ALL files to your hosting service
   - Test from a different device
   - Verify everything works!

## 🎉 That's It!

Once you complete these 5 steps, your registration system will:
- ✅ Store all registrations in Google Sheets
- ✅ Work from any device
- ✅ Show all registrations to admin
- ✅ Automatically backup data

## 📚 Need More Help?

- **Visual Guide**: Open `setup-guide.html` in your browser
- **Detailed Instructions**: Read `google-sheets-setup.md`
- **Full Documentation**: Check `walkthrough.md`

## 🔧 Troubleshooting

**Registration not showing in Google Sheet?**
- Check browser console (F12) for errors
- Verify the Web App URL in `sheets-api.js` is correct
- Make sure you saved the file after updating the URL

**Admin can't see players?**
- Click "Sync from Google Sheets" button
- Check your internet connection
- Verify Google Sheet has data

**Still having issues?**
- Make sure the Apps Script is deployed with "Anyone" access
- Try redeploying the Web App
- Check that all column headers in Google Sheet match exactly

## 📞 Support

Email: barodaupbankspn@gmail.com
