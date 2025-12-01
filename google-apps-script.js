// Google Apps Script for Cricket Registration
// Copy this entire code into your Google Apps Script editor

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

// Add a new player
function addPlayer(player) {
    try {
        const sheet = getSheet();

        // Check for duplicate mobile number (Column D, index 3)
        const data = sheet.getDataRange().getValues();
        // Skip header row
        for (let i = 1; i < data.length; i++) {
            if (String(data[i][3]) === String(player.contact)) {
                return ContentService.createTextOutput(JSON.stringify({
                    success: false,
                    error: 'Mobile number already registered'
                })).setMimeType(ContentService.MimeType.JSON);
            }
        }

        // Append new row with player data
        sheet.appendRow([
            player.id,
            player.name,
            player.age,
            player.contact,
            player.email,
            player.placeOfPosting || '',
            player.address || '',
            player.role,
            player.battingStyle,
            player.bowlingStyle || 'N/A',
            player.experience,
            player.jerseySize || '',
            player.status || 'Under Observation',
            player.registeredAt
        ]);

        // Send Confirmation Email
        const subject = 'Registration Successful - Shahjahanpur Spartans';
        const body = `
            <h2>Welcome to Shahjahanpur Spartans!</h2>
            <p>Dear ${player.name},</p>
            <p>Your registration has been successfully received.</p>
            <p><strong>Status:</strong> Under Observation</p>
            <p>We will review your details and update you shortly.</p>
            <br>
            <p>Best Regards,<br>Shahjahanpur Spartans Team</p>
        `;

        const emailResult = sendEmailNotification(player.email, subject, body);

        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Player added successfully',
            emailStatus: emailResult
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
