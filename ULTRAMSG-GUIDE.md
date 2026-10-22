# Enable selected-player WhatsApp sending

The admin page can send a message to selected registered players through the existing Google Apps Script deployment and UltraMsg. The browser sends only the selected player emails, message, and an administrator key. Keep the UltraMsg token and administrator key in Apps Script Script Properties; never add them to this public GitHub Pages repository.

## Requirements

- An UltraMsg account with a connected WhatsApp instance, its instance ID, and token.
- Access to the Google Apps Script project that serves the configured Sheets web app.
- The current `google-apps-script.js` saved to that project and deployed as a new web app version.

UltraMsg is a third-party service and may charge fees. Use this integration only for recipients who have agreed to receive messages and follow WhatsApp/UltraMsg policies. A provider success response means accepted by the provider, not guaranteed delivery or read status.

## Configure credentials privately

1. Open the Apps Script project associated with the deployed Sheets web app. Replace its code with the current repository version of `google-apps-script.js`, preserving any project-specific code you need.
2. In **Project Settings → Script Properties**, create these properties:
   - `ULTRAMSG_INSTANCE_ID`: the instance ID from UltraMsg.
   - `ULTRAMSG_TOKEN`: the UltraMsg instance token.
   - `WHATSAPP_ADMIN_KEY`: a long, random administrator key (at least 32 random bytes, encoded as hex/base64). Generate it with a password manager or another trusted local random generator. Store it privately; do not put it in GitHub, HTML, JavaScript, or a shared spreadsheet.
3. In UltraMsg, make sure the instance is authenticated/connected and its plan permits sending.
4. In Apps Script, save the code. If permissions are requested, run `forceAuth` once from the editor and approve the UrlFetch permission.
5. Open **Deploy → Manage deployments**, edit the existing web-app deployment, choose **New version**, and deploy. Keep the web app URL the same as the one configured in `sheets-api.js`. It must be accessible to the public website; the sending action itself checks the administrator key. Do not use an unrestricted provider token in the website.

The deployment must contain the `WHATSAPP_ADMIN_KEY` validation in `doPost` and recipient accounting in `broadcastWhatsApp`. Older deployed versions may ignore the key and return `success: true` with `sent: 0`; that response is not a successful send. Update and redeploy the script before using broadcasts. The website rejects any response that does not confirm every selected recipient.

## Send from the admin page

1. Open the admin portal, sign in, and sync the player list.
2. Select players in the table and choose **Message Selected → WhatsApp**.
3. Write the message and select **Send WhatsApp (Selected)**.
4. Paste the `WHATSAPP_ADMIN_KEY` when prompted. The site does not save it. The UI reports the provider response and any failed recipients.

The **Open Manual WhatsApp Drafts** button is a fallback that opens one encoded `wa.me` chat per selected player; an administrator must review and press **Send** in each chat. Email also remains a mail-app draft and is not automatically sent.

## Smoke test and troubleshooting

First test with your own opted-in WhatsApp number and a short message. If sending fails, check:

- The deployed Apps Script is the newest version and `broadcastWhatsApp` exists in that version.
- The entered admin key exactly matches the `WHATSAPP_ADMIN_KEY` Script Property.
- The two `ULTRAMSG_*` properties are present, and the UltraMsg instance is connected.
- The selected players have valid phone numbers in international format (10-digit Indian numbers are prefixed with `91`).
- Apps Script **Executions** and UltraMsg logs for the actual provider error.

Do not share the administrator key or UltraMsg token in screenshots or support messages. Rotate the key in Script Properties if exposed; update the deployed script if needed, and use the replacement key in the admin portal.
