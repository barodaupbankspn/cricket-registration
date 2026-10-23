// Cricket Team Registration - Main Application Logic

// Form validation and submission
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registrationForm');
    const successMessage = document.getElementById('successMessage');

    // Form field elements
    const fields = {
        playerName: document.getElementById('playerName'),
        age: document.getElementById('age'),
        contact: document.getElementById('contact'),
        email: document.getElementById('email'),
        role: document.getElementById('role'),
        battingStyle: document.getElementById('battingStyle'),
        bowlingStyle: document.getElementById('bowlingStyle'),
        experience: document.getElementById('experience'),
        jerseySize: document.getElementById('jerseySize'),
        placeOfPosting: document.getElementById('placeOfPosting'),
        address: document.getElementById('address')
    };
    const existingRegistrationNotice = document.getElementById('existingRegistrationNotice');
    const submitBtn = form.querySelector('button[type="submit"]');
    const defaultSubmitText = submitBtn.textContent.trim();
    let contactLookupState = 'idle';
    let contactLookupTimer = null;
    let contactLookupSequence = 0;
    let lastContactLookup = '';

    function normalizePhone(value) {
        if (typeof normalizeCricketPhone === 'function') {
            return normalizeCricketPhone(value);
        }
        const digits = String(value || '').replace(/\D/g, '');
        return digits.length > 10 ? digits.slice(-10) : digits;
    }

    function setNotice(message, state) {
        existingRegistrationNotice.textContent = message;
        existingRegistrationNotice.className = `existing-registration-notice is-${state}`;
        existingRegistrationNotice.classList.remove('hidden');
    }

    function clearNotice() {
        existingRegistrationNotice.replaceChildren();
        existingRegistrationNotice.className = 'existing-registration-notice hidden';
    }

    function showExistingRegistration(player, source, remoteAvailable) {
        existingRegistrationNotice.replaceChildren();
        existingRegistrationNotice.className = 'existing-registration-notice is-found';

        const heading = document.createElement('strong');
        heading.textContent = 'We found your existing registration';
        const detail = document.createElement('div');
        detail.textContent = `${player.name || 'Registered player'} · ${player.status || 'Under Observation'}`;
        existingRegistrationNotice.append(heading, detail);

        if (player.role) {
            const role = document.createElement('div');
            role.className = 'existing-registration-meta';
            role.textContent = `Playing role: ${player.role}`;
            existingRegistrationNotice.appendChild(role);
        }

        if (player.registeredAt) {
            const registeredDate = new Date(player.registeredAt);
            if (!Number.isNaN(registeredDate.getTime())) {
                const date = document.createElement('div');
                date.className = 'existing-registration-meta';
                date.textContent = `Registered on ${registeredDate.toLocaleDateString('en-IN')}`;
                existingRegistrationNotice.appendChild(date);
            }
        }

        if (source === 'device' && remoteAvailable) {
            const localNote = document.createElement('div');
            localNote.className = 'existing-registration-meta';
            localNote.textContent = 'This registration is saved on this browser and was not found in the shared list.';
            existingRegistrationNotice.appendChild(localNote);
        } else if (!remoteAvailable) {
            const localNote = document.createElement('div');
            localNote.className = 'existing-registration-meta';
            localNote.textContent = 'This copy was found on this device. The shared list could not be checked.';
            existingRegistrationNotice.appendChild(localNote);
        }

        const statusLink = document.createElement('a');
        statusLink.href = 'player-login.html';
        statusLink.textContent = 'Open registration status';
        existingRegistrationNotice.appendChild(statusLink);
        existingRegistrationNotice.classList.remove('hidden');
    }

    function updateSubmitButton() {
        if (contactLookupState === 'checking') {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Checking previous registration…';
        } else if (contactLookupState === 'found') {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Already registered';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = defaultSubmitText;
        }
    }

    async function checkPreviousRegistration(phone, sequence) {
        try {
            let timeoutId;
            const timeout = new Promise((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('Registration lookup timed out')), 10000);
            });
            const lookup = typeof findRegisteredPlayerByContact === 'function'
                ? findRegisteredPlayerByContact(phone)
                : Promise.resolve({ success: false, error: 'Registration lookup is unavailable' });
            let result;
            try {
                result = await Promise.race([lookup, timeout]);
            } finally {
                clearTimeout(timeoutId);
            }

            if (sequence !== contactLookupSequence) return;
            if (result.success && result.player) {
                contactLookupState = 'found';
                showExistingRegistration(result.player, result.source, result.remoteAvailable);
            } else if (result.success) {
                contactLookupState = 'not-found';
                setNotice('No previous registration was found for this number. You can continue with registration.', 'empty');
            } else {
                contactLookupState = 'unavailable';
                setNotice('We could not reach the shared registration list. You can continue; the server will still prevent a duplicate registration.', 'unavailable');
            }
        } catch (error) {
            if (sequence !== contactLookupSequence) return;
            console.warn('Could not check previous registration:', error);
            contactLookupState = 'unavailable';
            setNotice('We could not reach the shared registration list. You can continue; the server will still prevent a duplicate registration.', 'unavailable');
        }
        updateSubmitButton();
    }

    function resetContactLookup() {
        clearTimeout(contactLookupTimer);
        contactLookupSequence++;
        lastContactLookup = '';
        contactLookupState = 'idle';
        clearNotice();
        updateSubmitButton();
    }

    fields.contact.addEventListener('input', function () {
        clearTimeout(contactLookupTimer);
        const phone = normalizePhone(fields.contact.value);
        if (phone.length !== 10) {
            resetContactLookup();
            return;
        }
        if (phone === lastContactLookup && (contactLookupState === 'checking' || contactLookupState === 'found' || contactLookupState === 'not-found')) {
            return;
        }

        lastContactLookup = phone;
        const sequence = ++contactLookupSequence;
        contactLookupState = 'checking';
        setNotice('Checking for your previous registration…', 'checking');
        updateSubmitButton();
        contactLookupTimer = setTimeout(() => checkPreviousRegistration(phone, sequence), 350);
    });

    // Error message elements
    const errors = {
        name: document.getElementById('nameError'),
        age: document.getElementById('ageError'),
        contact: document.getElementById('contactError'),
        email: document.getElementById('emailError'),
        role: document.getElementById('roleError'),
        batting: document.getElementById('battingError'),
        experience: document.getElementById('experienceError'),
        jerseySize: document.getElementById('jerseySizeError'),
        posting: document.getElementById('postingError'),
        address: document.getElementById('addressError')
    };

    // Real-time validation
    fields.playerName.addEventListener('blur', () => validateName());
    fields.age.addEventListener('blur', () => validateAge());
    fields.contact.addEventListener('blur', () => validateContact());
    fields.email.addEventListener('blur', () => validateEmail());
    fields.role.addEventListener('change', () => validateRole());
    fields.battingStyle.addEventListener('change', () => validateBattingStyle());
    fields.experience.addEventListener('change', () => validateExperience());
    fields.jerseySize.addEventListener('change', () => validateJerseySize());
    fields.placeOfPosting.addEventListener('blur', () => validatePosting());
    fields.address.addEventListener('blur', () => validateAddress());

    // Validation functions
    function validateName() {
        const value = fields.playerName.value.trim();
        if (value.length < 2) {
            showError(errors.name);
            return false;
        }
        hideError(errors.name);
        return true;
    }

    function validateAge() {
        const value = parseInt(fields.age.value);
        if (isNaN(value) || value < 10 || value > 100) {
            showError(errors.age);
            return false;
        }
        hideError(errors.age);
        return true;
    }

    function validateContact() {
        const value = fields.contact.value.trim();
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(value)) {
            showError(errors.contact);
            return false;
        }
        hideError(errors.contact);
        return true;
    }

    function validateEmail() {
        const value = fields.email.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showError(errors.email);
            return false;
        }
        hideError(errors.email);
        return true;
    }

    function validateRole() {
        if (!fields.role.value) {
            showError(errors.role);
            return false;
        }
        hideError(errors.role);
        return true;
    }

    function validateBattingStyle() {
        if (!fields.battingStyle.value) {
            showError(errors.batting);
            return false;
        }
        hideError(errors.batting);
        return true;
    }

    function validateExperience() {
        if (!fields.experience.value) {
            showError(errors.experience);
            return false;
        }
        hideError(errors.experience);
        return true;
    }

    function validateJerseySize() {
        if (!fields.jerseySize.value) {
            showError(errors.jerseySize);
            return false;
        }
        hideError(errors.jerseySize);
        return true;
    }

    function validatePosting() {
        if (!fields.placeOfPosting.value.trim()) {
            showError(errors.posting);
            return false;
        }
        hideError(errors.posting);
        return true;
    }

    function validateAddress() {
        if (!fields.address.value.trim()) {
            showError(errors.address);
            return false;
        }
        hideError(errors.address);
        return true;
    }

    function showError(errorElement) {
        if (errorElement) {
            errorElement.classList.remove('hidden');
        }
    }

    function hideError(errorElement) {
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }

    // Form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (contactLookupState === 'checking') {
            setNotice('Please wait while we check whether this number is already registered.', 'checking');
            return;
        }
        if (contactLookupState === 'found') {
            return;
        }

        // Validate all fields
        const isNameValid = validateName();
        const isAgeValid = validateAge();
        const isContactValid = validateContact();
        const isEmailValid = validateEmail();
        const isRoleValid = validateRole();
        const isBattingValid = validateBattingStyle();
        const isExperienceValid = validateExperience();
        const isJerseySizeValid = validateJerseySize();
        const isPostingValid = validatePosting();
        const isAddressValid = validateAddress();

        if (isNameValid && isAgeValid && isContactValid && isEmailValid &&
            isRoleValid && isBattingValid && isExperienceValid && isJerseySizeValid &&
            isPostingValid && isAddressValid) {

            // Disable submit button and show loading
            const originalText = defaultSubmitText;
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Submitting...';

            // Create player object
            const player = {
                id: Date.now(),
                name: fields.playerName.value.trim(),
                age: parseInt(fields.age.value),
                contact: fields.contact.value.trim(),
                email: fields.email.value.trim(),
                placeOfPosting: fields.placeOfPosting.value.trim(),
                address: fields.address.value.trim(),
                role: fields.role.value,
                battingStyle: fields.battingStyle.value,
                bowlingStyle: fields.bowlingStyle.value || 'N/A',
                experience: fields.experience.value,
                jerseySize: fields.jerseySize.value,
                status: 'Under Observation',
                registeredAt: new Date().toISOString()
            };

            let sheetsMessage = '';
            let duplicatePhone = false;
            if (typeof savePlayerToSheets === 'function') {
                try {
                    const sheetsResult = await savePlayerToSheets(player);
                    if (sheetsResult.success) {
                        sheetsMessage = ' It is now available through the shared registration database.';
                    } else if (sheetsResult.error === 'Mobile number already registered') {
                        duplicatePhone = true;
                    } else {
                        console.warn('Google Sheets save failed:', sheetsResult.error);
                        sheetsMessage = ' It is saved only on this device because Google Sheets could not confirm the save.';
                    }
                } catch (error) {
                    console.error('Google Sheets save failed:', error);
                    sheetsMessage = ' It is saved only on this device because Google Sheets could not confirm the save.';
                }
            }

            if (duplicatePhone) {
                contactLookupState = 'found';
                setNotice('This mobile number is already registered in the shared database. Open registration status to view the existing record.', 'found');
                const statusLink = document.createElement('a');
                statusLink.href = 'player-login.html';
                statusLink.textContent = 'Open registration status';
                existingRegistrationNotice.appendChild(statusLink);
                existingRegistrationNotice.classList.remove('hidden');
                updateSubmitButton();
                return;
            }

            // Keep local copy for immediate visibility and offline fallback.
            savePlayer(player);

            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            // Show success message
            successMessage.textContent = '🎉 Registration saved on this device.' + sheetsMessage;
            successMessage.classList.remove('hidden');

            // Reset form
            form.reset();
            resetContactLookup();

            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 5000);
        }
    });

    // Save player to localStorage
    function savePlayer(player) {
        let players = getPlayers();
        players = players.filter(existing => String(existing.id) !== String(player.id));
        players.push(player);
        localStorage.setItem('cricketPlayers', JSON.stringify(players));
    }

    // Get all players from localStorage
    function getPlayers() {
        const playersData = localStorage.getItem('cricketPlayers');
        return playersData ? JSON.parse(playersData) : [];
    }
});
