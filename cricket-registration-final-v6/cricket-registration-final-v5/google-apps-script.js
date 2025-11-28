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

// Add a new player
function addPlayer(player) {
    try {
        const sheet = getSheet();

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

        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Player added successfully'
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Get all players
function getPlayers() {
    try {
        const sheet = getSheet();
        const data = sheet.getDataRange().getValues();

        // Skip header row
        const players = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            players.push({
                id: row[0],
                name: row[1],
                age: row[2],
                contact: row[3],
                email: row[4],
                placeOfPosting: row[5],
                address: row[6],
                role: row[7],
                battingStyle: row[8],
                bowlingStyle: row[9],
                experience: row[10],
                jerseySize: row[11],
                status: row[12] || 'Under Observation',
                registeredAt: row[13]
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
