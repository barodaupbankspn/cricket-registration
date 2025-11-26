// Cricket Team Registration - Main Application Logic

// Form validation and submission
document.addEventListener('DOMContentLoaded', function() {
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
        experience: document.getElementById('experience')
    };
    
    // Error message elements
    const errors = {
        name: document.getElementById('nameError'),
        age: document.getElementById('ageError'),
        contact: document.getElementById('contactError'),
        email: document.getElementById('emailError'),
        role: document.getElementById('roleError'),
        batting: document.getElementById('battingError'),
        experience: document.getElementById('experienceError')
    };
    
    // Real-time validation
    fields.playerName.addEventListener('blur', () => validateName());
    fields.age.addEventListener('blur', () => validateAge());
    fields.contact.addEventListener('blur', () => validateContact());
    fields.email.addEventListener('blur', () => validateEmail());
    fields.role.addEventListener('change', () => validateRole());
    fields.battingStyle.addEventListener('change', () => validateBattingStyle());
    fields.experience.addEventListener('change', () => validateExperience());
    
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
    
    function showError(errorElement) {
        errorElement.classList.remove('hidden');
    }
    
    function hideError(errorElement) {
        errorElement.classList.add('hidden');
    }
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        const isNameValid = validateName();
        const isAgeValid = validateAge();
        const isContactValid = validateContact();
        const isEmailValid = validateEmail();
        const isRoleValid = validateRole();
        const isBattingValid = validateBattingStyle();
        const isExperienceValid = validateExperience();
        
        if (isNameValid && isAgeValid && isContactValid && isEmailValid && 
            isRoleValid && isBattingValid && isExperienceValid) {
            
            // Create player object
            const player = {
                id: Date.now(),
                name: fields.playerName.value.trim(),
                age: parseInt(fields.age.value),
                contact: fields.contact.value.trim(),
                email: fields.email.value.trim(),
                role: fields.role.value,
                battingStyle: fields.battingStyle.value,
                bowlingStyle: fields.bowlingStyle.value || 'N/A',
                experience: fields.experience.value,
                registeredAt: new Date().toISOString()
            };
            
            // Save to localStorage
            savePlayer(player);
            
            // Show success message
            successMessage.classList.remove('hidden');
            
            // Reset form
            form.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 5000);
            
            // Optional: Send to Google Sheets (implement later)
            // sendToGoogleSheets(player);
        }
    });
    
    // Save player to localStorage
    function savePlayer(player) {
        let players = getPlayers();
        players.push(player);
        localStorage.setItem('cricketPlayers', JSON.stringify(players));
    }
    
    // Get all players from localStorage
    function getPlayers() {
        const playersData = localStorage.getItem('cricketPlayers');
        return playersData ? JSON.parse(playersData) : [];
    }
    
    // Google Sheets integration (placeholder)
    function sendToGoogleSheets(player) {
        // This will be implemented with Google Apps Script or API
        console.log('Sending to Google Sheets:', player);
        
        // Example: Using Google Apps Script Web App
        // const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
        // fetch(scriptURL, {
        //     method: 'POST',
        //     body: JSON.stringify(player)
        // })
        // .then(response => response.json())
        // .then(data => console.log('Success:', data))
        // .catch(error => console.error('Error:', error));
    }
});
