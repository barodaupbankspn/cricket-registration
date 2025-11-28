// Player Profiles JavaScript
// Handles displaying player profiles in an attractive card format

// Get all players from localStorage
function getAllPlayers() {
    const players = localStorage.getItem('cricketPlayers');
    return players ? JSON.parse(players) : [];
}

// Get role icon
function getRoleIcon(role) {
    const icons = {
        'Batsman': '🏏',
        'Bowler': '⚡',
        'All-Rounder': '⭐',
        'Wicket-Keeper': '🧤',
        'Wicket-Keeper Batsman': '🧤🏏'
    };
    return icons[role] || '🏏';
}

// Get experience badge color
function getExperienceBadge(experience) {
    const badges = {
        'Beginner': { color: '#00ff88', label: '🌱 Beginner' },
        'Intermediate': { color: '#00d4ff', label: '📈 Intermediate' },
        'Advanced': { color: '#ffd700', label: '🔥 Advanced' },
        'Professional': { color: '#ff6b35', label: '💎 Professional' }
    };
    return badges[experience] || badges['Beginner'];
}

// Create player card HTML
function createPlayerCard(player, index) {
    const roleIcon = getRoleIcon(player.role);
    const experienceBadge = getExperienceBadge(player.experience);
    const registrationDate = new Date(player.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return `
        <div class="player-profile-card card" style="animation: fadeInUp 0.6s ease ${index * 0.1}s both;">
            <!-- Player Header -->
            <div class="player-header" style="text-align: center; padding-bottom: var(--spacing-md); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <div class="player-avatar" style="width: 80px; height: 80px; margin: 0 auto var(--spacing-sm); background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; box-shadow: var(--shadow-glow);">
                    ${roleIcon}
                </div>
                <h3 style="margin-bottom: var(--spacing-xs); color: var(--text-primary);">${player.name}</h3>
                <div style="display: inline-block; padding: 4px 12px; background: linear-gradient(135deg, ${experienceBadge.color}22, ${experienceBadge.color}44); border: 1px solid ${experienceBadge.color}; border-radius: 20px; font-size: 0.85rem; color: ${experienceBadge.color}; font-weight: 600; margin-bottom: var(--spacing-sm);">
                    ${experienceBadge.label}
                </div>
            </div>

            <!-- Player Stats -->
            <div class="player-stats" style="padding: var(--spacing-md) 0;">
                <div class="stat-row" style="display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <span style="color: var(--text-muted); font-size: 0.9rem;">Age</span>
                    <span style="color: var(--text-primary); font-weight: 600;">${player.age} years</span>
                </div>
                <div class="stat-row" style="display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <span style="color: var(--text-muted); font-size: 0.9rem;">Playing Role</span>
                    <span style="color: var(--primary); font-weight: 600;">${player.role}</span>
                </div>
                <div class="stat-row" style="display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <span style="color: var(--text-muted); font-size: 0.9rem;">Batting Style</span>
                    <span style="color: var(--text-primary); font-weight: 600;">${player.battingStyle}</span>
                </div>
                <div class="stat-row" style="display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <span style="color: var(--text-muted); font-size: 0.9rem;">Bowling Style</span>
                    <span style="color: var(--text-primary); font-weight: 600;">${player.bowlingStyle || 'N/A'}</span>
                </div>
            </div>

            <!-- Contact Info -->
            <div class="player-contact" style="padding-top: var(--spacing-md); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-xs);">
                    <span style="font-size: 1.2rem;">📧</span>
                    <a href="mailto:${player.email}" style="color: var(--primary); text-decoration: none; font-size: 0.9rem; word-break: break-all;">${player.email}</a>
                </div>
                <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-xs);">
                    <span style="font-size: 1.2rem;">📱</span>
                    <a href="tel:${player.contact}" style="color: var(--primary); text-decoration: none; font-size: 0.9rem;">${player.contact}</a>
                </div>
                <div style="display: flex; align-items: center; gap: var(--spacing-sm); color: var(--text-muted); font-size: 0.85rem; margin-top: var(--spacing-sm);">
                    <span>📅</span>
                    <span>Joined ${registrationDate}</span>
                </div>
            </div>
        </div>
    `;
}

// Update statistics
function updateStats(players) {
    document.getElementById('totalPlayers').textContent = players.length;

    const batsmen = players.filter(p => p.role === 'Batsman').length;
    const bowlers = players.filter(p => p.role === 'Bowler').length;
    const allRounders = players.filter(p => p.role === 'All-Rounder').length;

    document.getElementById('totalBatsmen').textContent = batsmen;
    document.getElementById('totalBowlers').textContent = bowlers;
    document.getElementById('totalAllRounders').textContent = allRounders;
}

// Display players
function displayPlayers(playersToDisplay = null) {
    const players = playersToDisplay || getAllPlayers();
    const playersGrid = document.getElementById('playersGrid');
    const noPlayers = document.getElementById('noPlayers');

    if (players.length === 0) {
        noPlayers.classList.remove('hidden');
        playersGrid.classList.add('hidden');
        updateStats([]);
        return;
    }

    noPlayers.classList.add('hidden');
    playersGrid.classList.remove('hidden');

    playersGrid.innerHTML = players.map((player, index) => createPlayerCard(player, index)).join('');
    updateStats(players);
}

// Filter players
function filterPlayers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const experienceFilter = document.getElementById('experienceFilter').value;

    let players = getAllPlayers();

    // Apply search filter
    if (searchTerm) {
        players = players.filter(player =>
            player.name.toLowerCase().includes(searchTerm)
        );
    }

    // Apply role filter
    if (roleFilter) {
        players = players.filter(player => player.role === roleFilter);
    }

    // Apply experience filter
    if (experienceFilter) {
        players = players.filter(player => player.experience === experienceFilter);
    }

    displayPlayers(players);
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    displayPlayers();

    // Add event listeners for filters
    document.getElementById('searchInput').addEventListener('input', filterPlayers);
    document.getElementById('roleFilter').addEventListener('change', filterPlayers);
    document.getElementById('experienceFilter').addEventListener('change', filterPlayers);
});
