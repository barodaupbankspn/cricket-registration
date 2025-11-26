// Player Login - Status Check
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('playerLoginForm');
    const mobileInput = document.getElementById('mobileNumber');
    const loginError = document.getElementById('loginError');
    const statusDisplay = document.getElementById('statusDisplay');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const mobile = mobileInput.value.trim();

        // Get all players
        const players = JSON.parse(localStorage.getItem('cricketPlayers') || '[]');

        // Find player by mobile number
        const player = players.find(p => p.contact === mobile);

        if (!player) {
            // Player not found
            loginError.classList.remove('hidden');
            statusDisplay.classList.add('hidden');
            return;
        }

        // Player found - show status
        loginError.classList.add('hidden');
        statusDisplay.classList.remove('hidden');

        const status = player.status || 'pending';

        let statusHTML = '';
        let statusColor = '';
        let statusIcon = '';
        let statusText = '';

        if (status === 'Approved') {
            statusColor = 'linear-gradient(135deg, var(--success), #00cc70)';
            statusIcon = '✅';
            statusText = 'Approved';
            statusHTML = `
                <div style="background: ${statusColor}; padding: var(--spacing-lg); border-radius: var(--radius-md); color: white;">
                    <div style="font-size: 3rem; margin-bottom: var(--spacing-sm);">${statusIcon}</div>
                    <h3 style="margin-bottom: var(--spacing-sm); color: white;">Welcome, ${player.name}!</h3>
                    <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: var(--spacing-sm);">Status: ${statusText}</p>
                    <p style="opacity: 0.9;">Congratulations! You have been approved to join the Shahjahanpur Spartans.</p>
                    <div style="margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid rgba(255,255,255,0.3);">
                        <p><strong>Role:</strong> ${player.role}</p>
                        <p><strong>Experience:</strong> ${player.experience}</p>
                    </div>
                </div>
            `;
        } else if (status === 'Rejected') {
            statusColor = 'linear-gradient(135deg, var(--danger), #cc0044)';
            statusIcon = '❌';
            statusText = 'Not Approved';
            statusHTML = `
                <div style="background: ${statusColor}; padding: var(--spacing-lg); border-radius: var(--radius-md); color: white;">
                    <div style="font-size: 3rem; margin-bottom: var(--spacing-sm);">${statusIcon}</div>
                    <h3 style="margin-bottom: var(--spacing-sm); color: white;">Hi ${player.name}</h3>
                    <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: var(--spacing-sm);">Status: ${statusText}</p>
                    <p style="opacity: 0.9;">Unfortunately, your application was not approved at this time.</p>
                </div>
            `;
        } else {
            // Under Observation / Pending
            statusColor = 'linear-gradient(135deg, var(--accent), #ffaa00)';
            statusIcon = '🧐';
            statusText = 'Under Observation';
            statusHTML = `
                <div style="background: ${statusColor}; padding: var(--spacing-lg); border-radius: var(--radius-md); color: #0a0e27;">
                    <div style="font-size: 3rem; margin-bottom: var(--spacing-sm);">${statusIcon}</div>
                    <h3 style="margin-bottom: var(--spacing-sm); color: #0a0e27;">Hi ${player.name}!</h3>
                    <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: var(--spacing-sm);">Status: ${statusText}</p>
                    <p style="opacity: 0.9;">Your application is currently under observation by the selectors.</p>
                    <div style="margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid rgba(10,14,39,0.3);">
                        <p><strong>Registered:</strong> ${new Date(player.registeredAt).toLocaleDateString()}</p>
                    </div>
                </div>
            `;
        }

        statusDisplay.innerHTML = statusHTML;
    });

    // Clear error on input
    mobileInput.addEventListener('input', function () {
        loginError.classList.add('hidden');
    });
});
