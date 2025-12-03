document.addEventListener('DOMContentLoaded', function () {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    const playersGrid = document.getElementById('playersGrid');
    const searchInput = document.getElementById('playerSearch');

    let allPlayers = [];

    // Initial Load
    loadPublicPlayers();

    // Search Listener
    searchInput.addEventListener('input', function (e) {
        filterAndRenderPlayers(e.target.value);
    });

    async function loadPublicPlayers() {
        showLoading();

        try {
            // Use the existing API helper
            // Note: We might need to ensure getAllPlayersFromSheets is available
            if (typeof getAllPlayersFromSheets !== 'function') {
                throw new Error('API helper not loaded');
            }

            const result = await getAllPlayersFromSheets();

            if (result.success) {
                // Filter sensitive data and only show approved/relevant players if needed
                // For now, we show all, but we hide sensitive fields in the UI
                allPlayers = result.players.map(p => ({
                    name: p.name,
                    role: p.role,
                    battingStyle: p.battingStyle,
                    bowlingStyle: p.bowlingStyle,
                    jerseySize: p.jerseySize,
                    status: p.status,
                    // Exclude: contact, email, address, placeOfPosting
                }));

                renderPlayers(allPlayers);
                showGrid();
            } else {
                showError(result.error || 'Failed to fetch players');
            }

        } catch (error) {
            console.error('Dashboard error:', error);
            showError('Error: ' + error.message);
        }
    }

    function renderPlayers(players) {
        playersGrid.innerHTML = '';

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
