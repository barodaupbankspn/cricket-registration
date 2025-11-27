// Google Sheets API Integration
// This file handles all communication with Google Sheets

// IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyrEd-OCDK-Z7YREfQ694ET_HojP5FcU4RBXcR90s7iAfX1liUuw7HTYn7q2QQXx_QG/exec';

// Check if Google Sheets is configured
function isSheetsConfigured() {
    return GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE';
}
window.isSheetsConfigured = isSheetsConfigured;

// Save player to Google Sheets
async function savePlayerToSheets(player) {
    if (!isSheetsConfigured()) {
        console.warn('Google Sheets not configured, saving to localStorage only');
        return { success: false, error: 'Not configured' };
    }

    try {
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addPlayer',
                player: player
            })
        });

        // Note: no-cors mode doesn't allow reading response
        // We assume success if no error is thrown
        return { success: true };
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        return { success: false, error: error.message };
    }
}

// Get all players from Google Sheets
async function getAllPlayersFromSheets() {
    if (!isSheetsConfigured()) {
        console.warn('Google Sheets not configured');
        return { success: false, error: 'Not configured', players: [] };
    }

    try {
        const response = await fetch(GOOGLE_SHEETS_URL + '?action=getPlayers', {
            method: 'GET',
        });

        const data = await response.json();

        if (data.success) {
            return { success: true, players: data.players };
        } else {
            return { success: false, error: data.error, players: [] };
        }
    } catch (error) {
        console.error('Error fetching from Google Sheets:', error);
        return { success: false, error: error.message, players: [] };
    }
}

// Update player status in Google Sheets
async function updatePlayerStatusInSheets(playerId, status) {
    if (!isSheetsConfigured()) {
        return { success: false, error: 'Not configured' };
    }

    try {
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'updateStatus',
                playerId: playerId,
                status: status
            })
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating status in Google Sheets:', error);
        return { success: false, error: error.message };
    }
}

// Delete player from Google Sheets
async function deletePlayerFromSheets(playerId) {
    if (!isSheetsConfigured()) {
        return { success: false, error: 'Not configured' };
    }

    try {
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'deletePlayer',
                playerId: playerId
            })
        });

        return { success: true };
    } catch (error) {
        console.error('Error deleting from Google Sheets:', error);
        return { success: false, error: error.message };
    }
}

// Sync localStorage with Google Sheets (for admin dashboard)
async function syncWithGoogleSheets() {
    const result = await getAllPlayersFromSheets();

    if (result.success && result.players.length > 0) {
        // Update localStorage with Google Sheets data
        localStorage.setItem('cricketPlayers', JSON.stringify(result.players));
        localStorage.setItem('lastSyncTime', new Date().toISOString());
        return { success: true, count: result.players.length };
    }

    return { success: false, error: result.error };
}

// Get last sync time
function getLastSyncTime() {
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
        const date = new Date(lastSync);
        return date.toLocaleString('en-IN');
    }
    return 'Never';
}
