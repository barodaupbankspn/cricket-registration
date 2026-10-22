// Google Sheets API Integration
// This file handles all communication with Google Sheets

// IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyzW_uyileZE9-a1zX7hJXr7odDEWJYo0vyegaCo7cFzbDhZM5FU7l9ngVqS7jiMUhx/exec';

// Check if Google Sheets is configured
function isSheetsConfigured() {
    return GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE';
}
window.isSheetsConfigured = isSheetsConfigured;

function mergePlayerLists(primaryPlayers, fallbackPlayers) {
    const players = [];
    const ids = new Set();
    const phones = new Set();
    [...primaryPlayers, ...fallbackPlayers].forEach(player => {
        const id = player.id == null ? '' : String(player.id);
        const phone = String(player.contact || '').replace(/\D/g, '');
        if ((id && ids.has(id)) || (phone && phones.has(phone))) {
            return;
        }
        players.push(player);
        if (id) ids.add(id);
        if (phone) phones.add(phone);
    });
    return players;
}
window.mergePlayerLists = mergePlayerLists;

async function postToSheets(payload) {
    const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(`Google Sheets request failed (${response.status})`);
    }
    const data = await response.json();
    if (!data.success) {
        throw new Error(data.error || 'Google Sheets rejected the request');
    }
    return data;
}

// Save player to Google Sheets
async function savePlayerToSheets(player) {
    if (!isSheetsConfigured()) {
        console.warn('Google Sheets not configured, saving to localStorage only');
        return { success: false, error: 'Not configured' };
    }

    try {
        return await postToSheets({ action: 'addPlayer', player: player });
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
        return await postToSheets({
            action: 'updateStatus',
            playerId: playerId,
            status: status
        });
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
        return await postToSheets({ action: 'deletePlayer', playerId: playerId });
    } catch (error) {
        console.error('Error deleting from Google Sheets:', error);
        return { success: false, error: error.message };
    }
}

// Sync localStorage with Google Sheets (for admin dashboard)
async function syncWithGoogleSheets() {
    const result = await getAllPlayersFromSheets();

    if (result.success) {
        const localPlayers = JSON.parse(localStorage.getItem('cricketPlayers') || '[]');
        const remoteIds = new Set(result.players.map(player => String(player.id)));
        const remotePhones = new Set(result.players
            .map(player => String(player.contact || '').replace(/\D/g, ''))
            .filter(Boolean));
        const pendingPlayers = localPlayers.filter(player =>
            !remoteIds.has(String(player.id)) &&
            (!player.contact || !remotePhones.has(String(player.contact).replace(/\D/g, '')))
        );

        for (const player of pendingPlayers) {
            await savePlayerToSheets(player);
        }

        const refreshed = pendingPlayers.length ? await getAllPlayersFromSheets() : result;
        const sheetPlayers = refreshed.success ? refreshed.players : result.players;
        const mergedPlayers = mergePlayerLists(sheetPlayers, localPlayers);
        const confirmedIds = new Set(sheetPlayers.map(player => String(player.id)));
        const confirmedPhones = new Set(sheetPlayers
            .map(player => String(player.contact || '').replace(/\D/g, ''))
            .filter(Boolean));
        const localOnlyCount = localPlayers.filter(player =>
            !confirmedIds.has(String(player.id)) &&
            (!player.contact || !confirmedPhones.has(String(player.contact).replace(/\D/g, '')))
        ).length;

        localStorage.setItem('cricketPlayers', JSON.stringify(mergedPlayers));
        localStorage.setItem('lastSyncTime', new Date().toISOString());
        localStorage.setItem('pendingSheetSyncCount', String(localOnlyCount));
        return {
            success: true,
            count: sheetPlayers.length,
            localOnlyCount: localOnlyCount,
            totalCount: mergedPlayers.length
        };
    }

    return { success: false, error: result.error || 'Unknown error during sync' };
}

// Get last sync time
function getLastSyncTime() {
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
        const date = new Date(lastSync);
        const pendingCount = Number(localStorage.getItem('pendingSheetSyncCount') || 0);
        return date.toLocaleString('en-IN') +
            (pendingCount ? ` (${pendingCount} local-only registration(s) still need Sheets sync)` : '');
    }
    return 'Never';
}

// Send Broadcast Email
async function sendBroadcastToSheets(subject, message, recipients) {
    if (!isSheetsConfigured()) {
        return { success: false, error: 'Not configured' };
    }

    try {
        return await postToSheets({
            action: 'broadcast',
            subject: subject,
            message: message,
            recipients: recipients
        });
    } catch (error) {
        console.error('Error sending broadcast:', error);
        return { success: false, error: error.message };
    }
}

// Send WhatsApp Broadcast
async function sendBroadcastWhatsAppToSheets(message, recipients) {
    if (!isSheetsConfigured()) {
        return { success: false, error: 'Not configured' };
    }

    try {
        return await postToSheets({
            action: 'broadcastWhatsApp',
            message: message,
            recipients: recipients
        });
    } catch (error) {
        console.error('Error sending WhatsApp broadcast:', error);
        return { success: false, error: error.message };
    }
}

// Update jersey number in Google Sheets
async function updateJerseyNumberInSheets(playerId, jerseyNumber) {
    if (!isSheetsConfigured()) {
        return { success: false, error: 'Not configured' };
    }

    try {
        return await postToSheets({
            action: 'updateJerseyNumber',
            playerId: playerId,
            jerseyNumber: jerseyNumber
        });
    } catch (error) {
        console.error('Error updating jersey number in Google Sheets:', error);
        return { success: false, error: error.message };
    }
}
