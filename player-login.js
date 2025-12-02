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
        const player = players.find(p => String(p.contact).trim() === mobile);

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

                    <div style="margin-top: 1.5rem; background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; border: 2px dashed rgba(255,255,255,0.5);">
                        <label style="display: block; margin-bottom: 0.8rem; font-weight: 800; font-size: 1.2rem; text-transform: uppercase;">Choose Your Jersey Number</label>
                        <div style="display: flex; gap: 10px; justify-content: center; align-items: center; flex-wrap: wrap;">
                            <input type="number" id="jerseyNumberInput" placeholder="No." value="${player.jerseySize || ''}" 
                                style="padding: 0.8rem; border-radius: 8px; border: none; width: 120px; color: #0a0e27; font-weight: 800; font-size: 1.5rem; text-align: center;">
                            <button id="saveJerseyBtn" style="padding: 0.8rem 1.5rem; background: white; color: #00c853; border: none; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 1.1rem; text-transform: uppercase; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">Save</button>
                        </div>
                        <p id="jerseySaveMsg" style="margin-top: 1rem; font-size: 1rem; font-weight: 600; min-height: 1.5em;"></p>
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

        // Add event listener for Jersey Save
        const saveJerseyBtn = document.getElementById('saveJerseyBtn');
        if (saveJerseyBtn) {
            saveJerseyBtn.addEventListener('click', async function () {
                const input = document.getElementById('jerseyNumberInput');
                const msg = document.getElementById('jerseySaveMsg');
                const newNumber = input.value.trim();

                if (!newNumber) {
                    msg.textContent = 'Please enter a number.';
                    msg.style.color = '#ffeb3b';
                    return;
                }

                saveJerseyBtn.disabled = true;
                saveJerseyBtn.textContent = 'Saving...';
                msg.textContent = '';

                try {
                    // Call API to save
                    if (typeof updateJerseyNumberInSheets === 'function') {
                        const result = await updateJerseyNumberInSheets(player.id, newNumber);
                        if (result.success) {
                            msg.textContent = '✅ Jersey number saved!';
                            msg.style.color = 'white';

                            // Update local storage
                            const players = JSON.parse(localStorage.getItem('cricketPlayers') || '[]');
                            const pIndex = players.findIndex(p => p.id === player.id);
                            if (pIndex !== -1) {
                                players[pIndex].jerseySize = newNumber;
                                localStorage.setItem('cricketPlayers', JSON.stringify(players));
                            }
                        } else {
                            if (result.error === 'Duplicate') {
                                // Show popup for duplicate
                                alert(`⚠️ Jersey Number ${newNumber} is already taken by ${result.ownerName || 'another player'}.\n\nPlease choose a different number.`);
                                msg.textContent = '❌ Number taken. Try another.';
                                msg.style.color = '#ff1744';
                                input.value = ''; // Clear input
                                input.focus();
                            } else {
                                msg.textContent = '❌ Failed to save: ' + result.error;
                                msg.style.color = '#ff1744';
                            }
                        }
                    } else {
                        msg.textContent = '❌ API not available.';
                        msg.style.color = '#ff1744';
                    }
                    console.error(e);
                    msg.textContent = '❌ Error saving.';
                    msg.style.color = '#ff1744';
                } finally {
                    saveJerseyBtn.disabled = false;
                    saveJerseyBtn.textContent = 'Save';
                }
            });
        }
    });

    // Clear error on input
    mobileInput.addEventListener('input', function () {
        loginError.classList.add('hidden');
    });
});
