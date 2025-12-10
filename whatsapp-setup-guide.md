# WhatsApp Setup Guide - CallMeBot Integration

## Overview

This guide will help you set up WhatsApp notifications for the Cricket Registration System using CallMeBot, a free WhatsApp messaging service.

## Prerequisites

- A WhatsApp account on your mobile phone
- The mobile number you want to use for sending messages

## Step-by-Step Setup

### Step 1: Get Your CallMeBot API Key

1. **Add CallMeBot to your contacts:**
   - Save this number in your phone: **+34 644 28 95 87**
   - Name it "CallMeBot" or any name you prefer

2. **Send activation message:**
   - Open WhatsApp
   - Send this exact message to the CallMeBot number:
     ```
     I allow callmebot to send me messages
     ```

3. **Receive your API key:**
   - You will receive a reply with your unique API key
   - It will look something like: `123456`
   - **Save this API key** - you'll need it in the next step

### Step 2: Configure Google Apps Script

1. Open your Google Sheet (Cricket Registration Database)

2. Go to **Extensions** → **Apps Script**

3. Find the **WHATSAPP CONFIGURATION** section at the top of the code (lines 4-18)

4. Update the configuration:
   ```javascript
   const WHATSAPP_CONFIG = {
       ENABLE_WHATSAPP: true, // Change from false to true
       API_KEY: '123456', // Replace with your actual API key
       COUNTRY_CODE: '91' // Keep as 91 for India
   };
   ```

5. Click **💾 Save** (or press Ctrl+S)

6. Click **Deploy** → **Manage deployments** → **Edit** (pencil icon) → **Version**: New version → **Deploy**

### Step 3: Test WhatsApp Integration

1. In the Apps Script editor, find the `testWhatsApp()` function

2. Update the test phone number:
   ```javascript
   const testPhone = '9876543210'; // Replace with your 10-digit mobile number
   ```

3. Click **💾 Save**

4. Select `testWhatsApp` from the function dropdown (top toolbar)

5. Click **▶ Run**

6. Check your WhatsApp - you should receive a test message! 🎉

### Step 4: Test Full Registration Flow

1. Open your registration website (`register.html`)

2. Fill out the registration form with test data
   - **Important:** Use a mobile number that has WhatsApp

3. Submit the form

4. Check the registered player's WhatsApp - they should receive:
   ```
   🏏 Shahjahanpur Spartans

   Hello [Name]! 👋

   Your registration has been successfully received.

   ✅ Status: Under Observation

   We will review your details and update you shortly.

   Best Regards,
   Shahjahanpur Spartans Team
   ```

## Troubleshooting

### Issue: "WhatsApp is disabled in configuration"
**Solution:** Make sure you set `ENABLE_WHATSAPP: true` in the configuration

### Issue: "WhatsApp API key not configured"
**Solution:** Replace `'YOUR_CALLMEBOT_API_KEY'` with your actual API key from Step 1

### Issue: No message received
**Possible causes:**
1. Wrong API key - verify you copied it correctly
2. Phone number format issue - make sure it's a 10-digit number without spaces or special characters
3. WhatsApp not installed on the recipient's phone
4. Check the Apps Script execution logs: **View** → **Executions** to see error details

### Issue: Message received but formatting is wrong
**Solution:** CallMeBot supports basic WhatsApp formatting:
- `*bold*` for bold text
- `_italic_` for italic text
- Emojis work normally

## Important Notes

### CallMeBot Limitations

- **Free service** - no cost
- **Rate limits** - approximately 1 message per second
- **Personal use** - best for small teams (not for mass messaging)
- **No delivery confirmation** - you won't know if message was delivered
- **Single sender** - messages come from your WhatsApp number

### For Production Use

If you need more reliability or higher volume:
1. **Twilio WhatsApp API** - Professional service with delivery tracking
2. **Meta WhatsApp Business API** - Official API for businesses
3. **WATI.io or Interakt** - Indian WhatsApp Business platforms

## Phone Number Format

The system automatically handles Indian phone numbers:
- **Input:** `9876543210` (10 digits)
- **Processed:** `919876543210` (adds country code 91)

For other countries, update `COUNTRY_CODE` in the configuration.

## Security Notes

- Keep your API key private - don't share it publicly
- The API key is stored in Google Apps Script (secure)
- Only you can access and modify the script
- Messages are sent via CallMeBot's servers

## Next Steps

Once WhatsApp is working:
1. ✅ Test with multiple registrations
2. ✅ Verify messages are received promptly
3. ✅ Monitor for any errors in Apps Script logs
4. ✅ Consider upgrading to a professional service if needed

## Support

If you encounter issues:
1. Check the Apps Script execution logs
2. Verify your API key is correct
3. Test with the `testWhatsApp()` function first
4. Ensure the recipient has WhatsApp installed
