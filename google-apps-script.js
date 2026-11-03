// Google Apps Script for Cricket Registration
// Copy this entire code into your Google Apps Script editor

function authorizeEmail() {
    GmailApp.getAliases();
    console.log('Email sending permission granted.');
}

function doGet(e) {
    const action = e.parameter.action;

    if (action === 'getPlayers') {
        return getPlayers();
    }
    if (action === 'getMessagingCapabilities') {
        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            emailBroadcastVersion: 1,
            requiresAdminKey: true
        })).setMimeType(ContentService.MimeType.JSON);
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
            const expectedKey = PropertiesService.getScriptProperties().getProperty('EMAIL_ADMIN_KEY');
            if (!expectedKey || data.adminKey !== expectedKey) {
                return ContentService.createTextOutput(JSON.stringify({
                    success: false,
                    error: 'Email admin API key is missing or invalid'
                })).setMimeType(ContentService.MimeType.JSON);
            }
            return broadcastEmail(data.subject, data.message, data.recipients);
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

function normalizeRegistrationPhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
}

// Add a registration to the bound spreadsheet.
function addPlayer(player) {
    try {
        if (!player || !player.id || !player.name || !player.contact || !player.email) {
            return ContentService.createTextOutput(JSON.stringify({
                success: false,
                error: 'Missing required player details'
            })).setMimeType(ContentService.MimeType.JSON);
        }

        const sheet = getSheet();
        const data = sheet.getDataRange().getValues();
        const phone = normalizeRegistrationPhone(player.contact);
        for (let i = 1; i < data.length; i++) {
            if (normalizeRegistrationPhone(data[i][3]) === phone) {
                return ContentService.createTextOutput(JSON.stringify({
                    success: false,
                    error: 'Mobile number already registered'
                })).setMimeType(ContentService.MimeType.JSON);
            }
        }

        sheet.appendRow([
            player.id,
            player.name,
            player.age || '',
            player.contact,
            player.email,
            player.placeOfPosting || '',
            player.address || '',
            player.role || '',
            player.battingStyle || '',
            player.bowlingStyle || 'N/A',
            player.experience || '',
            player.jerseySize || '',
            player.status || 'Under Observation',
            player.registeredAt || new Date().toISOString()
        ]);

        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Player registered'
        })).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
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

function escapeEmailHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Send an individual email to each selected, registered player.
function broadcastEmail(subject, message, recipients) {
    try {
        const cleanSubject = String(subject || '').trim();
        const cleanMessage = String(message || '').trim();
        if (!cleanSubject || !cleanMessage) {
            throw new Error('Email subject and message are required');
        }
        if (/[\r\n]/.test(cleanSubject)) {
            throw new Error('Email subject cannot contain line breaks');
        }
        if (!Array.isArray(recipients) || recipients.length === 0) {
            throw new Error('Select at least one recipient');
        }

        const targetEmails = new Set(recipients
            .map(email => String(email || '').trim().toLowerCase())
            .filter(Boolean));
        if (targetEmails.size === 0 || targetEmails.size !== recipients.length) {
            throw new Error('Recipients must be valid, unique email addresses');
        }
        for (const email of targetEmails) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                throw new Error('One or more selected recipient email addresses are invalid');
            }
        }

        const properties = PropertiesService.getScriptProperties();
        const senderAddress = String(properties.getProperty('EMAIL_SENDER_ADDRESS') || '').trim().toLowerCase();
        if (!senderAddress) {
            throw new Error('Set EMAIL_SENDER_ADDRESS in Apps Script Script Properties');
        }
        const effectiveAddress = String(Session.getEffectiveUser().getEmail() || '').trim().toLowerCase();
        const aliases = GmailApp.getAliases().map(alias => String(alias).trim().toLowerCase());
        const isPrimarySender = senderAddress === effectiveAddress;
        const isConfiguredAlias = aliases.includes(senderAddress);
        if (!isPrimarySender && !isConfiguredAlias) {
            throw new Error('EMAIL_SENDER_ADDRESS must be the Apps Script account or one of its verified Gmail send-as aliases');
        }

        const sheet = getSheet();
        const data = sheet.getDataRange().getValues();
        const selectedPlayers = new Map();
        const errors = [];

        for (let i = 1; i < data.length; i++) {
            const email = String(data[i][4] || '').trim().toLowerCase();
            const name = data[i][1];
            if (targetEmails.has(email) && !selectedPlayers.has(email)) {
                selectedPlayers.set(email, String(name || 'Player'));
            }
        }

        for (const email of targetEmails) {
            if (!selectedPlayers.has(email)) {
                errors.push(`No registered player matched ${email}`);
            }
        }

        let sent = 0;
        for (const [email, name] of selectedPlayers) {
            const greetingName = escapeEmailHtml(name);
            const safeMessage = escapeEmailHtml(cleanMessage).replace(/\r\n|\r|\n/g, '<br>');
            const htmlBody = `
                <h2>Announcement from Shahjahanpur Spartans</h2>
                <p>Dear ${greetingName},</p>
                <p>${safeMessage}</p>
                <br>
                <p>Best Regards,<br>Shahjahanpur Spartans Admin</p>
            `;
            const plainBody = `Announcement from Shahjahanpur Spartans\n\nDear ${name},\n\n${cleanMessage}\n\nBest Regards,\nShahjahanpur Spartans Admin`;
            const options = {
                htmlBody: htmlBody,
                name: 'Shahjahanpur Spartans',
                replyTo: senderAddress
            };
            if (isConfiguredAlias && !isPrimarySender) {
                options.from = senderAddress;
            }

            try {
                GmailApp.sendEmail(email, cleanSubject, plainBody, options);
                sent++;
            } catch (error) {
                console.error('Failed to send selected player email:', email, error);
                errors.push(`Could not send to ${email}: ${error.message || error}`);
            }
        }

        const failed = errors.length;
        const success = sent === targetEmails.size && failed === 0;
        return ContentService.createTextOutput(JSON.stringify({
            success: success,
            requested: targetEmails.size,
            sent: sent,
            failed: failed,
            message: `Email sent to ${sent} of ${targetEmails.size} selected player(s); ${failed} failed.`,
            errors: failed > 0 ? errors : null,
            from: senderAddress
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
