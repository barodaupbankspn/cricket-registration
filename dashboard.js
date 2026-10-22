document.addEventListener('DOMContentLoaded', function () {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    const playersGrid = document.getElementById('playersGrid');
    const searchInput = document.getElementById('playerSearch');
    let allPlayers = [];

    searchInput.addEventListener('input', function (event) {
        filterAndRenderPlayers(event.target.value);
    });

    window.loadPublicPlayers = loadPublicPlayers;
    loadPublicPlayers();

    async function loadPublicPlayers() {
        showLoading();
        const localPlayers = readLocalPlayers();
        let players = localPlayers;
        let loadWarning = '';

        if (typeof getAllPlayersFromSheets === 'function') {
            const result = await getAllPlayersFromSheets();
            if (result.success) {
                players = mergePlayers(result.players, localPlayers);
                localStorage.setItem('cricketPlayers', JSON.stringify(players));
            } else {
                console.warn('Could not refresh registered players from Sheets:', result.error);
                loadWarning = 'Showing registrations saved on this device; Google Sheets could not be reached.';
            }
        } else {
            loadWarning = 'Showing registrations saved on this device; Google Sheets is not configured.';
        }

        allPlayers = players.map(player => ({
            id: player.id,
            name: player.name,
            role: player.role,
            battingStyle: player.battingStyle,
            bowlingStyle: player.bowlingStyle,
            jerseySize: player.jerseySize,
            status: player.status
        }));

        renderPlayers(allPlayers);
        showGrid();
        if (loadWarning) {
            errorMessage.textContent = loadWarning;
            errorState.classList.remove('hidden');
        }
    }

    function readLocalPlayers() {
        try {
            const players = JSON.parse(localStorage.getItem('cricketPlayers') || '[]');
            return Array.isArray(players) ? players : [];
        } catch (error) {
            console.error('Could not read locally saved registrations:', error);
            return [];
        }
    }

    function mergePlayers(sheetPlayers, localPlayers) {
        if (typeof mergePlayerLists === 'function') {
            return mergePlayerLists(sheetPlayers, localPlayers);
        }
        const playersById = new Map();
        sheetPlayers.forEach(player => playersById.set(String(player.id), player));
        localPlayers.forEach(player => {
            if (!playersById.has(String(player.id))) {
                playersById.set(String(player.id), player);
            }
        });
        return Array.from(playersById.values());
    }

    function renderPlayers(players) {
        playersGrid.innerHTML = '';
        if (players.length === 0) {
            playersGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <h3>No players found</h3>
                    <p>Try adjusting your search terms</p>
                </div>`;
            return;
        }

        players.forEach(player => {
            const card = document.createElement('div');
            card.className = 'player-card';
            const roleBadge = document.createElement('div');
            roleBadge.className = 'player-role-badge';
            roleBadge.textContent = player.role || 'Player';
            const name = document.createElement('div');
            name.className = 'player-name';
            name.textContent = player.name || 'Unknown';
            const statusClass = player.status === 'Approved'
                ? 'status-approved'
                : player.status === 'Rejected' ? 'status-rejected' : 'status-pending';
            const status = document.createElement('div');
            status.style.marginBottom = '15px';
            status.innerHTML = `<span class="status-indicator ${statusClass}"></span>`;
            const statusText = document.createElement('span');
            statusText.style.cssText = 'font-size: 0.85rem; color: var(--text-muted);';
            statusText.textContent = player.status || 'Pending';
            status.appendChild(statusText);
            card.append(roleBadge, name, status);
            addDetail(card, 'Batting', player.battingStyle);
            if (player.bowlingStyle && player.bowlingStyle !== 'N/A') {
                addDetail(card, 'Bowling', player.bowlingStyle);
            }
            addDetail(card, 'Jersey Size', player.jerseySize || '-');
            playersGrid.appendChild(card);
        });
    }

    function addDetail(card, label, value) {
        const detail = document.createElement('div');
        detail.className = 'player-detail';
        const detailLabel = document.createElement('span');
        detailLabel.className = 'detail-label';
        detailLabel.textContent = label;
        const detailValue = document.createElement('span');
        detailValue.className = 'detail-value';
        detailValue.textContent = value || 'N/A';
        detail.append(detailLabel, detailValue);
        card.appendChild(detail);
    }

    function filterAndRenderPlayers(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const filtered = allPlayers.filter(player =>
            !term ||
            (player.name && player.name.toLowerCase().includes(term)) ||
            (player.role && player.role.toLowerCase().includes(term))
        );
        renderPlayers(filtered);
    }

    function showLoading() {
        loadingState.classList.remove('hidden');
        errorState.classList.add('hidden');
        playersGrid.classList.add('hidden');
    }

    function showGrid() {
        loadingState.classList.add('hidden');
        playersGrid.classList.remove('hidden');
    }
});
