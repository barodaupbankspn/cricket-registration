// Cricket Team Registration - Admin Dashboard

document.addEventListener('DOMContentLoaded', function () {
    const ADMIN_PASSWORD = 'admin123'; // Change this for production

    // Screen elements
    const loginScreen = document.getElementById('loginScreen');
    const dashboardScreen = document.getElementById('dashboardScreen');

    // Login form
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');

    // Dashboard elements
    const logoutBtn = document.getElementById('logoutBtn');
    const exportCSVBtn = document.getElementById('exportCSV');
    const syncSheetsBtn = document.getElementById('syncSheets');

    // Table elements
    const playersTableBody = document.getElementById('playersTableBody');
    const playersTableContainer = document.getElementById('playersTableContainer');
    const noPlayers = document.getElementById('noPlayers');

    // Filter elements
    const searchInput = document.getElementById('searchInput');
    const roleFilter = document.getElementById('roleFilter');
    const experienceFilter = document.getElementById('experienceFilter');

    // Stats elements
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

        if (passwordInput.value === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            loginError.classList.add('hidden');
            showDashboard();
        } else {
            loginError.classList.remove('hidden');
            passwordInput.value = '';
            passwordInput.focus();
        }
    });

    // Logout
    logoutBtn.addEventListener('click', function () {
        sessionStorage.removeItem('adminLoggedIn');
        dashboardScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
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
                <td>${formattedDate}</td>
            `;

            playersTableBody.appendChild(row);
        });
    }

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
        const headers = ['Name', 'Age', 'Contact', 'Email', 'Role', 'Batting Style', 'Bowling Style', 'Experience', 'Registered Date'];
        const csvContent = [
            headers.join(','),
            ...players.map(player => {
                const registeredDate = new Date(player.registeredAt).toLocaleDateString('en-IN');
                return [
                    `"${player.name}"`,
                    player.age,
                    player.contact,
                    player.email,
                    `"${player.role}"`,
                    `"${player.battingStyle}"`,
                    `"${player.bowlingStyle}"`,
                    `"${player.experience}"`,
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

        // Example implementation:
        // const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
        // fetch(scriptURL, {
        //     method: 'POST',
        //     body: JSON.stringify(players)
        // })
        // .then(response => response.json())
        // .then(data => {
        //     alert('Successfully synced to Google Sheets!');
        // })
        // .catch(error => {
        //     alert('Error syncing to Google Sheets: ' + error.message);
        // });
    });
});
