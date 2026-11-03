# Enable selected-player email sending

The admin portal sends a separate email to each selected player's registered email address through the Google Apps Script backend. It does not open a mail app or put recipients in BCC. Apps Script checks the selected email addresses against the shared registration sheet before sending.

## Configure the sender

1. Open the Apps Script project connected to the registration spreadsheet and replace its code with the current `google-apps-script.js`.
2. Deploy the web app with **Execute as: Me**, and keep the existing deployment URL configured in `sheets-api.js`.
3. The Google account that owns the deployment should be `barodaupbankspn@gmail.com` to send from that address. If that address is a verified Gmail send-as alias on the executing account, it can also be used as the sender. The script validates this; it does not spoof arbitrary From addresses.
4. In **Project Settings → Script Properties**, set:
   - `EMAIL_SENDER_ADDRESS`: `barodaupbankspn@gmail.com`
   - `WHATSAPP_ADMIN_KEY`: the private admin key already used to authorize WhatsApp broadcasts. Do not put this key in the website or repository.
5. In the Apps Script editor, run `authorizeEmail` once and grant the Gmail sending permission. This function only requests authorization; it does not send an email.
6. Under **Deploy → Manage deployments**, edit the web-app deployment, choose **New version**, and deploy the updated script. The website and Apps Script endpoint must use the same deployment URL.

The admin page checks for the new, admin-key-protected email capability before submitting a broadcast. If the check reports an outdated script, it stops without posting the message; deploy the current Apps Script before trying again.

## Send from the admin portal

1. Sign in, sync the player list, and select the intended registered players.
2. Choose **Message Selected → Email**, enter a subject and message, then choose **Send Email to Selected**.
3. Confirm the recipient count and enter the `WHATSAPP_ADMIN_KEY`. The site does not save the key.
4. The status reports how many messages were sent and any failures. Each recipient gets an individual email rather than seeing other players' addresses.

The Apps Script account is subject to Google's mail quotas and account policies. A message is counted as sent only when GmailApp accepts it; this does not guarantee inbox delivery. Test with one opted-in address first. Never send unsolicited bulk mail.
