// GitHub Backup Functionality
// Download player data as JSON for GitHub backup

function downloadGitHubBackup() {
    const players = getPlayers();

    if (players.length === 0) {
        alert('No player data to backup!');
        return;
    }

    // Create backup object with metadata
    const backup = {
        backupDate: new Date().toISOString(),
        totalPlayers: players.length,
        stats: {
            approved: players.filter(p => p.status === 'Approved').length,
            rejected: players.filter(p => p.status === 'Rejected').length,
            underObservation: players.filter(p => p.status === 'Under Observation').length
        },
        players: players
    };

    // Convert to JSON with formatting
    const jsonContent = JSON.stringify(backup, null, 2);

    // Create blob and download
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const timestamp = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `cricket-players-backup-${timestamp}.json`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success message
    return true;
}

// Get players from localStorage
function getPlayers() {
    const playersData = localStorage.getItem('cricketPlayers');
    return playersData ? JSON.parse(playersData) : [];
}

// Import backup from JSON file
function importBackupFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                const backup = JSON.parse(e.target.result);

                // Validate backup structure
                if (!backup.players || !Array.isArray(backup.players)) {
                    reject(new Error('Invalid backup file format'));
                    return;
                }

                // Merge with existing players (avoid duplicates by ID)
                let existingPlayers = getPlayers();
                const existingIds = new Set(existingPlayers.map(p => p.id));

                const newPlayers = backup.players.filter(p => !existingIds.has(p.id));
                const mergedPlayers = [...existingPlayers, ...newPlayers];

                localStorage.setItem('cricketPlayers', JSON.stringify(mergedPlayers));

                resolve({
                    success: true,
                    imported: newPlayers.length,
                    skipped: backup.players.length - newPlayers.length
                });
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = function () {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
}
