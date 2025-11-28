// Player Login - Status Check
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('playerLoginForm');
    const mobileInput = document.getElementById('mobileNumber');
    const loginError = document.getElementById('loginError');
    const statusDisplay = document.getElementById('statusDisplay');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const mobile = mobileInput.value.trim();

        // Show loading state
        const originalBtnText = form.querySelector('button').innerText;
        form.querySelector('button').innerText = 'Checking...';

        let players = [];

        // Try to get from Google Sheets first (for cross-device visibility)
        try {
            if (typeof getAllPlayersFromSheets === 'function') {
                const sheetResult = await getAllPlayersFromSheets();
                if (sheetResult.success && sheetResult.players.length > 0) {
                    players = sheetResult.players;
                    console.log('Fetched players from Google Sheets');
                } else {
                    // Fallback to localStorage
                    players = JSON.parse(localStorage.getItem('cricketPlayers') || '[]');
                    console.log('Using localStorage data');
                }
            } else {
                players = JSON.parse(localStorage.getItem('cricketPlayers') || '[]');
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            players = JSON.parse(localStorage.getItem('cricketPlayers') || '[]');
        }

        form.querySelector('button').innerText = originalBtnText;

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
            statusColor = 'linear-gradient(135deg, #00e676, #00c853, #69f0ae)'; // Sparkling Green Gradient
            statusIcon = '✅';
            statusText = 'APPROVED';
            statusHTML = `
                <div class="sparkling-bg status-card-sparkle" style="background: ${statusColor}; padding: 2rem; border-radius: 12px; color: white; box-shadow: 0 12px 32px rgba(0, 230, 118, 0.6); border: 4px solid #00c853;">
                    <div style="font-size: 5rem; margin-bottom: 1rem;">${statusIcon}</div>
                    <h3 style="margin-bottom: 1rem; color: white; font-size: 2.5rem; font-weight: 900; text-shadow: 0 3px 10px rgba(0,0,0,0.5); text-transform: uppercase;">Welcome, ${player.name}!</h3>
                    <p style="font-size: 2.5rem; font-weight: 900; margin-bottom: 1.5rem; text-shadow: 0 3px 8px rgba(0,0,0,0.4); background: rgba(0,0,0,0.3); padding: 1rem 2rem; border-radius: 12px; display: inline-block; border: 3px solid white;">STATUS: ${statusText}</p>
                    <p style="font-size: 1.3rem; font-weight: 600; line-height: 1.8; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px;">Congratulations! You have been approved to join the Shahjahanpur Spartans.</p>
                    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 3px solid rgba(255,255,255,0.6); background: rgba(0,0,0,0.15); padding: 1rem; border-radius: 8px;">
                        <p style="font-size: 1.3rem; font-weight: 700; margin: 0.5rem 0;"><strong>Role:</strong> ${player.role}</p>
                        <p style="font-size: 1.3rem; font-weight: 700; margin: 0.5rem 0;"><strong>Experience:</strong> ${player.experience}</p>
                    </div>
                </div>
            `;
        } else if (status === 'Rejected') {
            statusColor = 'linear-gradient(135deg, #ff1744, #d50000, #ff5252)'; // Sparkling Red Gradient
            statusIcon = '❌';
            statusText = 'NOT APPROVED';
            statusHTML = `
                <div class="sparkling-bg status-card-sparkle" style="background: ${statusColor}; padding: 2rem; border-radius: 12px; color: white; box-shadow: 0 12px 32px rgba(255, 23, 68, 0.6); border: 4px solid #d50000;">
                    <div style="font-size: 5rem; margin-bottom: 1rem;">${statusIcon}</div>
                    <h3 style="margin-bottom: 1rem; color: white; font-size: 2.5rem; font-weight: 900; text-shadow: 0 3px 10px rgba(0,0,0,0.5); text-transform: uppercase;">Hi ${player.name}</h3>
                    <p style="font-size: 2.5rem; font-weight: 900; margin-bottom: 1.5rem; text-shadow: 0 3px 8px rgba(0,0,0,0.4); background: rgba(0,0,0,0.3); padding: 1rem 2rem; border-radius: 12px; display: inline-block; border: 3px solid white;">STATUS: ${statusText}</p>
                    <p style="font-size: 1.3rem; font-weight: 600; line-height: 1.8; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px;">Unfortunately, your application was not approved at this time.</p>
                </div>
            `;
        } else {
            // Under Observation / Pending
            statusColor = 'linear-gradient(135deg, #ff9800, #f57c00, #ffb74d)'; // Sparkling Orange Gradient
            statusIcon = '🧐';
            statusText = 'UNDER OBSERVATION';
            statusHTML = `
                <div class="sparkling-bg status-card-sparkle" style="background: ${statusColor}; padding: 2rem; border-radius: 12px; color: #000000; box-shadow: 0 12px 32px rgba(255, 152, 0, 0.6); border: 4px solid #f57c00;">
                    <div style="font-size: 5rem; margin-bottom: 1rem;">${statusIcon}</div>
                    <h3 style="margin-bottom: 1rem; color: #000000; font-size: 2.5rem; font-weight: 900; text-shadow: 0 2px 4px rgba(255,255,255,0.7); text-transform: uppercase;">Hi ${player.name}!</h3>
                    <p style="font-size: 2.5rem; font-weight: 900; margin-bottom: 1.5rem; text-shadow: 0 2px 4px rgba(255,255,255,0.5); background: rgba(0,0,0,0.25); padding: 1rem 2rem; border-radius: 12px; display: inline-block; border: 3px solid #000000; color: #000000;">STATUS: ${statusText}</p>
                    <p style="font-size: 1.3rem; font-weight: 700; line-height: 1.8; color: #000000; background: rgba(0,0,0,0.15); padding: 1rem; border-radius: 8px;">Your application is currently under observation by the selectors.</p>
                    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 3px solid rgba(0,0,0,0.4); background: rgba(0,0,0,0.15); padding: 1rem; border-radius: 8px;">
                        <p style="font-size: 1.3rem; font-weight: 700; margin: 0.5rem 0;"><strong>Registered:</strong> ${new Date(player.registeredAt).toLocaleDateString()}</p>
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
