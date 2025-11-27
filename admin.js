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
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    }

    // Login form submission
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const adminId = adminIdInput.value.trim();
        const password = passwordInput.value;

        if (adminId === ADMIN_ID && password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
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
        sessionStorage.removeItem('adminLoggedIn');
        dashboardScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        adminIdInput.value = '';
        passwordInput.value = '';
    });

    // Show dashboard
    function showDashboard() {
        loginScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
        loadPlayers();
    }

    // Load and display players
    function loadPlayers() {
        const players = getPlayers();
        updateStats(players);
        displayPlayers(players);
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

            row.innerHTML = `
                <td>${index + 1}</td>
                <td style="font-weight: 600; color: var(--text-primary);">${player.name}</td>
                <td>${player.age}</td>
                <td>${player.contact}</td>
                <td>${player.email}</td>
                <td><span style="background: rgba(0, 212, 255, 0.2); padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">${player.role}</span></td>
                <td>${player.battingStyle}</td>
                <td>${player.bowlingStyle}</td>
                <td>${player.experience}</td>
                <td>${player.jerseySize || '-'}</td>
                <td>
                    <select onchange="updatePlayerStatus(${player.id}, this.value)" 
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
                    <button class="delete-btn" onclick="deletePlayer(${player.id})" style="background: linear-gradient(135deg, var(--danger), #cc0044); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.3s ease;">
                        🗑️ Delete
                    </button>
                </td>
            `;

            playersTableBody.appendChild(row);
        });
    }

    // Make functions available globally
    window.viewPlayer = function (index) {
        const players = getPlayers();
        const player = players[index];
        alert(`
            Name: ${player.name}
            Age: ${player.age}
            Contact: ${player.contact}
            Email: ${player.email}
            Place of Posting: ${player.placeOfPosting || 'N/A'}
            Address: ${player.address || 'N/A'}
            Role: ${player.role}
            Batting Style: ${player.battingStyle}
            Bowling Style: ${player.bowlingStyle}
            Experience: ${player.experience}
            Jersey Size: ${player.jerseySize || '-'}
            Status: ${player.status}
            Registered: ${new Date(player.registeredAt).toLocaleString()}
        `);
    };

    window.deletePlayer = function (id) {
        if (confirm('Are you sure you want to delete this player?')) {
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
        }
    };

    window.updatePlayerStatus = function (id, newStatus) {
        let players = JSON.parse(localStorage.getItem('cricketPlayers') || '[]');
        const playerIndex = players.findIndex(p => p.id === id);
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
    syncSheetsBtn.addEventListener('click', function () {
        const players = getPlayers();

        if (players.length === 0) {
            alert('No players to sync!');
            return;
        }

        // Placeholder for Google Sheets integration
        alert('Google Sheets integration coming soon!\n\nTo set up:\n1. Create a Google Apps Script\n2. Deploy as Web App\n3. Add the URL to this function\n\nFor now, use CSV export to manually import to Google Sheets.');
    });
});
