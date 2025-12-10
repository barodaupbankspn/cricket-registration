// Admin Dashboard Logic
document.addEventListener('DOMContentLoaded', function () {
    // Admin Credentials (Hardcoded for demo)
    const ADMIN_ID = '109058';
    const ADMIN_PASSWORD = 'admin12345';

    // DOM Elements
    const loginScreen = document.getElementById('loginScreen');
    const dashboardScreen = document.getElementById('dashboardScreen');
    const loginForm = document.getElementById('loginForm');
    const adminIdInput = document.getElementById('adminId');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    const playersTableContainer = document.getElementById('playersTableContainer');
    const playersTableBody = document.getElementById('playersTableBody');
    const noPlayers = document.getElementById('noPlayers');

    const searchInput = document.getElementById('searchInput');
    const roleFilter = document.getElementById('roleFilter');
    const experienceFilter = document.getElementById('experienceFilter');

    const exportCSVBtn = document.getElementById('exportCSV');
    const syncSheetsBtn = document.getElementById('syncSheets');

    // Stats Elements
    const totalPlayersEl = document.getElementById('totalPlayers');
    const totalBatsmenEl = document.getElementById('totalBatsmen');
    const totalBowlersEl = document.getElementById('totalBowlers');
    const totalAllRoundersEl = document.getElementById('totalAllRounders');

    // Check if already logged in
    try {
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            showDashboard();
        }
    } catch (e) {
        console.warn('LocalStorage not available:', e);
    }

    // Login form submission
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const adminId = adminIdInput.value.trim();
        const password = passwordInput.value;

        if (adminId === ADMIN_ID && password === ADMIN_PASSWORD) {
            try {
                localStorage.setItem('adminLoggedIn', 'true');
            } catch (e) {
                console.warn('Could not save login state:', e);
            }
            loginError.classList.add('hidden');
            showDashboard();
        } else {
            loginError.classList.remove('hidden');
            loginError.textContent = 'Incorrect ID or password';
            adminIdInput.value = '';
            passwordInput.value = '';
            adminIdInput.focus();
        }
    });

    // Logout
    logoutBtn.addEventListener('click', function () {
        try {
            localStorage.removeItem('adminLoggedIn');
        } catch (e) {
            console.warn('LocalStorage error:', e);
        }
        dashboardScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        adminIdInput.value = '';
        passwordInput.value = '';
    });

    // Show dashboard
    function showDashboard() {
        loginScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');

        // Check configuration
        if (typeof isSheetsConfigured === 'function' && !isSheetsConfigured()) {
            alert('⚠️ CRITICAL: Google Sheets NOT Configured!\n\nYou will NOT see registrations from other devices until you set up the Google Sheets URL.\n\nPlease open "setup-guide.html" and follow the instructions.');

            // Add visual warning
            const warningDiv = document.createElement('div');
            warningDiv.style.background = '#ff1744';
            warningDiv.style.color = 'white';
            warningDiv.style.padding = '1rem';
            warningDiv.style.textAlign = 'center';
            warningDiv.style.marginBottom = '1rem';
            warningDiv.style.borderRadius = '8px';
            warningDiv.style.fontWeight = 'bold';
            warningDiv.innerHTML = '⚠️ CROSS-DEVICE SYNC DISABLED: Google Sheets URL not set. <a href="setup-guide.html" target="_blank" style="color: white; text-decoration: underline;">Click here to setup</a>';

            const container = document.querySelector('.dashboard-container');
            container.insertBefore(warningDiv, container.firstChild);
        }

        // Auto-sync on load to ensure cross-device visibility
        loadPlayers(true);
    }

    // Load and display players
    async function loadPlayers(forceSync = false) {
        // Try to sync with Google Sheets if configured
        if (forceSync && typeof syncWithGoogleSheets === 'function') {
            const syncBtn = document.getElementById('syncSheets');
            if (syncBtn) {
                syncBtn.disabled = true;
                syncBtn.textContent = '⏳ Syncing...';
            }

            const syncResult = await syncWithGoogleSheets();

            if (syncBtn) {
                syncBtn.disabled = false;
                if (syncResult.success) {
                    syncBtn.textContent = '✅ Synced!';
                    setTimeout(() => {
                        syncBtn.textContent = '🔄 Sync from Google Sheets';
                    }, 2000);
                } else {
                    syncBtn.textContent = '❌ Sync Failed';
                    console.error('Sync failed:', syncResult.error);
                    alert('Sync Failed: ' + (syncResult.error || 'Unknown error'));
                    setTimeout(() => {
                        syncBtn.textContent = '🔄 Sync from Google Sheets';
                    }, 2000);
                }
            }
        }

        const players = getPlayers();
        updateStats(players);
        displayPlayers(players);
        updateLastSyncDisplay();
    }

    // Update last sync time display
    function updateLastSyncDisplay() {
        const syncTimeEl = document.getElementById('lastSyncTime');
        if (syncTimeEl && typeof getLastSyncTime === 'function') {
            syncTimeEl.textContent = 'Last sync: ' + getLastSyncTime();
        }
    }

    // Get players from localStorage
    function getPlayers() {
        const playersData = localStorage.getItem('cricketPlayers');
        return playersData ? JSON.parse(playersData) : [];
    }

    // Update statistics
    function updateStats(players) {
        totalPlayersEl.textContent = players.length;

        const batsmen = players.filter(p => p.role === 'Batsman').length;
        const bowlers = players.filter(p => p.role === 'Bowler').length;
        const allRounders = players.filter(p => p.role === 'All-Rounder').length;

        totalBatsmenEl.textContent = batsmen;
        totalBowlersEl.textContent = bowlers;
        totalAllRoundersEl.textContent = allRounders;
    }

    // Display players in table
    function displayPlayers(players) {
        if (players.length === 0) {
            noPlayers.classList.remove('hidden');
            playersTableContainer.classList.add('hidden');
            return;
        }

        noPlayers.classList.add('hidden');
        playersTableContainer.classList.remove('hidden');

        playersTableBody.innerHTML = '';

        players.forEach((player, index) => {
            // Debug logging to help identify data issues
            console.log('Rendering player:', player);

            const row = document.createElement('tr');

            const registeredDate = new Date(player.registeredAt);
            const formattedDate = registeredDate.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });

            // Status Color Logic
            let statusColor = '#ffaa00'; // Default Pending/Under Observation
            if (player.status === 'Approved') statusColor = '#00cc70';
            if (player.status === 'Rejected') statusColor = '#cc0044';

            // Fallback for missing name
            const playerName = player.name || 'Unknown Name';

            row.innerHTML = `
                <td><input type="checkbox" class="player-checkbox" value="${player.id}"></td>
                <td>${index + 1}</td>
                <td style="font-weight: 600; color: var(--text-primary);">${playerName}</td>
                <td>${player.age || 'N/A'}</td>
                <td>${player.contact || 'N/A'}</td>
                <td>${player.email || 'N/A'}</td>
                <td><span style="background: rgba(0, 212, 255, 0.2); padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">${player.role || 'N/A'}</span></td>
                <td>${player.battingStyle || 'N/A'}</td>
                <td>${player.bowlingStyle || 'N/A'}</td>
                <td>${player.experience || 'N/A'}</td>
                <td>${player.jerseySize || '-'}</td>
                <td>
                    <select onchange="updatePlayerStatus(${player.id}, this.value, this)" 
                            style="padding: 4px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); 
                                   background: rgba(0,0,0,0.2); color: ${statusColor}; font-weight: bold;">
                        <option value="Under Observation" ${player.status === 'Under Observation' ? 'selected' : ''}>Under Observation</option>
                        <option value="Approved" ${player.status === 'Approved' ? 'selected' : ''}>Approved</option>
                        <option value="Rejected" ${player.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </td>
                <td>${formattedDate}</td>
                <td>
                    <button class="view-btn" onclick="viewPlayer(${index})" style="background: linear-gradient(135deg, var(--primary), #00d4ff); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; margin-right: 5px; transition: all 0.3s ease;">
                        👁️ View
                    </button>
                    <button class="delete-btn" onclick="deletePlayer(${player.id}, this)" style="background: linear-gradient(135deg, var(--danger), #cc0044); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.3s ease;">
                        🗑️ Delete
                    </button>
                </td>
            `;

            playersTableBody.appendChild(row);
        });
    }

    // Bulk Actions
    window.toggleSelectAll = function (source) {
        const checkboxes = document.querySelectorAll('.player-checkbox');
        checkboxes.forEach(cb => cb.checked = source.checked);
    };

    window.bulkAction = async function (action) {
        const selectedCheckboxes = document.querySelectorAll('.player-checkbox:checked');
        const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));

        if (selectedIds.length === 0) {
            alert('Please select at least one player.');
            return;
        }

        if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} players?`)) {
            return;
        }

        // Show loading
        const btn = document.activeElement;
        const originalText = btn.innerText;
        btn.innerText = 'Processing...';
        btn.disabled = true;

        try {
            if (action === 'delete') {
                for (const id of selectedIds) {
                    await deletePlayerFromSheets(id); // Helper handles config check
                }

                // Update LocalStorage
                let players = JSON.parse(localStorage.getItem('cricketPlayers') || '[]');
                players = players.filter(p => !selectedIds.includes(p.id));
                localStorage.setItem('cricketPlayers', JSON.stringify(players));

            } else {
                // Approve/Reject
                for (const id of selectedIds) {
                    await updatePlayerStatusInSheets(id, action); // Helper handles config check
                }

                // Update LocalStorage
                let players = JSON.parse(localStorage.getItem('cricketPlayers') || '[]');
                players.forEach(p => {
                    if (selectedIds.includes(p.id)) {
                        p.status = action;
                    }
                });
                localStorage.setItem('cricketPlayers', JSON.stringify(players));
            }

            // Refresh UI
            loadPlayers();
            document.getElementById('selectAll').checked = false;
            alert('Bulk action completed successfully!');

        } catch (error) {
            console.error('Bulk action error:', error);
            alert('An error occurred during bulk action.');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    };

    // Make functions available globally
    window.viewPlayer = function (index) {
        const players = getPlayers();
        const player = players[index];

        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        // Status color
        let statusColor = '#ffaa00';
        if (player.status === 'Approved') statusColor = '#00ff88';
        if (player.status === 'Rejected') statusColor = '#ff3366';

        // Create modal content
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, rgba(10, 14, 39, 0.95), rgba(5, 8, 20, 0.95));
                border: 2px solid rgba(0, 212, 255, 0.3);
                border-radius: 20px;
                padding: 2rem;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                animation: slideUp 0.3s ease;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="
                        font-family: 'Poppins', sans-serif;
                        font-size: 1.8rem;
                        background: linear-gradient(135deg, #00d4ff, #ffd700);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin: 0;
                    ">🏏 Player Details</h2>
                    <button onclick="this.closest('div').parentElement.remove()" style="
                        background: rgba(255, 51, 102, 0.2);
                        border: 1px solid #ff3366;
                        color: #ff3366;
                        width: 35px;
                        height: 35px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 1.2rem;
                        font-weight: bold;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#ff3366'; this.style.color='white';" 
                       onmouseout="this.style.background='rgba(255, 51, 102, 0.2)'; this.style.color='#ff3366';">✕</button>
                </div>
                
                <div style="
                    background: rgba(0, 212, 255, 0.05);
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                ">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <div style="color: #6b7a8f; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.3rem;">Full Name</div>
                            <div style="color: #ffffff; font-size: 1.1rem; font-weight: 600;">${player.name}</div>
                        </div>
                        <div>
                            <div style="color: #6b7a8f; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.3rem;">Age</div>
                            <div style="color: #ffffff; font-size: 1.1rem; font-weight: 600;">${player.age} years</div>
                        </div>
                    </div>
                </div>
                
                <div style="
                    background: rgba(255, 215, 0, 0.05);
                    border: 1px solid rgba(255, 215, 0, 0.2);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                ">
                    <h3 style="color: #ffd700; font-size: 1rem; margin: 0 0 1rem 0; text-transform: uppercase; letter-spacing: 1px;">Contact Information</h3>
                    <div style="display: grid; gap: 0.8rem;">
                        <div>
                            <div style="color: #6b7a8f; font-size: 0.85rem; margin-bottom: 0.3rem;">📱 Mobile</div>
                            <div style="color: #ffffff; font-size: 1rem;">${player.contact}</div>
                        </div>
                        <div>
                            <div style="color: #6b7a8f; font-size: 0.85rem; margin-bottom: 0.3rem;">📧 Email</div>
                            <div style="color: #ffffff; font-size: 1rem; word-break: break-all;">${player.email}</div>
                        </div>
                        <div>
                            <div style="color: #6b7a8f; font-size: 0.85rem; margin-bottom: 0.3rem;">🏢 Place of Posting</div>
                            <div style="color: #ffffff; font-size: 1rem;">${player.placeOfPosting || 'N/A'}</div>
                        </div>
                        <div>
                            <div style="color: #6b7a8f; font-size: 0.85rem; margin-bottom: 0.3rem;">🏠 Address</div>
                            <div style="color: #ffffff; font-size: 1rem;">${player.address || 'N/A'}</div>
                        </div>
                    </div>
                </div>
                
                <div style="
                    background: rgba(0, 255, 136, 0.05);
                    border: 1px solid rgba(0, 255, 136, 0.2);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                ">
                    <h3 style="color: #00ff88; font-size: 1rem; margin: 0 0 1rem 0; text-transform: uppercase; letter-spacing: 1px;">Cricket Profile</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <div style="color: #6b7a8f; font-size: 0.85rem; margin-bottom: 0.3rem;">Role</div>
                            <div style="
                                color: #00ff88;
                                font-size: 1rem;
                                font-weight: 600;
                                background: rgba(0, 255, 136, 0.1);
                                padding: 0.3rem 0.8rem;
                                border-radius: 6px;
                                display: inline-block;
                            ">${player.role}</div>
                        </div>
                        <div>
                            <div style="color: #6b7a8f; font-size: 0.85rem; margin-bottom: 0.3rem;">Experience</div>
                            <div style="color: #ffffff; font-size: 1rem; font-weight: 600;">${player.experience}</div>
                        </div>
                        <div>
                            <div style="color: #6b7a8f; font-size: 0.85rem; margin-bottom: 0.3rem;">Batting Style</div>
                            <div style="color: #ffffff; font-size: 1rem;">${player.battingStyle}</div>
                        </div>
                        <div>
                            <div style="color: #6b7a8f; font-size: 0.85rem; margin-bottom: 0.3rem;">Bowling Style</div>
                            <div style="color: #ffffff; font-size: 1rem;">${player.bowlingStyle || 'N/A'}</div>
                        </div>
                        <div>
                            <div style="color: #6b7a8f; font-size: 0.85rem; margin-bottom: 0.3rem;">Jersey Size</div>
                            <div style="color: #ffffff; font-size: 1rem;">${player.jerseySize || 'Not specified'}</div>
                        </div>
                    </div>
                </div>
                
                <div style="
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1.5rem;
                ">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <div style="color: #6b7a8f; font-size: 0.85rem; margin-bottom: 0.3rem;">Status</div>
                            <div style="
                                color: ${statusColor};
                                font-size: 1.1rem;
                                font-weight: 700;
                                background: rgba(${statusColor === '#00ff88' ? '0, 255, 136' : statusColor === '#ff3366' ? '255, 51, 102' : '255, 170, 0'}, 0.15);
                                padding: 0.5rem 1rem;
                                border-radius: 8px;
                                display: inline-block;
                                border: 2px solid ${statusColor};
                            ">${player.status}</div>
                        </div>
                        <div>
                            <div style="color: #6b7a8f; font-size: 0.85rem; margin-bottom: 0.3rem;">Registered On</div>
                            <div style="color: #ffffff; font-size: 1rem;">${new Date(player.registeredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                    </div>
                </div>
                
                <button onclick="this.closest('div').parentElement.remove()" style="
                    width: 100%;
                    margin-top: 1.5rem;
                    padding: 0.8rem;
                    background: linear-gradient(135deg, #00d4ff, #0099cc);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0, 212, 255, 0.4)';" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">Close</button>
            </div>
        `;

        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(30px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);

        // Close on background click
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    };

    window.deletePlayer = async function (id, btnElement) {
        if (confirm('Are you sure you want to delete this player?')) {
            // Show loading state
            if (btnElement) {
                const originalText = btnElement.innerHTML;
                btnElement.innerHTML = '⏳...';
                btnElement.disabled = true;
            }

            try {
                // Delete from Google Sheets if configured
                if (typeof deletePlayerFromSheets === 'function') {
                    const result = await deletePlayerFromSheets(id);
                    if (!result.success) {
                        console.error('Sheet delete failed:', result.error);
                        alert('Warning: Could not delete from Google Sheet. Deleting locally only.');
                    }
                }

                // Delete from localStorage
                let players = JSON.parse(localStorage.getItem('cricketPlayers') || '[]');
                players = players.filter(p => p.id !== id);
                localStorage.setItem('cricketPlayers', JSON.stringify(players));

                // Reload the display
                const searchInput = document.getElementById('searchInput');
                if (searchInput.value) {
                    filterPlayers();
                } else {
                    loadPlayers();
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('An error occurred while deleting.');
                if (btnElement) {
                    btnElement.innerHTML = '🗑️ Delete';
                    btnElement.disabled = false;
                }
            }
        }
    };

    window.updatePlayerStatus = async function (id, newStatus, selectElement) {
        // Visual feedback
        if (selectElement) {
            selectElement.style.opacity = '0.5';
            selectElement.disabled = true;
        }

        // Update in Google Sheets if configured
        if (typeof updatePlayerStatusInSheets === 'function') {
            await updatePlayerStatusInSheets(id, newStatus);
        }

        // Update in localStorage
        let players = JSON.parse(localStorage.getItem('cricketPlayers') || '[]');
        // Use loose equality to handle string/number ID mismatches
        const playerIndex = players.findIndex(p => p.id == id);
        if (playerIndex !== -1) {
            players[playerIndex].status = newStatus;
            localStorage.setItem('cricketPlayers', JSON.stringify(players));

            // Reload to update colors
            const searchInput = document.getElementById('searchInput');
            if (searchInput.value) {
                filterPlayers();
            } else {
                loadPlayers();
            }
        }
    };

    // Search functionality
    searchInput.addEventListener('input', filterPlayers);
    roleFilter.addEventListener('change', filterPlayers);
    experienceFilter.addEventListener('change', filterPlayers);

    function filterPlayers() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedRole = roleFilter.value;
        const selectedExperience = experienceFilter.value;

        let players = getPlayers();

        // Apply filters
        players = players.filter(player => {
            const matchesSearch =
                player.name.toLowerCase().includes(searchTerm) ||
                player.email.toLowerCase().includes(searchTerm) ||
                player.contact.includes(searchTerm);

            const matchesRole = !selectedRole || player.role === selectedRole;
            const matchesExperience = !selectedExperience || player.experience === selectedExperience;

            return matchesSearch && matchesRole && matchesExperience;
        });

        displayPlayers(players);
    }

    // Export to CSV
    exportCSVBtn.addEventListener('click', function () {
        const players = getPlayers();

        if (players.length === 0) {
            alert('No players to export!');
            return;
        }

        // Create CSV content
        const headers = ['Name', 'Age', 'Contact', 'Email', 'Place of Posting', 'Address', 'Role', 'Batting Style', 'Bowling Style', 'Experience', 'Jersey Size', 'Status', 'Registered Date'];
        const csvContent = [
            headers.join(','),
            ...players.map(player => {
                const registeredDate = new Date(player.registeredAt).toLocaleDateString('en-IN');
                return [
                    `"${player.name}"`,
                    player.age,
                    player.contact,
                    player.email,
                    `"${player.placeOfPosting || ''}"`,
                    `"${player.address || ''}"`,
                    `"${player.role}"`,
                    `"${player.battingStyle}"`,
                    `"${player.bowlingStyle}"`,
                    `"${player.experience}"`,
                    `"${player.jerseySize || ''}"`,
                    `"${player.status || 'Under Observation'}"`,
                    registeredDate
                ].join(',');
            })
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `cricket-players-${timestamp}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success message
        const originalText = exportCSVBtn.textContent;
        exportCSVBtn.textContent = '✅ Exported!';
        exportCSVBtn.style.background = 'linear-gradient(135deg, var(--success), #00cc70)';

        setTimeout(() => {
            exportCSVBtn.textContent = originalText;
            exportCSVBtn.style.background = '';
        }, 2000);
    });

    // Sync to Google Sheets
    if (syncSheetsBtn) {
        syncSheetsBtn.addEventListener('click', async function () {
            const originalText = syncSheetsBtn.innerText;
            syncSheetsBtn.innerText = '🔄 Syncing...';
            syncSheetsBtn.disabled = true;

            if (typeof syncWithGoogleSheets === 'function') {
                const result = await syncWithGoogleSheets();
                if (result.success) {
                    alert(`✅ Synced ${result.count} players from Google Sheets!`);
                    loadPlayers();
                } else {
                    alert('❌ Sync failed: ' + result.error);
                }
            } else {
                alert('❌ Sync function not available.');
            }

            syncSheetsBtn.innerText = originalText;
            syncSheetsBtn.disabled = false;
        });
    }

    // Broadcast Email Logic
    const sendBroadcastBtn = document.getElementById('sendBroadcastBtn');
    const broadcastSubject = document.getElementById('broadcastSubject');
    const broadcastMessage = document.getElementById('broadcastMessage');

    if (sendBroadcastBtn) {
        sendBroadcastBtn.addEventListener('click', async function () {
            const subject = broadcastSubject.value.trim();
            const message = broadcastMessage.value.trim();

            if (!subject || !message) {
                alert('Please enter both subject and message.');
                return;
            }

            if (!confirm('Are you sure you want to send this email?')) {
                return;
            }

            const originalText = sendBroadcastBtn.innerText;
            sendBroadcastBtn.innerText = '⏳ Sending...';
            sendBroadcastBtn.disabled = true;

            try {
                // Use sheets-api.js to send broadcast
                if (typeof sendBroadcastToSheets === 'function') {
                    const result = await sendBroadcastToSheets(subject, message, selectedRecipients);

                    if (result.success) {
                        alert('✅ Email sent successfully!');
                        broadcastSubject.value = '';
                        broadcastMessage.value = '';

                        // Reset selection
                        if (selectedRecipients) {
                            document.getElementById('cancelSelectionBtn')?.click();
                        }
                    } else {
                        alert('❌ Failed to send email: ' + (result.error || 'Unknown error'));
                    }
                } else {
                    alert('❌ Broadcast function not available.');
                }
            } catch (error) {
                console.error('Broadcast error:', error);
                alert('❌ An error occurred while sending email.');
            } finally {
                sendBroadcastBtn.innerText = originalText;
                sendBroadcastBtn.disabled = false;
            }
        });
    }


    // WhatsApp Broadcast Logic
    const sendWhatsAppBroadcastBtn = document.getElementById('sendWhatsAppBroadcastBtn');

    if (sendWhatsAppBroadcastBtn) {
        sendWhatsAppBroadcastBtn.addEventListener('click', async function () {
            const message = broadcastMessage.value.trim();

            if (!message) {
                alert('Please enter a message.');
                return;
            }

            if (!confirm('Are you sure you want to send this WhatsApp message?')) {
                return;
            }

            const originalText = sendWhatsAppBroadcastBtn.innerText;
            sendWhatsAppBroadcastBtn.innerText = '⏳ Sending...';
            sendWhatsAppBroadcastBtn.disabled = true;

            try {
                // Use sheets-api.js to send broadcast
                if (typeof sendBroadcastWhatsAppToSheets === 'function') {
                    const result = await sendBroadcastWhatsAppToSheets(message, selectedRecipients);

                    if (result.success) {
                        alert('✅ WhatsApp broadcast sent successfully!');
                        broadcastMessage.value = '';

                        // Reset selection
                        if (selectedRecipients) {
                            selectedRecipients = null;
                            const checkboxes = document.querySelectorAll('.player-checkbox');
                            checkboxes.forEach(cb => cb.checked = false);
                            document.getElementById('selectAll').checked = false;
                        }
                    } else {
                        alert('❌ Failed to send WhatsApp: ' + (result.error || 'Unknown error'));
                    }
                } else {
                    alert('❌ Broadcast function not available.');
                }
            } catch (error) {
                console.error('Broadcast error:', error);
                alert('❌ An error occurred while sending WhatsApp.');
            } finally {
                sendWhatsAppBroadcastBtn.innerText = originalText;
                sendWhatsAppBroadcastBtn.disabled = false;
            }
        });
    }

    // Debug: Check if broadcast section is visible
    const broadcastSection = document.getElementById('broadcastSection');
    if (broadcastSection) {
        console.log('Broadcast section found:', broadcastSection);
    } else {
        console.error('Broadcast section NOT found!');
    }
});

// Message Menu Logic
window.toggleMessageMenu = function () {
    const menu = document.getElementById('messageMenu');
    menu.classList.toggle('hidden');

    // Close when clicking outside
    const closeMenu = function (e) {
        if (!e.target.closest('.dropdown')) {
            menu.classList.add('hidden');
            document.removeEventListener('click', closeMenu);
        }
    };

    if (!menu.classList.contains('hidden')) {
        // Delay to prevent immediate closing
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }
};

window.whatsappSelected = function () {
    const checkboxes = document.querySelectorAll('.player-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('Please select at least one player to message.');
        return;
    }

    const recipients = [];
    checkboxes.forEach(cb => {
        const row = cb.closest('tr');
        const email = row.cells[5].innerText; // Using Email as unique ID matching backend logic
        if (email && email !== 'N/A') {
            recipients.push(email);
        }
    });

    if (recipients.length === 0) {
        alert('Selected players do not have valid emails (used for ID).');
        return;
    }

    selectedRecipients = recipients;

    // Scroll to broadcast section
    document.getElementById('broadcastSection').scrollIntoView({ behavior: 'smooth' });

    // Highlight message box
    const messageBox = document.getElementById('broadcastMessage');
    messageBox.focus();
    messageBox.style.boxShadow = '0 0 10px #25D366';
    setTimeout(() => messageBox.style.boxShadow = '', 2000);

    alert(`Selected ${recipients.length} players for WhatsApp. Type your message and click "Send WhatsApp".`);
};

// Email Selected Players
let selectedRecipients = null;

function emailSelected() {
    const checkboxes = document.querySelectorAll('.player-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('Please select at least one player to email.');
        return;
    }

    const recipients = [];
    checkboxes.forEach(cb => {
        const row = cb.closest('tr');
        // Email is in 6th column (index 5) - verify with table structure
        // Table: Checkbox, #, Name, Age, Contact, Email
        const email = row.cells[5].innerText;
        if (email && email !== 'N/A') {
            recipients.push(email);
        }
    });

    if (recipients.length === 0) {
        alert('Selected players do not have valid email addresses.');
        return;
    }

    selectedRecipients = recipients;

    // Scroll to broadcast section
    const broadcastSection = document.getElementById('broadcastSection');
    if (broadcastSection) {
        broadcastSection.scrollIntoView({ behavior: 'smooth' });
        broadcastSection.style.border = '2px solid var(--primary)';
        setTimeout(() => broadcastSection.style.border = 'none', 2000);
    }

    // Update button text
    const btn = document.getElementById('sendBroadcastBtn');
    if (btn) {
        btn.innerHTML = `🚀 Send to ${recipients.length} Selected Players`;
        btn.classList.add('btn-success');
        btn.classList.remove('btn-primary');

        // Add cancel button if not exists
        if (!document.getElementById('cancelSelectionBtn')) {
            const cancelBtn = document.createElement('button');
            cancelBtn.id = 'cancelSelectionBtn';
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.innerText = '❌ Cancel Selection (Send to All)';
            cancelBtn.style.marginLeft = '10px';
            cancelBtn.onclick = function () {
                selectedRecipients = null;
                btn.innerHTML = '🚀 Send Broadcast (All Players)';
                btn.classList.add('btn-primary');
                btn.classList.remove('btn-success');
                this.remove();
            };
            btn.parentNode.appendChild(cancelBtn);
        }
    }
}
