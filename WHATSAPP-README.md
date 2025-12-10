# WhatsApp Integration - Quick Reference

## What's New

WhatsApp notifications are now sent to the Admin when players register, alongside email notifications.

## Files Modified

- **google-apps-script.js** - Added WhatsApp messaging functionality
- **SETUP-INSTRUCTIONS.md** - Added Step 6 for WhatsApp setup
- **whatsapp-setup-guide.md** - Detailed setup instructions

## Quick Setup (3 Steps)

### 1. Get API Key
- Add **+34 694 25 79 52** (or +34 684 73 40 44) to WhatsApp contacts
- Send: `I allow callmebot to send me messages`
- Save the API key you receive

### 2. Configure Script
In Google Apps Script, update the config (lines 14-18):
```javascript
const WHATSAPP_CONFIG = {
    ENABLE_WHATSAPP: true,        // Change to true
    API_KEY: 'YOUR_KEY_HERE',     // Paste your API key
    COUNTRY_CODE: '91'            // India (change if needed)
};
```

### 3. Test & Deploy
- Save the script
- Run `testWhatsApp()` function to test
- Deploy new version

## Message Format

Admin receives this WhatsApp notification on registration:

```
🏏 New Registration Alert!
   
👤 Name: [Player Name]
📱 Contact: [Player Number]
🏏 Role: [Player Role]
📅 Date: [Date]
   
Please check the dashboard for more details.
```

## Testing

Use the `testWhatsApp()` function in Apps Script:
1. Update test phone number in the function
2. Select `testWhatsApp` from function dropdown
3. Click Run ▶
4. Check WhatsApp for test message

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No message received | Verify API key is correct |
| "WhatsApp disabled" error | Set `ENABLE_WHATSAPP: true` |
| Wrong format | Check phone number is 10 digits |

## Full Documentation

See `whatsapp-setup-guide.md` for complete instructions and troubleshooting.

## Important Notes

- **Free service** via CallMeBot
- Works for Indian numbers (country code 91)
- Messages sent from your WhatsApp number
- For production, consider Twilio or Meta WhatsApp Business API
