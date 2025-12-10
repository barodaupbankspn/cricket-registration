document.addEventListener('DOMContentLoaded', function () {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    const playersGrid = document.getElementById('playersGrid');
    const searchInput = document.getElementById('playerSearch');

    // Create Debug Log Container
    const debugLog = document.createElement('div');
    debugLog.style.cssText = 'background: #000; color: #0f0; padding: 10px; margin: 20px; border-radius: 5px; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto;';
    debugLog.innerHTML = '<strong>Debug Log:</strong><br>';
    document.querySelector('.container').appendChild(debugLog);

    function log(msg) {
        console.log(msg);
        const line = document.createElement('div');
        line.textContent = `> ${msg}`;
        debugLog.appendChild(line);
    }

    let allPlayers = [];

    // Initial Load
    log('Dashboard initialized');
    loadPublicPlayers();

    // Search Listener
    searchInput.addEventListener('input', function (e) {
        filterAndRenderPlayers(e.target.value);
    });

    async function loadPublicPlayers() {
        showLoading();
        log('Starting loadPublicPlayers...');

        try {
            if (typeof getAllPlayersFromSheets !== 'function') {
                throw new Error('API helper (getAllPlayersFromSheets) not found. Check sheets-api.js');
            }
            log('API helper found. Calling API...');

            const result = await getAllPlayersFromSheets();
            log(`API returned. Success: ${result.success}`);

            if (result.success) {
                log(`Player count: ${result.players.length}`);

                allPlayers = result.players.map(p => ({
                    name: p.name,
                    role: p.role,
                    battingStyle: p.battingStyle,
                    bowlingStyle: p.bowlingStyle,
                    jerseySize: p.jerseySize,
                    status: p.status,
                }));

                log('Players mapped. Rendering...');
                renderPlayers(allPlayers);
                showGrid();
                log('Grid shown.');
            } else {
                log(`API Error: ${result.error}`);
                showError(result.error || 'Failed to fetch players');
            }

        } catch (error) {
            log(`EXCEPTION: ${error.message}`);
            console.error('Dashboard error:', error);
            showError('Error: ' + error.message);
        }
    }

    function renderPlayers(players) {
        playersGrid.innerHTML = '';
        log(`Rendering ${players.length} cards...`);

        if (players.length === 0) {
            playersGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <h3>No players found</h3>
                    <p>Try adjusting your search terms</p>
                </div>
            `;
            return;
        }

        players.forEach(player => {
            const card = document.createElement('div');
            card.className = 'player-card';

            // Status Color
            let statusClass = 'status-pending';
            if (player.status === 'Approved') statusClass = 'status-approved';
            if (player.status === 'Rejected') statusClass = 'status-rejected';

            // Bowling Style Display
            const bowlingDisplay = player.bowlingStyle && player.bowlingStyle !== 'N/A'
                ? `<div class="player-detail">
                     <span class="detail-label">Bowling</span>
                     <span class="detail-value">${player.bowlingStyle}</span>
                   </div>`
                : '';

            card.innerHTML = `
                <div class="player-role-badge">${player.role || 'Player'}</div>
                <div class="player-name">${player.name || 'Unknown'}</div>
                
                <div style="margin-bottom: 15px;">
                    <span class="status-indicator ${statusClass}"></span>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">${player.status || 'Pending'}</span>
                </div>

                <div class="player-detail">
                    <span class="detail-label">Batting</span>
                    <span class="detail-value">${player.battingStyle || 'N/A'}</span>
                </div>

                ${bowlingDisplay}

                <div class="player-detail">
                    <span class="detail-label">Jersey Size</span>
                    <span class="detail-value">${player.jerseySize || '-'}</span>
                </div>
            `;

            playersGrid.appendChild(card);
        });
    }

    function filterAndRenderPlayers(searchTerm) {
        const term = searchTerm.toLowerCase().trim();

        if (!term) {
            renderPlayers(allPlayers);
            return;
        }

        const filtered = allPlayers.filter(player => {
            return (player.name && player.name.toLowerCase().includes(term)) ||
                (player.role && player.role.toLowerCase().includes(term));
        });

        renderPlayers(filtered);
    }

    function showLoading() {
        loadingState.classList.remove('hidden');
        errorState.classList.add('hidden');
        playersGrid.classList.add('hidden');
    }

    function showError(msg) {
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
        playersGrid.classList.add('hidden');
        errorMessage.textContent = msg;
    }

    function showGrid() {
        loadingState.classList.add('hidden');
        errorState.classList.add('hidden');
        playersGrid.classList.remove('hidden');
    }
});
