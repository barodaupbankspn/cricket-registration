// Google Sheets API Integration
// This file handles all communication with Google Sheets

// IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyzW_uyileZE9-a1zX7hJXr7odDEWJYo0vyegaCo7cFzbDhZM5FU7l9ngVqS7jiMUhx/exec';

// Check if Google Sheets is configured
function isSheetsConfigured() {
    return GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE';
}
window.isSheetsConfigured = isSheetsConfigured;

function normalizeCricketPhone(value) {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
}
window.normalizeCricketPhone = normalizeCricketPhone;

function isCurrentCricketSeasonPlayer(player, seasonYear = new Date().getUTCFullYear()) {
    const registeredAt = player && (player.registeredAt || player.timestamp);
    if (!registeredAt) return true;
    const date = registeredAt instanceof Date ? registeredAt : new Date(registeredAt);
    return Number.isNaN(date.getTime()) || date.getUTCFullYear() >= seasonYear;
}
window.isCurrentCricketSeasonPlayer = isCurrentCricketSeasonPlayer;

function mergePlayerLists(primaryPlayers, fallbackPlayers) {
    const players = [];
    const ids = new Set();
    const phones = new Set();
    [...primaryPlayers, ...fallbackPlayers].forEach(player => {
        const id = player.id == null ? '' : String(player.id);
        const phone = normalizeCricketPhone(player.contact);
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

async function findRegisteredPlayerByContact(contact) {
    const phone = normalizeCricketPhone(contact);
    if (phone.length !== 10) {
        return { success: false, error: 'Enter a valid 10-digit mobile number', player: null };
    }

    let localPlayers = [];
    try {
        const storedPlayers = JSON.parse(localStorage.getItem('cricketPlayers') || '[]');
        localPlayers = Array.isArray(storedPlayers) ? storedPlayers : [];
    } catch (error) {
        console.error('Could not read locally saved registrations:', error);
    }

    const localMatch = localPlayers.find(player => normalizeCricketPhone(player.contact) === phone);
    if (isSheetsConfigured()) {
        const result = await getAllPlayersFromSheets();
        if (result.success) {
            const sheetPlayers = Array.isArray(result.players) ? result.players : [];
            const sheetMatch = sheetPlayers.find(player => normalizeCricketPhone(player.contact) === phone);
            return {
                success: true,
                player: sheetMatch,
                source: sheetMatch ? 'shared' : null,
                remoteAvailable: true
            };
        }

        if (localMatch) {
            return { success: true, player: localMatch, source: 'device', remoteAvailable: false, warning: result.error };
        }
        return { success: false, error: result.error || 'Could not check the shared registration list', player: null };
    }

    return localMatch
        ? { success: true, player: localMatch, source: 'device', remoteAvailable: false }
        : { success: false, error: 'The shared registration list is not configured', player: null };
}
window.findRegisteredPlayerByContact = findRegisteredPlayerByContact;

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
        const error = new Error(data.error || data.message || 'Google Sheets rejected the request');
        error.responseData = data;
        throw error;
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
        const response = await fetch(GOOGLE_SHEETS_URL + '?action=getPlayers&_=' + Date.now(), {
            method: 'GET',
            cache: 'no-store',
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
            .map(player => normalizeCricketPhone(player.contact))
            .filter(Boolean));
        const pendingPlayers = localPlayers.filter(player =>
            !remoteIds.has(String(player.id)) &&
            (!player.contact || !remotePhones.has(normalizeCricketPhone(player.contact)))
        );

        for (const player of pendingPlayers) {
            await savePlayerToSheets(player);
        }

        const refreshed = pendingPlayers.length ? await getAllPlayersFromSheets() : result;
        const sheetPlayers = refreshed.success ? refreshed.players : result.players;
        const mergedPlayers = mergePlayerLists(sheetPlayers, localPlayers);
        const confirmedIds = new Set(sheetPlayers.map(player => String(player.id)));
        const confirmedPhones = new Set(sheetPlayers
            .map(player => normalizeCricketPhone(player.contact))
            .filter(Boolean));
        const localOnlyCount = localPlayers.filter(player =>
            !confirmedIds.has(String(player.id)) &&
            (!player.contact || !confirmedPhones.has(normalizeCricketPhone(player.contact)))
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
async function checkEmailBroadcastAvailability() {
    if (!isSheetsConfigured()) {
        return { success: false, error: 'Email is not configured: the Google Apps Script endpoint is missing.' };
    }

    try {
        const capabilityResponse = await fetch(
            GOOGLE_SHEETS_URL + '?action=getMessagingCapabilities&_=' + Date.now(),
            { method: 'GET', cache: 'no-store' }
        );
        if (!capabilityResponse.ok) {
            throw new Error(`Apps Script capability check failed (${capabilityResponse.status})`);
        }
        const capabilities = await capabilityResponse.json();
        if (capabilities.success !== true ||
            capabilities.emailBroadcastVersion !== 1 ||
            capabilities.requiresAdminKey !== true) {
            return {
                success: false,
                error: `Email is not ready on the server (Apps Script response: ${capabilities.error || 'email capability unavailable'}). No email was sent and you do not need to enter an admin key yet. Deploy the current google-apps-script.js, set EMAIL_SENDER_ADDRESS and EMAIL_ADMIN_KEY in Script Properties, authorize Gmail, and deploy a new web-app version.`
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Error checking email broadcast availability:', error);
        return {
            success: false,
            error: `Could not verify email setup with Apps Script: ${error.message}. No email was sent and you do not need to enter an admin key yet.`
        };
    }
}

async function sendBroadcastToSheets(subject, message, recipients, adminKey) {
    const availability = await checkEmailBroadcastAvailability();
    if (!availability.success) return availability;

    try {
        return await postToSheets({
            action: 'broadcast',
            subject: subject,
            message: message,
            recipients: recipients,
            adminKey: adminKey
        });
    } catch (error) {
        console.error('Error sending broadcast:', error);
        return Object.assign({ success: false, error: error.message }, error.responseData || {});
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
