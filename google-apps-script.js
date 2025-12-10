// Google Apps Script for Cricket Registration
// Copy this entire code into your Google Apps Script editor

// ========================================
// WHATSAPP CONFIGURATION (UltraMsg / Generic)
// ========================================
// 1. Sign up at https://ultramsg.com/ (or similar provider)
// 2. Create an instance and get your Instance ID and Token
// 3. Fill them in below

const WHATSAPP_CONFIG = {
    ENABLE_WHATSAPP: true, // Set to true to enable
    PROVIDER: 'UltraMsg', // Just for reference
    INSTANCE_ID: 'instance155365', // REPLACE THIS
    TOKEN: 'pio1dd7zqwtngt1h',       // REPLACE THIS
    API_URL: 'https://api.ultramsg.com' // Base URL
};

// -------------------------------------------------------------
// ONE-TIME SETUP: Run this function ONCE to authorize the script
// -------------------------------------------------------------
function forceAuth() {
    console.log("Requesting permissions...");
    // This simple call forces Google to ask for "Connect to an external service" permission
    UrlFetchApp.fetch("https://www.google.com");
    console.log("Permissions granted!");
}
// -------------------------------------------------------------

function doGet(e) {
    const action = e.parameter.action;

    if (action === 'getPlayers') {
        return getPlayers();
    }

    return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action;

        if (action === 'addPlayer') {
            return addPlayer(data.player);
        } else if (action === 'updateStatus') {
            return updatePlayerStatus(data.playerId, data.status);
        } else if (action === 'deletePlayer') {
            return deletePlayer(data.playerId);
        } else if (action === 'broadcast') {
            return broadcastEmail(data.subject, data.message, data.recipients);
        } else if (action === 'broadcastWhatsApp') {
            return broadcastWhatsApp(data.message, data.recipients);
        } else if (action === 'updateJerseyNumber') {
            return updateJerseyNumber(data.playerId, data.jerseyNumber);
        }

        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: 'Unknown action'
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Get the active spreadsheet
function getSheet() {
    return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

// Helper: Send Email Notification
function sendEmailNotification(to, subject, body) {
    if (!to || !to.includes('@')) {
        return { success: false, error: 'Invalid email address: ' + to };
    }
    try {
        GmailApp.sendEmail(to, subject, "", {
            htmlBody: body
        });
        return { success: true };
    } catch (e) {
        return { success: false, error: e.toString() };
    }
}

// Helper: Send WhatsApp Message via UltraMsg
function sendWhatsAppMessage(phoneNumber, message) {
    if (!WHATSAPP_CONFIG.ENABLE_WHATSAPP) {
        return { success: false, error: 'WhatsApp is disabled in configuration' };
    }

    if (WHATSAPP_CONFIG.INSTANCE_ID === 'instance12345') {
        return { success: false, error: 'WhatsApp Instance ID not configured' };
    }

    try {
        // Cleaning Phone Number
        let cleanPhone = phoneNumber.toString().replace(/\D/g, '');

        // Ensure international format without +
        // If 10 digits (India), add 91
        if (cleanPhone.length === 10) {
            cleanPhone = '91' + cleanPhone;
        }

        const payload = {
            token: WHATSAPP_CONFIG.TOKEN,
            to: cleanPhone,
            body: message
        };

        const options = {
            method: 'post',
            payload: payload,
            muteHttpExceptions: true // Added to capture error responses
        };

        const url = `${WHATSAPP_CONFIG.API_URL}/${WHATSAPP_CONFIG.INSTANCE_ID}/messages/chat`;

        console.log(`Sending WhatsApp to ${cleanPhone}...`); // Debug log

        const response = UrlFetchApp.fetch(url, options);
        const responseText = response.getContentText();
        console.log(`UltraMsg Response: ${responseText}`); // Debug log

        const json = JSON.parse(responseText);

        if (json.sent === 'true' || json.id) {
            return { success: true };
        } else {
            return { success: false, error: JSON.stringify(json) };
        }

    } catch (e) {
        return { success: false, error: e.toString() };
    }
}

// MANUAL TEST FUNCTION
// Run this directly in the editor to test email sending
function testEmail() {
    const email = Session.getActiveUser().getEmail();
    console.log('Attempting to send email to:', email);

    const result = sendEmailNotification(
        email,
        'Test Email from Script',
        '<h1>It Works!</h1><p>This is a test email from your Google Apps Script.</p>'
    );

    if (result.success) {
        console.log('✅ Email sent successfully!');
    } else {
        console.error('❌ Email failed:', result.error);
    }
}

// MANUAL TEST FUNCTION FOR WHATSAPP
// Run this directly in the editor to test WhatsApp sending
// Replace '919876543210' with your actual mobile number (with country code)
function testWhatsApp() {
    const testPhone = '918960281989'; // Updated to user's number
    console.log('Attempting to send WhatsApp to:', testPhone);

    const message = `🏏 *Test Message*

Hello! 👋

This is a test message from your Cricket Registration System (UltraMsg).

If you received this, WhatsApp integration is working! ✅`;

    const result = sendWhatsAppMessage(testPhone, message);

    if (result.success) {
        console.log('✅ WhatsApp sent successfully!');
    } else {
        console.error('❌ WhatsApp failed:', result.error);
    }
}

// Broadcast WhatsApp to All Players
function broadcastWhatsApp(message, recipients) {
    try {
        const sheet = getSheet();
        const data = sheet.getDataRange().getValues();
        let count = 0;
        let errors = [];

        // If recipients provided, convert to Set for O(1) lookup
        const targetEmails = recipients ? new Set(recipients) : null;

        for (let i = 1; i < data.length; i++) {
            const email = data[i][4];
            const name = data[i][1];
            const contact = data[i][3]; // Phone number in Column D (index 3)

            // Skip if we have a target list and this email isn't in it
            // (Using email as the unique identifier for selection from frontend)
            if (targetEmails && !targetEmails.has(email)) {
                continue;
            }

            if (contact) {
                const personalization = `Hello ${name},\n\n`;
                const fullMessage = personalization + message;

                const result = sendWhatsAppMessage(contact, fullMessage);

                if (result.success) {
                    count++;
                } else {
                    errors.push(`${name}: ${result.error}`);
                    // Add a small delay to avoid rate limits if getting errors
                    Utilities.sleep(500);
                }

                // Rate limiting: UltraMsg allows ~10 msg/sec, but let's be safe
                // Sleep 200ms between messages
                Utilities.sleep(200);
            }
        }

        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: `WhatsApp broadcast sent to ${count} players.`,
            errors: errors.length > 0 ? errors : null
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Get all players
// Column mapping: A=0(ID), B=1(Name), C=2(Age), D=3(Contact), E=4(Email), 
// F=5(PlaceOfPosting), G=6(Address), H=7(Role), I=8(BattingStyle), 
// J=9(BowlingStyle), K=10(Experience), L=11(JerseySize), M=12(Status), N=13(RegisteredAt)
function getPlayers() {
    try {
        const sheet = getSheet();
        const data = sheet.getDataRange().getValues();

        // Skip header row
        const players = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];

            // Skip completely empty rows
            if (!row[0] && !row[1] && !row[3]) {
                continue;
            }

            players.push({
                id: row[0] || i, // Use row index as fallback ID
                name: row[1] || 'Unknown', // Fallback for missing name
                age: row[2] || 'N/A',
                contact: row[3] || 'N/A',
                email: row[4] || 'N/A',
                placeOfPosting: row[5] || '',
                address: row[6] || '',
                role: row[7] || 'N/A',
                battingStyle: row[8] || 'N/A',
                bowlingStyle: row[9] || 'N/A',
                experience: row[10] || 'N/A',
                jerseySize: row[11] || '',
                status: row[12] || 'Under Observation',
                registeredAt: row[13] || new Date().toISOString()
            });
        }

        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            players: players
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString(),
            players: []
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Update player status
function updatePlayerStatus(playerId, status) {
    try {
        const sheet = getSheet();
        const data = sheet.getDataRange().getValues();

        // Find the player row
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] == playerId) {
                // Update status (column M, index 12)
                sheet.getRange(i + 1, 13).setValue(status);

                // Get player details for email
                const name = data[i][1];
                const email = data[i][4];

                // Send Status Update Email
                const subject = 'Status Update - Shahjahanpur Spartans';
                const body = `
                    <h2>Status Update</h2>
                    <p>Dear ${name},</p>
                    <p>Your registration status has been updated.</p>
                    <p><strong>New Status:</strong> <span style="color: ${status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange'}">${status}</span></p>
                    <br>
                    <p>Best Regards,<br>Shahjahanpur Spartans Team</p>
                `;
                sendEmailNotification(email, subject, body);

                return ContentService.createTextOutput(JSON.stringify({
                    success: true,
                    message: 'Status updated'
                })).setMimeType(ContentService.MimeType.JSON);
            }
        }

        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: 'Player not found'
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Delete a player
function deletePlayer(playerId) {
    try {
        const sheet = getSheet();
        const data = sheet.getDataRange().getValues();

        // Find and delete the player row
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] == playerId) {
                sheet.deleteRow(i + 1);

                return ContentService.createTextOutput(JSON.stringify({
                    success: true,
                    message: 'Player deleted'
                })).setMimeType(ContentService.MimeType.JSON);
            }
        }

        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: 'Player not found'
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Broadcast Email to All Players
function broadcastEmail(subject, message, recipients) {
    try {
        const sheet = getSheet();
        const data = sheet.getDataRange().getValues();
        let count = 0;

        // If recipients provided, convert to Set for O(1) lookup
        const targetEmails = recipients ? new Set(recipients) : null;

        for (let i = 1; i < data.length; i++) {
            const email = data[i][4];
            const name = data[i][1];

            if (email && email.includes('@')) {
                // Skip if we have a target list and this email isn't in it
                if (targetEmails && !targetEmails.has(email)) {
                    continue;
                }

                const body = `
                    <h2>Announcement from Shahjahanpur Spartans</h2>
                    <p>Dear ${name},</p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                    <br>
                    <p>Best Regards,<br>Shahjahanpur Spartans Admin</p>
                `;
                try {
                    GmailApp.sendEmail(email, subject, "", {
                        htmlBody: body
                    });
                    count++;
                } catch (e) {
                    console.error('Failed to send to ' + email, e);
                }
            }
        }
        return ContentService.createTextOutput(JSON.stringify({
            success: true, message: `Broadcast sent to ${count} players`
        })).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false, error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}


// Update Jersey Number
function updateJerseyNumber(playerId, jerseyNumber) {
    try {
        const sheet = getSheet();
        const data = sheet.getDataRange().getValues();

        // First, check for duplicates
        for (let i = 1; i < data.length; i++) {
            // Column L (index 11) is Jersey Size
            // Check if jersey number matches AND it's NOT the current player (allow re-saving own number)
            if (String(data[i][11]) === String(jerseyNumber) && String(data[i][0]) !== String(playerId)) {
                return ContentService.createTextOutput(JSON.stringify({
                    success: false,
                    error: 'Duplicate',
                    ownerName: data[i][1] // Return the name of the player who has this number
                })).setMimeType(ContentService.MimeType.JSON);
            }
        }

        // If no duplicate, find player and update
        for (let i = 1; i < data.length; i++) {
            if (String(data[i][0]) === String(playerId)) {
                sheet.getRange(i + 1, 12).setValue(jerseyNumber);
                return ContentService.createTextOutput(JSON.stringify({
                    success: true,
                    message: 'Jersey number updated'
                })).setMimeType(ContentService.MimeType.JSON);
            }
        }

        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: 'Player not found'
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}
