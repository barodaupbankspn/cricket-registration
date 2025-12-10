# UltraMsg Setup Guide for WhatsApp Integration

This guide will help you connect your WhatsApp number to the **UltraMsg** API so you can send messages from the Cricket Registration Portal.

## Step 1: Create an Account
1.  Go to [**UltraMsg.com**](https://ultramsg.com/).
2.  Click **"Sign Up"** (Start Free Trial).
3.  Fill in your details to create an account.

## Step 2: Connect Your WhatsApp
1.  Once logged in, you will be redirected to your **Dashboard**.
2.  You will see a **QR Code** (just like WhatsApp Web).
3.  Open **WhatsApp** on your phone.
4.  Go to **Menu** (⋮) -> **Linked devices** -> **Link a device**.
5.  **Scan the QR Code** on the UltraMsg dashboard.
6.  Your instance status should change to **"Authenticated"** or **"Connected"**.

## Step 3: Get Your Credentials
1.  On your UltraMsg Dashboard, look for the **Instance Info** section.
2.  Find **Instance ID** (e.g., `instance12345`).
3.  Find **Token** (e.g., `abcdef123456`).
4.  **Copy** both of these.

## Step 4: Configure the Script
1.  Open your [**Google Apps Script**](https://script.google.com/) project.
    - *Or open the `google-apps-script.js` file in this folder.*
2.  Scroll to the top where `WHATSAPP_CONFIG` is defined.
3.  Replace the placeholder values with your copied credentials:

    ```javascript
    const WHATSAPP_CONFIG = {
        ENABLE_WHATSAPP: true,
        PROVIDER: 'UltraMsg',
        INSTANCE_ID: 'instance99999', // <--- PASTE YOUR INSTANCE ID HERE
        TOKEN: '12345abcdef',        // <--- PASTE YOUR TOKEN HERE
        API_URL: 'https://api.ultramsg.com'
    };
    ```
4.  **Save** (Floppy icon) and **Deploy** as a Web App again (Manage Deployments -> Edit -> New Version).

## Step 5: Test It
1.  In the Apps Script editor, find the function `testWhatsApp` (around line 150).
2.  Change the `testPhone` variable to your own number (e.g., `'919876543210'`).
3.  Click **Run** button in the toolbar (select `testWhatsApp` function).
4.  Check your phone for the message!

> [!NOTE]
> UltraMsg is a paid service after the trial, but it is much more reliable than free bots.
