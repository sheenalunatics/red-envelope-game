/**
 * Red Envelope Game - Main Game Module
 * เกมสุ่มเปิดซองแดงอั่งเปาจีน
 */

/**
 * @typedef {Object} GameSettings
 * @property {number} envelopeCount - จำนวนซองแดง (จำนวนเต็มบวก)
 * @property {number} minPrize - เงินรางวัลต่ำสุด (จำนวนเต็มบวก)
 * @property {number} maxPrize - เงินรางวัลสูงสุด (จำนวนเต็มบวก >= minPrize)
 * @property {boolean} soundEnabled - การเปิด-ปิดเสียง
 * @property {string} playerName - ชื่อผู้เล่น (1-50 ตัวอักษร)
 */

/**
 * @typedef {Object} Envelope
 * @property {string} id - รหัสประจำซอง
 * @property {number} horseImageId - รหัสรูปม้าการ์ตูน
 * @property {boolean} isOpened - สถานะการเปิดซอง
 * @property {number} prizeAmount - จำนวนเงินรางวัล (เมื่อเปิดแล้ว)
 * @property {string} openedBy - ชื่อผู้เปิดซอง (เมื่อเปิดแล้ว)
 * @property {Object} position - ตำแหน่งการแสดงผล
 * @property {number} position.x - ตำแหน่ง x
 * @property {number} position.y - ตำแหน่ง y
 * @property {string} horseEmoji - รูปม้าการ์ตูนที่แสดง
 */

/**
 * @typedef {Object} GameState
 * @property {string} phase - 'settings' | 'playing' | 'finished'
 * @property {GameSettings|null} settings - การตั้งค่าปัจจุบัน
 * @property {Envelope[]} envelopes - รายการซองแดงทั้งหมด
 * @property {number} totalPrize - เงินรางวัลรวม
 * @property {number} openedCount - จำนวนซองที่เปิดแล้ว
 * @property {boolean} isAnimating - สถานะการเล่น animation
 * @property {string} playerName - ชื่อผู้เล่นปัจจุบัน
 */

/**
 * @typedef {Object} AudioAssets
 * @property {string} openEnvelopeSound - ไฟล์เสียงการเปิดซอง
 * @property {string} specialPrizeSound - ไฟล์เสียงรางวัลพิเศษ
 * @property {string} gameEndSound - ไฟล์เสียงจบเกม
 * @property {string} backgroundMusic - เพลงประกอบ (optional)
 */

/**
 * Data Model Validation Functions
 */
const DataModelValidator = {
    /**
     * Validate GameSettings object
     * @param {GameSettings} settings - settings object to validate
     * @returns {Object} validation result
     */
    validateGameSettings(settings) {
        const errors = [];
        
        if (!settings || typeof settings !== 'object') {
            errors.push('Settings must be an object');
            return { isValid: false, errors };
        }
        
        // Validate envelopeCount
        if (!Number.isInteger(settings.envelopeCount) || settings.envelopeCount <= 0) {
            errors.push('envelopeCount must be a positive integer');
        }
        
        // Validate minPrize
        if (!Number.isInteger(settings.minPrize) || settings.minPrize <= 0) {
            errors.push('minPrize must be a positive integer');
        }
        
        // Validate maxPrize
        if (!Number.isInteger(settings.maxPrize) || settings.maxPrize <= 0) {
            errors.push('maxPrize must be a positive integer');
        }
        
        // Validate prize range
        if (settings.minPrize > settings.maxPrize) {
            errors.push('minPrize must be less than or equal to maxPrize');
        }
        
        // Validate soundEnabled
        if (typeof settings.soundEnabled !== 'boolean') {
            errors.push('soundEnabled must be a boolean');
        }
        
        // Validate playerName
        if (typeof settings.playerName !== 'string') {
            errors.push('playerName must be a string');
        } else {
            const trimmed = settings.playerName.trim();
            if (trimmed.length === 0) {
                errors.push('playerName cannot be empty');
            } else if (trimmed.length > 50) {
                errors.push('playerName must be 50 characters or less');
            } else if (/[<>:"/\\|?*\x00-\x1f,]/.test(trimmed)) {
                errors.push('playerName contains invalid characters');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate Envelope object
     * @param {Envelope} envelope - envelope object to validate
     * @returns {Object} validation result
     */
    validateEnvelope(envelope) {
        const errors = [];
        
        if (!envelope || typeof envelope !== 'object') {
            errors.push('Envelope must be an object');
            return { isValid: false, errors };
        }
        
        // Validate id
        if (typeof envelope.id !== 'string' || envelope.id.length === 0) {
            errors.push('id must be a non-empty string');
        }
        
        // Validate horseImageId
        if (!Number.isInteger(envelope.horseImageId) || envelope.horseImageId < 0) {
            errors.push('horseImageId must be a non-negative integer');
        }
        
        // Validate isOpened
        if (typeof envelope.isOpened !== 'boolean') {
            errors.push('isOpened must be a boolean');
        }
        
        // Validate prizeAmount
        if (!Number.isInteger(envelope.prizeAmount) || envelope.prizeAmount < 0) {
            errors.push('prizeAmount must be a non-negative integer');
        }
        
        // Validate position
        if (!envelope.position || typeof envelope.position !== 'object') {
            errors.push('position must be an object');
        } else {
            if (!Number.isFinite(envelope.position.x)) {
                errors.push('position.x must be a number');
            }
            if (!Number.isFinite(envelope.position.y)) {
                errors.push('position.y must be a number');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate GameState object
     * @param {GameState} gameState - game state object to validate
     * @returns {Object} validation result
     */
    validateGameState(gameState) {
        const errors = [];
        
        if (!gameState || typeof gameState !== 'object') {
            errors.push('GameState must be an object');
            return { isValid: false, errors };
        }
        
        // Validate phase
        const validPhases = ['settings', 'playing', 'finished'];
        if (!validPhases.includes(gameState.phase)) {
            errors.push('phase must be one of: settings, playing, finished');
        }
        
        // Validate settings (can be null)
        if (gameState.settings !== null) {
            const settingsValidation = this.validateGameSettings(gameState.settings);
            if (!settingsValidation.isValid) {
                errors.push(...settingsValidation.errors.map(err => `settings.${err}`));
            }
        }
        
        // Validate envelopes
        if (!Array.isArray(gameState.envelopes)) {
            errors.push('envelopes must be an array');
        } else {
            gameState.envelopes.forEach((envelope, index) => {
                const envelopeValidation = this.validateEnvelope(envelope);
                if (!envelopeValidation.isValid) {
                    errors.push(...envelopeValidation.errors.map(err => `envelopes[${index}].${err}`));
                }
            });
        }
        
        // Validate totalPrize
        if (!Number.isInteger(gameState.totalPrize) || gameState.totalPrize < 0) {
            errors.push('totalPrize must be a non-negative integer');
        }
        
        // Validate openedCount
        if (!Number.isInteger(gameState.openedCount) || gameState.openedCount < 0) {
            errors.push('openedCount must be a non-negative integer');
        }
        
        // Validate isAnimating
        if (typeof gameState.isAnimating !== 'boolean') {
            errors.push('isAnimating must be a boolean');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate AudioAssets object
     * @param {AudioAssets} audioAssets - audio assets object to validate
     * @returns {Object} validation result
     */
    validateAudioAssets(audioAssets) {
        const errors = [];
        
        if (!audioAssets || typeof audioAssets !== 'object') {
            errors.push('AudioAssets must be an object');
            return { isValid: false, errors };
        }
        
        // Validate required sound files
        const requiredSounds = ['openEnvelopeSound', 'specialPrizeSound', 'gameEndSound'];
        requiredSounds.forEach(soundKey => {
            if (typeof audioAssets[soundKey] !== 'string' || audioAssets[soundKey].length === 0) {
                errors.push(`${soundKey} must be a non-empty string`);
            }
        });
        
        // Validate optional backgroundMusic
        if (audioAssets.backgroundMusic !== undefined && 
            (typeof audioAssets.backgroundMusic !== 'string' || audioAssets.backgroundMusic.length === 0)) {
            errors.push('backgroundMusic must be a non-empty string if provided');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};

// Game State Management
const GameState = {
    phase: 'settings', // 'settings' | 'playing' | 'finished'
    settings: null,
    envelopes: [],
    totalPrize: 0,
    openedCount: 0,
    isAnimating: false,
    playerName: ''
};

// Horse cartoon emojis for envelopes
const HORSE_CARTOONS = ['🐴', '🐎', '🦄', '🎠', '🐵', '🦓', '🐆', '🐅', '🦁', '🐯'];

/**
 * Settings Manager
 * จัดการและตรวจสอบการตั้งค่าเกม
 */
const SettingsManager = {
    /**
     * Validate game settings including player name
     * @param {number} envelopeCount - จำนวนซองแดง
     * @param {number} minPrize - เงินรางวัลต่ำสุด
     * @param {number} maxPrize - เงินรางวัลสูงสุด
     * @param {string} playerName - ชื่อผู้เล่น (optional)
     * @returns {Object} validation result
     */
    validateSettings(envelopeCount, minPrize, maxPrize, playerName = null) {
        const errors = [];
        
        // Validate envelope count
        if (!Number.isInteger(envelopeCount) || envelopeCount <= 0) {
            errors.push('กรุณากรอกจำนวนซองเป็นจำนวนเต็มบวก');
        }
        
        // Validate prize range
        if (!Number.isInteger(minPrize) || minPrize <= 0) {
            errors.push('กรุณากรอกเงินรางวัลต่ำสุดเป็นจำนวนเต็มบวก');
        }
        
        if (!Number.isInteger(maxPrize) || maxPrize <= 0) {
            errors.push('กรุณากรอกเงินรางวัลสูงสุดเป็นจำนวนเต็มบวก');
        }
        
        if (minPrize > maxPrize) {
            errors.push('กรุณากรอกช่วงเงินรางวัลที่ถูกต้อง (ค่าต่ำสุด ≤ ค่าสูงสุด)');
        }
        
        // Validate player name if provided
        if (playerName !== null) {
            const nameValidation = DataManager.validatePlayerName(playerName);
            if (!nameValidation.isValid) {
                errors.push(nameValidation.error);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate complete game settings object
     * @param {Object} settings - การตั้งค่าเกมทั้งหมด
     * @returns {Object} validation result
     */
    validateCompleteSettings(settings) {
        if (!settings || typeof settings !== 'object') {
            return {
                isValid: false,
                errors: ['การตั้งค่าไม่ถูกต้อง']
            };
        }

        return this.validateSettings(
            settings.envelopeCount,
            settings.minPrize,
            settings.maxPrize,
            settings.playerName
        );
    },

    /**
     * Get default game settings
     * @returns {Object} default settings
     */
    getDefaultSettings() {
        return {
            envelopeCount: 10,
            minPrize: 10,
            maxPrize: 100,
            soundEnabled: true,
            playerName: ''
        };
    }
};

/**
 * Envelope Generator
 * สร้างและจัดการซองแดงพร้อมรูปม้าการ์ตูน
 */
const EnvelopeGenerator = {
    /**
     * Generate envelopes for the game
     * @param {number} count - จำนวนซองที่ต้องการสร้าง
     * @returns {Array} array of envelope objects
     */
    generateEnvelopes(count) {
        const envelopes = [];
        
        for (let i = 0; i < count; i++) {
            envelopes.push({
                id: `envelope-${i}`,
                horseImageId: i % HORSE_CARTOONS.length,
                isOpened: false,
                prizeAmount: 0,
                openedBy: null,
                position: { x: 0, y: 0 }
            });
        }
        
        return this.assignHorseImages(envelopes);
    },

    /**
     * Assign unique horse cartoon images to envelopes
     * @param {Array} envelopes - array of envelope objects
     * @returns {Array} envelopes with assigned horse images
     */
    assignHorseImages(envelopes) {
        // Create a unique set of horse cartoons and shuffle them
        const uniqueHorses = [...new Set(HORSE_CARTOONS)];
        const shuffledHorses = [...uniqueHorses].sort(() => Math.random() - 0.5);
        
        return envelopes.map((envelope, index) => ({
            ...envelope,
            horseImageId: index % shuffledHorses.length,
            horseEmoji: shuffledHorses[index % shuffledHorses.length]
        }));
    },

    /**
     * Get envelope by ID
     * @param {string} id - envelope ID
     * @returns {Object|null} envelope object or null if not found
     */
    getEnvelopeById(id) {
        return GameState.envelopes.find(envelope => envelope.id === id) || null;
    }
};

/**
 * Prize Calculator
 * คำนวณเงินรางวัลแบบสุ่มภายในช่วงที่กำหนด
 */
const PrizeCalculator = {
    /**
     * Calculate random prize amount within range
     * @param {number} minAmount - minimum prize amount
     * @param {number} maxAmount - maximum prize amount
     * @returns {number} random prize amount
     */
    calculateRandomPrize(minAmount, maxAmount) {
        if (!this.validatePrizeRange(minAmount, maxAmount)) {
            throw new Error('Invalid prize range');
        }
        
        return Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
    },

    /**
     * Validate prize range
     * @param {number} min - minimum amount
     * @param {number} max - maximum amount
     * @returns {boolean} true if valid range
     */
    validatePrizeRange(min, max) {
        return Number.isInteger(min) && Number.isInteger(max) && 
               min > 0 && max > 0 && min <= max;
    }
};

/**
 * UI Manager
 * จัดการการแสดงผลและการโต้ตอบกับผู้ใช้
 */
const UIManager = {
    /**
     * Show settings screen with enhanced UI and validation
     */
    renderSettingsScreen() {
        this.hideAllScreens();
        document.getElementById('settings-screen').classList.remove('hidden');
        GameState.phase = 'settings';
        
        // Load default values if no current settings
        this.loadDefaultSettingsValues();
        
        // Clear any previous error messages
        this.clearError();
        
        // Focus on first input field for better UX
        const firstInput = document.getElementById('envelope-count');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    },

    /**
     * Load default settings values into form fields
     */
    loadDefaultSettingsValues() {
        const defaults = SettingsManager.getDefaultSettings();
        
        // Only set defaults if fields are empty
        const playerNameInput = document.getElementById('player-name');
        const envelopeCountInput = document.getElementById('envelope-count');
        const minPrizeInput = document.getElementById('min-prize');
        const maxPrizeInput = document.getElementById('max-prize');
        
        if (playerNameInput && !playerNameInput.value) {
            playerNameInput.value = defaults.playerName;
        }
        
        if (envelopeCountInput && !envelopeCountInput.value) {
            envelopeCountInput.value = defaults.envelopeCount;
        }
        
        if (minPrizeInput && !minPrizeInput.value) {
            minPrizeInput.value = defaults.minPrize;
        }
        
        if (maxPrizeInput && !maxPrizeInput.value) {
            maxPrizeInput.value = defaults.maxPrize;
        }
    },

    /**
     * Validate settings form in real-time
     * @returns {Object} validation result with detailed field errors
     */
    validateSettingsForm() {
        const playerName = document.getElementById('player-name').value.trim();
        const envelopeCount = parseInt(document.getElementById('envelope-count').value);
        const minPrize = parseInt(document.getElementById('min-prize').value);
        const maxPrize = parseInt(document.getElementById('max-prize').value);
        
        const fieldErrors = {};
        let hasErrors = false;
        
        // Check player name
        if (!playerName) {
            fieldErrors.playerName = 'กรุณากรอกชื่อผู้เล่น';
            hasErrors = true;
        } else {
            const nameValidation = DataManager.validatePlayerName(playerName);
            if (!nameValidation.isValid) {
                fieldErrors.playerName = nameValidation.error;
                hasErrors = true;
            }
        }
        
        // Check for empty fields
        if (!document.getElementById('envelope-count').value.trim()) {
            fieldErrors.envelopeCount = 'กรุณากรอกจำนวนซอง';
            hasErrors = true;
        } else if (!Number.isInteger(envelopeCount) || envelopeCount <= 0) {
            fieldErrors.envelopeCount = 'จำนวนซองต้องเป็นจำนวนเต็มบวก';
            hasErrors = true;
        }
        
        if (!document.getElementById('min-prize').value.trim()) {
            fieldErrors.minPrize = 'กรุณากรอกเงินรางวัลต่ำสุด';
            hasErrors = true;
        } else if (!Number.isInteger(minPrize) || minPrize <= 0) {
            fieldErrors.minPrize = 'เงินรางวัลต่ำสุดต้องเป็นจำนวนเต็มบวก';
            hasErrors = true;
        }
        
        if (!document.getElementById('max-prize').value.trim()) {
            fieldErrors.maxPrize = 'กรุณากรอกเงินรางวัลสูงสุด';
            hasErrors = true;
        } else if (!Number.isInteger(maxPrize) || maxPrize <= 0) {
            fieldErrors.maxPrize = 'เงินรางวัลสูงสุดต้องเป็นจำนวนเต็มบวก';
            hasErrors = true;
        }
        
        // Check prize range relationship
        if (!hasErrors && minPrize > maxPrize) {
            fieldErrors.prizeRange = 'เงินรางวัลต่ำสุดต้องน้อยกว่าหรือเท่ากับเงินรางวัลสูงสุด';
            hasErrors = true;
        }
        
        return {
            isValid: !hasErrors,
            fieldErrors: fieldErrors,
            values: { playerName, envelopeCount, minPrize, maxPrize }
        };
    },

    /**
     * Display field-specific error messages
     * @param {Object} fieldErrors - object containing field-specific errors
     */
    displayFieldErrors(fieldErrors) {
        // Clear previous field errors
        this.clearFieldErrors();
        
        // Display new field errors
        Object.keys(fieldErrors).forEach(fieldName => {
            const errorMessage = fieldErrors[fieldName];
            let inputElement;
            
            switch (fieldName) {
                case 'playerName':
                    inputElement = document.getElementById('player-name');
                    break;
                case 'envelopeCount':
                    inputElement = document.getElementById('envelope-count');
                    break;
                case 'minPrize':
                    inputElement = document.getElementById('min-prize');
                    break;
                case 'maxPrize':
                    inputElement = document.getElementById('max-prize');
                    break;
                case 'prizeRange':
                    // For range errors, highlight both prize fields
                    document.getElementById('min-prize').classList.add('error');
                    document.getElementById('max-prize').classList.add('error');
                    this.showError(errorMessage);
                    return;
            }
            
            if (inputElement) {
                inputElement.classList.add('error');
                // Create or update field-specific error message
                this.showFieldError(inputElement, errorMessage);
            }
        });
    },

    /**
     * Show field-specific error message
     * @param {HTMLElement} inputElement - input element to show error for
     * @param {string} message - error message
     */
    showFieldError(inputElement, message) {
        // Remove existing field error
        const existingError = inputElement.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create new field error element
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        // Insert after the input element
        inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
    },

    /**
     * Clear all field-specific errors
     */
    clearFieldErrors() {
        // Remove error classes from inputs
        document.querySelectorAll('input.error').forEach(input => {
            input.classList.remove('error');
        });
        
        // Remove field error messages
        document.querySelectorAll('.field-error').forEach(error => {
            error.remove();
        });
        
        // Clear main error message
        this.clearError();
    },

    /**
     * Show game screen with envelopes
     * @param {Array} envelopes - array of envelope objects
     */
    renderGameScreen(envelopes) {
        this.hideAllScreens();
        document.getElementById('game-screen').classList.remove('hidden');
        this.updateEnvelopeDisplay(envelopes);
        this.updateGameStats();
        GameState.phase = 'playing';
    },

    /**
     * Update envelope display
     * @param {Array} envelopes - array of envelope objects
     */
    updateEnvelopeDisplay(envelopes) {
        const container = document.getElementById('envelopes-container');
        container.innerHTML = '';

        envelopes.forEach(envelope => {
            const envelopeElement = this.createEnvelopeElement(envelope);
            container.appendChild(envelopeElement);
        });
    },

    /**
     * Create envelope DOM element
     * @param {Object} envelope - envelope object
     * @returns {HTMLElement} envelope DOM element
     */
    createEnvelopeElement(envelope) {
        const div = document.createElement('div');
        div.className = `envelope ${envelope.isOpened ? 'opened' : 'closed'}`;
        div.id = envelope.id;
        div.setAttribute('data-envelope-id', envelope.id);

        if (envelope.isOpened) {
            div.innerHTML = `
                <div class="prize-amount">${envelope.prizeAmount} บาท</div>
                <div class="opener-name">${envelope.openedBy || ''}</div>
            `;
        } else {
            div.innerHTML = `
                <div class="horse-image">${envelope.horseEmoji}</div>
            `;
        }

        // Add click event listener
        div.addEventListener('click', () => {
            if (!envelope.isOpened && !GameState.isAnimating) {
                GameController.openEnvelope(envelope.id);
            }
        });

        return div;
    },

    /**
     * Update game statistics display with real-time information
     */
    updateGameStats() {
        // Get current game statistics
        const stats = GameController.getGameStatistics();
        
        // Update total prize display
        const totalPrizeElement = document.getElementById('total-prize');
        if (totalPrizeElement) {
            totalPrizeElement.innerHTML = `💰 เงินรวม: ${stats.totalPrize.toLocaleString()} บาท`;
        }
        
        // Update envelope count statistics
        const envelopeStatsElement = document.getElementById('envelope-stats');
        if (envelopeStatsElement) {
            envelopeStatsElement.innerHTML = 
                `📦 เปิดแล้ว: ${stats.openedCount} / ${stats.totalEnvelopes}`;
        }
        
        // Update remaining envelopes count
        const remainingStatsElement = document.getElementById('remaining-stats');
        if (remainingStatsElement) {
            remainingStatsElement.innerHTML = `⏳ เหลือ: ${stats.remainingCount} ซอง`;
        }
        
        // Update progress bar
        this.updateProgressBar(stats);
        
        // Update average prize (if any envelopes opened)
        const avgPrizeElement = document.getElementById('current-average');
        if (avgPrizeElement && stats.openedCount > 0) {
            avgPrizeElement.textContent = `เฉลี่ย: ${Math.round(stats.averagePrize).toLocaleString()} บาท`;
        }
    },

    /**
     * Update progress bar display
     * @param {Object} stats - game statistics
     */
    updateProgressBar(stats) {
        // Safely handle DOM elements that may not exist (e.g., in test environment)
        try {
            const progressContainer = document.getElementById('game-progress');
            const progressFill = document.getElementById('progress-fill');
            const progressText = document.getElementById('progress-text');
            
            if (stats.totalEnvelopes > 0) {
                const percentage = Math.round((stats.openedCount / stats.totalEnvelopes) * 100);
                
                if (progressContainer) {
                    progressContainer.classList.remove('hidden');
                }
                
                if (progressFill && progressFill.style) {
                    progressFill.style.width = `${percentage}%`;
                }
                
                if (progressText) {
                    progressText.textContent = `${percentage}%`;
                }
            } else {
                if (progressContainer) {
                    progressContainer.classList.add('hidden');
                }
            }
        } catch (error) {
            // Silently handle DOM errors in test environment
            console.warn('Progress bar update failed (likely in test environment):', error.message);
        }
    },

    /**
     * Show detailed real-time statistics during game
     */
    showDetailedStats() {
        const stats = GameController.getGameStatistics();
        
        // Create or update detailed stats display
        let detailedStatsElement = document.getElementById('detailed-stats');
        if (!detailedStatsElement) {
            detailedStatsElement = document.createElement('div');
            detailedStatsElement.id = 'detailed-stats';
            detailedStatsElement.className = 'detailed-stats';
            
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) {
                gameScreen.appendChild(detailedStatsElement);
            }
        }
        
        // Update detailed statistics content
        detailedStatsElement.innerHTML = `
            <div class="stats-row">
                <span>ซองทั้งหมด: ${stats.totalEnvelopes}</span>
                <span>เปิดแล้ว: ${stats.openedCount}</span>
                <span>เหลือ: ${stats.remainingCount}</span>
            </div>
            <div class="stats-row">
                <span>เงินรวม: ${stats.totalPrize} บาท</span>
                ${stats.openedCount > 0 ? `<span>เฉลี่ย: ${Math.round(stats.averagePrize)} บาท</span>` : ''}
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${stats.totalEnvelopes > 0 ? (stats.openedCount / stats.totalEnvelopes) * 100 : 0}%"></div>
            </div>
        `;
    },

    /**
     * Hide detailed statistics display
     */
    hideDetailedStats() {
        const detailedStatsElement = document.getElementById('detailed-stats');
        if (detailedStatsElement) {
            detailedStatsElement.remove();
        }
    },

    /**
     * Show game summary screen with detailed statistics
     * @param {number} totalPrize - total prize amount
     */
    showGameSummary(totalPrize) {
        this.hideAllScreens();
        document.getElementById('game-end-screen').classList.remove('hidden');
        
        // Get detailed game statistics
        const stats = GameController.getGameStatistics();
        
        // Save game result to file
        if (GameState.playerName && GameState.settings) {
            const success = DataManager.saveGameResult(
                GameState.playerName,
                totalPrize,
                new Date(),
                GameState.settings
            );
            
            if (success) {
                console.log('Game result saved successfully');
            } else {
                console.warn('Failed to save game result');
            }
        }
        
        // Update summary display with comprehensive statistics
        const finalTotalElement = document.getElementById('final-total');
        if (finalTotalElement) {
            finalTotalElement.textContent = `${totalPrize.toLocaleString()} บาท`;
        }
        
        const finalEnvelopeCountElement = document.getElementById('final-envelope-count');
        if (finalEnvelopeCountElement) {
            finalEnvelopeCountElement.textContent = `${stats.openedCount} ซอง`;
        }
        
        // Add additional statistics if elements exist
        const avgPrizeElement = document.getElementById('average-prize');
        if (avgPrizeElement) {
            avgPrizeElement.textContent = `${Math.round(stats.averagePrize).toLocaleString()} บาท`;
        }
        
        const completionElement = document.getElementById('completion-status');
        if (completionElement) {
            completionElement.textContent = stats.isGameComplete ? 'เกมเสร็จสมบูรณ์!' : 'เกมยังไม่เสร็จ';
        }
        
        // Show completion message with encouragement
        this.showCompletionMessage(stats);
        
        // Display list of who opened each envelope
        this.displayEnvelopeList();
        
        // Ensure restart buttons are visible and enabled
        this.enableRestartButtons();
        
        // Add celebration animation to stat cards
        this.animateStatCards();
        
        GameState.phase = 'finished';
    },

    /**
     * Display list of who opened each envelope
     */
    displayEnvelopeList() {
        const listContainer = document.getElementById('envelope-list');
        if (!listContainer) return;

        const openedEnvelopes = GameState.envelopes.filter(env => env.isOpened);
        
        if (openedEnvelopes.length === 0) {
            listContainer.innerHTML = '<p>ยังไม่มีซองที่เปิด</p>';
            return;
        }

        // Sort by envelope ID to maintain order
        openedEnvelopes.sort((a, b) => {
            const aNum = parseInt(a.id.split('-')[1]);
            const bNum = parseInt(b.id.split('-')[1]);
            return aNum - bNum;
        });

        let html = '<div class="envelope-list-items">';
        openedEnvelopes.forEach((envelope, index) => {
            html += `
                <div class="envelope-list-item">
                    <span class="envelope-number">${index + 1}.</span>
                    <span class="opener-name-list">${envelope.openedBy || 'ไม่ระบุชื่อ'}</span>
                    <span class="prize-amount-list">${envelope.prizeAmount.toLocaleString()} บาท</span>
                </div>
            `;
        });
        html += '</div>';

        listContainer.innerHTML = html;
    },

    /**
     * Animate stat cards on game completion
     */
    animateStatCards() {
        try {
            const statCards = document.querySelectorAll('.stat-card');
            if (statCards.length > 0) {
                statCards.forEach((card, index) => {
                    setTimeout(() => {
                        if (card && card.style) {
                            card.style.animation = 'slideInFromTop 0.5s ease forwards';
                            card.style.animationDelay = `${index * 0.1}s`;
                        }
                    }, 100);
                });
            }
        } catch (error) {
            // Silently handle DOM errors in test environment
            console.warn('Stat card animation failed (likely in test environment):', error.message);
        }
    },

    /**
     * Show completion message based on game performance
     * @param {Object} stats - game statistics
     */
    showCompletionMessage(stats) {
        const messageElement = document.getElementById('completion-message');
        if (!messageElement) return;
        
        let message = '';
        const avgPrize = Math.round(stats.averagePrize);
        
        // Generate encouraging message based on performance
        if (stats.totalPrize >= stats.totalEnvelopes * 50) {
            message = `🎉 ยอดเยี่ยม! คุณได้เงินรางวัลเฉลี่ย ${avgPrize} บาทต่อซอง`;
        } else if (stats.totalPrize >= stats.totalEnvelopes * 30) {
            message = `👏 ดีมาก! เงินรางวัลเฉลี่ย ${avgPrize} บาทต่อซอง`;
        } else {
            message = `🎊 เสร็จสิ้น! เงินรางวัลเฉลี่ย ${avgPrize} บาทต่อซอง`;
        }
        
        messageElement.textContent = message;
    },

    /**
     * Enable restart buttons after game completion
     */
    enableRestartButtons() {
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.disabled = false;
            playAgainBtn.style.display = 'block';
        }
        
        // Add quick restart option with same settings
        this.addQuickRestartOption();
    },

    /**
     * Add quick restart option to game end screen
     */
    addQuickRestartOption() {
        const gameEndScreen = document.getElementById('game-end-screen');
        if (!gameEndScreen) return;
        
        // Check if quick restart button already exists
        let quickRestartBtn = document.getElementById('quick-restart-btn');
        if (!quickRestartBtn) {
            quickRestartBtn = document.createElement('button');
            quickRestartBtn.id = 'quick-restart-btn';
            quickRestartBtn.className = 'secondary-btn';
            quickRestartBtn.textContent = 'เล่นอีกครั้งด้วยการตั้งค่าเดิม';
            
            // Insert before play again button
            const playAgainBtn = document.getElementById('play-again-btn');
            if (playAgainBtn && playAgainBtn.parentNode) {
                playAgainBtn.parentNode.insertBefore(quickRestartBtn, playAgainBtn);
            }
            
            // Add event listener
            quickRestartBtn.addEventListener('click', function() {
                GameController.startNewGameWithSameSettings();
            });
        }
        
        quickRestartBtn.disabled = false;
        quickRestartBtn.style.display = 'block';
    },

    /**
     * Hide all screens
     */
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
    },

    /**
     * Show error message
     * @param {string} message - error message to display
     */
    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
    },

    /**
     * Clear error message
     */
    clearError() {
        document.getElementById('error-message').textContent = '';
    }
};

/**
 * Audio Manager
 * จัดการเสียง effects และการควบคุมเสียง
 */
const AudioManager = {
    // Audio context and assets
    audioContext: null,
    audioAssets: {
        openEnvelopeSound: null,
        specialPrizeSound: null,
        gameEndSound: null,
        backgroundMusic: null
    },
    audioFiles: {
        openEnvelopeSound: 'assets/sounds/envelope-open.mp3',
        specialPrizeSound: 'assets/sounds/special-prize.mp3',
        gameEndSound: 'assets/sounds/game-end.mp3',
        backgroundMusic: 'assets/sounds/background.mp3'
    },
    isAudioEnabled: true,
    isAudioLoaded: false,
    loadingPromises: new Map(),

    /**
     * Preload audio files
     * @returns {Promise} Promise that resolves when all audio files are loaded
     */
    async preloadAudioFiles() {
        try {
            // Initialize Web Audio API context
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Try to load actual audio files first, fallback to synthetic sounds
            const loadPromises = [];
            
            for (const [key, filePath] of Object.entries(this.audioFiles)) {
                if (key !== 'backgroundMusic') { // Skip background music for now
                    loadPromises.push(this.loadAudioFile(key, filePath));
                }
            }

            await Promise.allSettled(loadPromises);
            
            // If no real audio files were loaded, create synthetic sounds as fallback
            if (!this.audioAssets.openEnvelopeSound) {
                console.log('Creating fallback synthetic audio...');
                this.audioAssets.openEnvelopeSound = await this.createEnvelopeOpenSound();
            }
            if (!this.audioAssets.specialPrizeSound) {
                this.audioAssets.specialPrizeSound = await this.createSpecialPrizeSound();
            }
            if (!this.audioAssets.gameEndSound) {
                this.audioAssets.gameEndSound = await this.createGameEndSound();
            }
            
            this.isAudioLoaded = true;
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.warn('Failed to preload audio files:', error);
            this.isAudioLoaded = false;
        }
    },

    /**
     * Load audio file from URL
     * @param {string} key - Asset key
     * @param {string} filePath - Path to audio file
     * @returns {Promise<void>}
     */
    async loadAudioFile(key, filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${filePath}: ${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioAssets[key] = audioBuffer;
            console.log(`Loaded audio file: ${filePath}`);
        } catch (error) {
            console.warn(`Failed to load audio file ${filePath}:`, error);
            // Don't throw, let fallback handle it
        }
    },

    /**
     * Create envelope opening sound effect
     * @returns {Promise<AudioBuffer>} Audio buffer
     */
    async createEnvelopeOpenSound() {
        if (!this.audioContext) {
            throw new Error('Audio context not initialized');
        }

        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.3;
        const frameCount = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
        const channelData = buffer.getChannelData(0);

        // Create a pleasant "pop" sound with multiple harmonics
        for (let i = 0; i < frameCount; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 8); // Quick decay
            
            // Multiple frequency components for richer sound
            const fundamental = Math.sin(2 * Math.PI * 800 * t);
            const harmonic2 = Math.sin(2 * Math.PI * 1200 * t) * 0.5;
            const harmonic3 = Math.sin(2 * Math.PI * 1600 * t) * 0.25;
            
            channelData[i] = (fundamental + harmonic2 + harmonic3) * envelope * 0.2;
        }

        return buffer;
    },

    /**
     * Create special prize sound effect
     * @returns {Promise<AudioBuffer>} Audio buffer
     */
    async createSpecialPrizeSound() {
        if (!this.audioContext) {
            throw new Error('Audio context not initialized');
        }

        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.8;
        const frameCount = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
        const channelData = buffer.getChannelData(0);

        // Create a celebratory ascending tone sequence
        for (let i = 0; i < frameCount; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            // Ascending frequency sweep
            const frequency = 600 + (progress * 800); // 600Hz to 1400Hz
            const envelope = Math.sin(Math.PI * progress) * Math.exp(-t * 2);
            
            // Add some sparkle with higher harmonics
            const main = Math.sin(2 * Math.PI * frequency * t);
            const sparkle = Math.sin(2 * Math.PI * frequency * 2 * t) * 0.3;
            
            channelData[i] = (main + sparkle) * envelope * 0.25;
        }

        return buffer;
    },

    /**
     * Create game end sound effect
     * @returns {Promise<AudioBuffer>} Audio buffer
     */
    async createGameEndSound() {
        if (!this.audioContext) {
            throw new Error('Audio context not initialized');
        }

        const sampleRate = this.audioContext.sampleRate;
        const duration = 1.2;
        const frameCount = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
        const channelData = buffer.getChannelData(0);

        // Create a triumphant chord progression
        for (let i = 0; i < frameCount; i++) {
            const t = i / sampleRate;
            const envelope = Math.max(0, 1 - (t / duration)) * 0.8;
            
            // Chord: C major (C-E-G)
            const c = Math.sin(2 * Math.PI * 523.25 * t); // C5
            const e = Math.sin(2 * Math.PI * 659.25 * t); // E5
            const g = Math.sin(2 * Math.PI * 783.99 * t); // G5
            
            // Add some rhythm
            const rhythmMod = Math.sin(2 * Math.PI * 4 * t) * 0.3 + 0.7;
            
            channelData[i] = (c + e * 0.8 + g * 0.6) * envelope * rhythmMod * 0.15;
        }

        return buffer;
    },

    /**
     * Play audio buffer
     * @param {AudioBuffer} audioBuffer - Audio buffer to play
     */
    playAudioBuffer(audioBuffer) {
        if (!this.isAudioEnabled || !this.isAudioLoaded || !audioBuffer || !this.audioContext) {
            return;
        }

        try {
            // Resume audio context if it's suspended (browser autoplay policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start();
        } catch (error) {
            console.warn('Failed to play audio:', error);
        }
    },

    /**
     * Play envelope opening sound effect
     */
    playOpenEnvelopeSound() {
        this.playAudioBuffer(this.audioAssets.openEnvelopeSound);
    },

    /**
     * Play special prize sound effect for high prizes
     * @param {number} prizeAmount - Prize amount to determine if special sound should play
     */
    playSpecialPrizeSound(prizeAmount) {
        // Play special sound for prizes in the top 25% of the range
        if (GameState.settings) {
            const prizeRange = GameState.settings.maxPrize - GameState.settings.minPrize;
            const threshold = GameState.settings.minPrize + (prizeRange * 0.75);
            
            if (prizeAmount >= threshold) {
                this.playAudioBuffer(this.audioAssets.specialPrizeSound);
                return true; // Indicates special sound was played
            }
        }
        return false; // Indicates normal sound should be played
    },

    /**
     * Play game end sound effect
     */
    playGameEndSound() {
        this.playAudioBuffer(this.audioAssets.gameEndSound);
    },

    /**
     * Toggle sound on/off
     * @param {boolean} enabled - Whether sound should be enabled
     */
    toggleSound(enabled) {
        if (typeof enabled === 'boolean') {
            this.isAudioEnabled = enabled;
        } else {
            this.isAudioEnabled = !this.isAudioEnabled;
        }

        // Update game settings if they exist
        if (GameState.settings) {
            GameState.settings.soundEnabled = this.isAudioEnabled;
        }

        // Update UI button
        this.updateSoundToggleUI();
        
        console.log(`Audio ${this.isAudioEnabled ? 'enabled' : 'disabled'}`);
    },

    /**
     * Update sound toggle button UI
     */
    updateSoundToggleUI() {
        const soundToggleBtn = document.getElementById('sound-toggle');
        if (soundToggleBtn) {
            soundToggleBtn.textContent = this.isAudioEnabled ? '🔊' : '🔇';
            soundToggleBtn.title = this.isAudioEnabled ? 'ปิดเสียง' : 'เปิดเสียง';
        }
    },

    /**
     * Initialize audio system
     */
    async initialize() {
        try {
            // Show loading indicator
            this.showAudioLoadingStatus('กำลังโหลดเสียง...');
            
            await this.preloadAudioFiles();
            this.updateSoundToggleUI();
            
            // Show success message
            this.showAudioLoadingStatus('ระบบเสียงพร้อมใช้งาน', 'success');
            
            // Clear status after 2 seconds
            setTimeout(() => {
                this.clearAudioLoadingStatus();
            }, 2000);
        } catch (error) {
            console.warn('Failed to initialize audio system:', error);
            this.showAudioLoadingStatus('ไม่สามารถโหลดเสียงได้ (ใช้เสียงสำรอง)', 'warning');
            
            // Clear status after 3 seconds
            setTimeout(() => {
                this.clearAudioLoadingStatus();
            }, 3000);
        }
    },

    /**
     * Show audio loading status
     * @param {string} message - Status message
     * @param {string} type - Status type ('loading', 'success', 'warning', 'error')
     */
    showAudioLoadingStatus(message, type = 'loading') {
        const soundToggleBtn = document.getElementById('sound-toggle');
        if (soundToggleBtn) {
            soundToggleBtn.setAttribute('data-status', type);
            soundToggleBtn.title = message;
            
            // Add visual indicator
            if (type === 'loading') {
                soundToggleBtn.style.opacity = '0.6';
                soundToggleBtn.style.animation = 'pulse 1s infinite';
            }
        }
    },

    /**
     * Clear audio loading status
     */
    clearAudioLoadingStatus() {
        const soundToggleBtn = document.getElementById('sound-toggle');
        if (soundToggleBtn) {
            soundToggleBtn.removeAttribute('data-status');
            soundToggleBtn.style.opacity = '';
            soundToggleBtn.style.animation = '';
            this.updateSoundToggleUI(); // Reset to normal state
        }
    },

    /**
     * Handle user interaction to enable audio (browser autoplay policy)
     */
    handleUserInteraction() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(error => {
                console.warn('Failed to resume audio context:', error);
            });
        }
    },

    /**
     * Get audio system status
     * @returns {Object} Audio system status information
     */
    getAudioStatus() {
        return {
            isEnabled: this.isAudioEnabled,
            isLoaded: this.isAudioLoaded,
            contextState: this.audioContext ? this.audioContext.state : 'not-initialized',
            hasRealAudioFiles: Object.values(this.audioAssets).some(asset => 
                asset && asset.constructor.name === 'AudioBuffer'
            )
        };
    }
};

/**
 * Animation Manager
 * จัดการ visual animations และ effects
 */
const AnimationManager = {
    // Animation state tracking
    activeAnimations: new Set(),
    animationQueue: [],
    isAnimationSystemEnabled: true,

    /**
     * Play envelope opening animation
     * @param {Object} envelope - envelope object to animate
     * @returns {Promise} Promise that resolves when animation completes
     */
    playOpenEnvelopeAnimation(envelope) {
        return new Promise((resolve) => {
            if (!this.isAnimationSystemEnabled) {
                resolve();
                return;
            }

            const envelopeElement = document.getElementById(envelope.id);
            if (!envelopeElement) {
                resolve();
                return;
            }

            // Track this animation
            const animationId = `open-${envelope.id}`;
            this.activeAnimations.add(animationId);

            // Add opening animation class
            envelopeElement.classList.add('opening');

            // Animation duration matches CSS keyframe duration
            const animationDuration = 500; // 0.5s

            setTimeout(() => {
                // Remove animation class
                envelopeElement.classList.remove('opening');
                
                // Mark animation as complete
                this.activeAnimations.delete(animationId);
                
                resolve();
            }, animationDuration);
        });
    },

    /**
     * Play prize reveal animation
     * @param {number} prizeAmount - prize amount to reveal
     * @param {string} envelopeId - envelope ID for targeting animation
     * @returns {Promise} Promise that resolves when animation completes
     */
    playPrizeRevealAnimation(prizeAmount, envelopeId) {
        return new Promise((resolve) => {
            if (!this.isAnimationSystemEnabled) {
                resolve();
                return;
            }

            const envelopeElement = document.getElementById(envelopeId);
            if (!envelopeElement) {
                resolve();
                return;
            }

            // Track this animation
            const animationId = `prize-reveal-${envelopeId}`;
            this.activeAnimations.add(animationId);

            // Find the prize amount element
            const prizeElement = envelopeElement.querySelector('.prize-amount');
            if (prizeElement) {
                prizeElement.classList.add('prize-reveal');
            }

            // Animation duration matches CSS keyframe duration
            const animationDuration = 300; // 0.3s

            setTimeout(() => {
                // Remove animation class
                if (prizeElement) {
                    prizeElement.classList.remove('prize-reveal');
                }
                
                // Mark animation as complete
                this.activeAnimations.delete(animationId);
                
                resolve();
            }, animationDuration);
        });
    },

    /**
     * Play special effect animation for high prizes
     * @param {number} prizeAmount - prize amount to determine special effect
     * @param {string} envelopeId - envelope ID for targeting animation
     * @returns {Promise} Promise that resolves when animation completes
     */
    playSpecialEffectAnimation(prizeAmount, envelopeId) {
        return new Promise((resolve) => {
            if (!this.isAnimationSystemEnabled) {
                resolve();
                return;
            }

            // Determine if this qualifies for special effect
            if (!GameState.settings) {
                resolve();
                return;
            }

            const prizeRange = GameState.settings.maxPrize - GameState.settings.minPrize;
            const threshold = GameState.settings.minPrize + (prizeRange * 0.75);
            
            if (prizeAmount < threshold) {
                resolve();
                return;
            }

            const envelopeElement = document.getElementById(envelopeId);
            if (!envelopeElement) {
                resolve();
                return;
            }

            // Track this animation
            const animationId = `special-effect-${envelopeId}`;
            this.activeAnimations.add(animationId);

            // Add special effect animation class
            envelopeElement.classList.add('special-effect');

            // Create sparkle effects around the envelope
            this.createSparkleEffect(envelopeElement);

            // Animation duration matches CSS keyframe duration
            const animationDuration = 1000; // 1s

            setTimeout(() => {
                // Remove animation class
                envelopeElement.classList.remove('special-effect');
                
                // Clean up sparkle effects
                this.cleanupSparkleEffect(envelopeElement);
                
                // Mark animation as complete
                this.activeAnimations.delete(animationId);
                
                resolve();
            }, animationDuration);
        });
    },

    /**
     * Play game end animation
     * @param {number} totalPrize - total prize amount for celebration intensity
     * @returns {Promise} Promise that resolves when animation completes
     */
    playGameEndAnimation(totalPrize) {
        return new Promise((resolve) => {
            if (!this.isAnimationSystemEnabled) {
                resolve();
                return;
            }

            // Track this animation
            const animationId = 'game-end-celebration';
            this.activeAnimations.add(animationId);

            // Get game end screen element
            const gameEndScreen = document.getElementById('game-end-screen');
            if (!gameEndScreen) {
                this.activeAnimations.delete(animationId);
                resolve();
                return;
            }

            // Add celebration animation class
            gameEndScreen.classList.add('celebration-animation');

            // Create confetti effect
            this.createConfettiEffect();

            // Create pulsing effect for total prize display
            const totalPrizeElement = document.getElementById('final-total');
            if (totalPrizeElement) {
                totalPrizeElement.classList.add('prize-celebration');
            }

            // Animation duration
            const animationDuration = 2000; // 2s

            setTimeout(() => {
                // Remove animation classes
                gameEndScreen.classList.remove('celebration-animation');
                if (totalPrizeElement) {
                    totalPrizeElement.classList.remove('prize-celebration');
                }
                
                // Clean up confetti effect
                this.cleanupConfettiEffect();
                
                // Mark animation as complete
                this.activeAnimations.delete(animationId);
                
                resolve();
            }, animationDuration);
        });
    },

    /**
     * Stop all active animations
     */
    stopAllAnimations() {
        // Remove all animation classes from envelopes
        document.querySelectorAll('.envelope').forEach(envelope => {
            envelope.classList.remove('opening', 'special-effect');
        });

        // Remove animation classes from prize elements
        document.querySelectorAll('.prize-amount').forEach(prizeElement => {
            prizeElement.classList.remove('prize-reveal');
        });

        // Remove game end animation classes
        const gameEndScreen = document.getElementById('game-end-screen');
        if (gameEndScreen) {
            gameEndScreen.classList.remove('celebration-animation');
        }

        const totalPrizeElement = document.getElementById('final-total');
        if (totalPrizeElement) {
            totalPrizeElement.classList.remove('prize-celebration');
        }

        // Clean up special effects
        this.cleanupSparkleEffect();
        this.cleanupConfettiEffect();

        // Clear all active animations
        this.activeAnimations.clear();
        this.animationQueue = [];

        console.log('All animations stopped');
    },

    /**
     * Create sparkle effect around an element
     * @param {HTMLElement} targetElement - element to create sparkles around
     */
    createSparkleEffect(targetElement) {
        if (!targetElement) return;

        const sparkleContainer = document.createElement('div');
        sparkleContainer.className = 'sparkle-container';
        sparkleContainer.setAttribute('data-envelope-id', targetElement.id);

        // Create multiple sparkle elements
        for (let i = 0; i < 8; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: #ffd700;
                border-radius: 50%;
                animation: sparkle-${i} 1s ease-in-out infinite;
                animation-delay: ${i * 0.1}s;
            `;
            sparkleContainer.appendChild(sparkle);
        }

        targetElement.appendChild(sparkleContainer);
    },

    /**
     * Clean up sparkle effects
     * @param {HTMLElement} targetElement - element to clean sparkles from (optional)
     */
    cleanupSparkleEffect(targetElement = null) {
        if (targetElement) {
            const sparkleContainer = targetElement.querySelector('.sparkle-container');
            if (sparkleContainer) {
                sparkleContainer.remove();
            }
        } else {
            // Clean up all sparkle effects
            document.querySelectorAll('.sparkle-container').forEach(container => {
                container.remove();
            });
        }
    },

    /**
     * Create confetti effect for game end
     */
    createConfettiEffect() {
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        confettiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
        `;

        // Create confetti pieces
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: ${this.getRandomConfettiColor()};
                left: ${Math.random() * 100}%;
                animation: confetti-fall ${2 + Math.random() * 3}s linear infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            confettiContainer.appendChild(confetti);
        }

        document.body.appendChild(confettiContainer);
    },

    /**
     * Clean up confetti effect
     */
    cleanupConfettiEffect() {
        const confettiContainer = document.querySelector('.confetti-container');
        if (confettiContainer) {
            confettiContainer.remove();
        }
    },

    /**
     * Get random confetti color
     * @returns {string} CSS color value
     */
    getRandomConfettiColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    /**
     * Check if any animations are currently active
     * @returns {boolean} true if animations are active
     */
    hasActiveAnimations() {
        return this.activeAnimations.size > 0;
    },

    /**
     * Enable or disable animation system
     * @param {boolean} enabled - whether animations should be enabled
     */
    setAnimationEnabled(enabled) {
        this.isAnimationSystemEnabled = enabled;
        
        if (!enabled) {
            this.stopAllAnimations();
        }
        
        console.log(`Animation system ${enabled ? 'enabled' : 'disabled'}`);
    },

    /**
     * Get animation system status
     * @returns {Object} Animation system status information
     */
    getAnimationStatus() {
        return {
            isEnabled: this.isAnimationSystemEnabled,
            activeAnimationsCount: this.activeAnimations.size,
            activeAnimations: Array.from(this.activeAnimations),
            queuedAnimationsCount: this.animationQueue.length
        };
    }
};

/**
 * Name Input Manager
 * จัดการ modal สำหรับกรอกชื่อก่อนเปิดซอง
 */
const NameInputManager = {
    currentEnvelopeId: null,
    resolvePromise: null,
    rejectPromise: null,

    /**
     * Show name input modal and return promise with entered name
     * @param {string} envelopeId - ID of envelope to open
     * @returns {Promise<string>} Promise that resolves with the entered name
     */
    showNameInput(envelopeId) {
        return new Promise((resolve, reject) => {
            this.currentEnvelopeId = envelopeId;
            this.resolvePromise = resolve;
            this.rejectPromise = reject;

            const modal = document.getElementById('name-input-modal');
            const input = document.getElementById('opener-name-input');
            const errorDiv = document.getElementById('opener-name-error');
            const confirmBtn = document.getElementById('confirm-open-btn');
            const cancelBtn = document.getElementById('cancel-open-btn');

            // Clear previous values
            input.value = '';
            errorDiv.textContent = '';
            input.classList.remove('error');

            // Show modal
            modal.classList.remove('hidden');
            setTimeout(() => input.focus(), 100);

            // Handle modal background click
            const handleModalClick = (e) => {
                if (e.target === modal) {
                    handleCancel();
                }
            };

            // Handle confirm button
            const handleConfirm = () => {
                const name = input.value.trim();
                if (!name) {
                    errorDiv.textContent = 'กรุณากรอกชื่อก่อนเปิดซอง';
                    input.classList.add('error');
                    input.focus();
                    return;
                }

                if (name.length > 50) {
                    errorDiv.textContent = 'ชื่อต้องไม่เกิน 50 ตัวอักษร';
                    input.classList.add('error');
                    input.focus();
                    return;
                }

                // Clean up event listeners
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                input.removeEventListener('keypress', handleKeyPress);
                input.removeEventListener('keydown', handleKeyDown);
                modal.removeEventListener('click', handleModalClick);

                // Hide modal and resolve
                modal.classList.add('hidden');
                this.currentEnvelopeId = null;
                resolve(name);
            };

            // Handle cancel button
            const handleCancel = () => {
                // Clean up event listeners
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                input.removeEventListener('keypress', handleKeyPress);
                input.removeEventListener('keydown', handleKeyDown);
                modal.removeEventListener('click', handleModalClick);

                // Hide modal and reject
                modal.classList.add('hidden');
                this.currentEnvelopeId = null;
                reject(new Error('User cancelled'));
            };

            // Handle Enter key
            const handleKeyPress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirm();
                }
            };

            // Handle Escape key (needs keydown, not keypress)
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCancel();
                }
            };

            // Add event listeners
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            input.addEventListener('keypress', handleKeyPress);
            input.addEventListener('keydown', handleKeyDown);
            modal.addEventListener('click', handleModalClick);
        });
    }
};

/**
 * Game Controller
 * จัดการสถานะเกมหลัก และควบคุมการไหลของเกม
 */
const GameController = {
    /**
     * Initialize new game with settings
     * @param {Object} settings - game settings
     */
    initializeGame(settings) {
        // Validate settings before initialization
        const validation = SettingsManager.validateCompleteSettings(settings);
        
        if (!validation.isValid) {
            throw new Error(`Invalid settings: ${validation.errors.join(', ')}`);
        }

        GameState.settings = settings;
        GameState.playerName = settings.playerName || '';
        GameState.envelopes = EnvelopeGenerator.generateEnvelopes(settings.envelopeCount);
        GameState.totalPrize = 0;
        GameState.openedCount = 0;
        GameState.isAnimating = false;
        GameState.phase = 'playing';

        UIManager.renderGameScreen(GameState.envelopes);
    },

    /**
     * Open envelope and calculate prize
     * @param {string} envelopeId - ID of envelope to open
     */
    async openEnvelope(envelopeId) {
        const envelope = EnvelopeGenerator.getEnvelopeById(envelopeId);
        
        if (!envelope || envelope.isOpened) {
            return;
        }

        // Show name input modal and wait for user to enter name
        let openerName;
        try {
            openerName = await NameInputManager.showNameInput(envelopeId);
        } catch (error) {
            // User cancelled, don't open envelope
            return;
        }

        // Ensure audio context is ready for user interaction
        AudioManager.handleUserInteraction();

        // Set animation state
        GameState.isAnimating = true;

        // Calculate prize
        const prizeAmount = PrizeCalculator.calculateRandomPrize(
            GameState.settings.minPrize,
            GameState.settings.maxPrize
        );

        // Update envelope
        envelope.isOpened = true;
        envelope.prizeAmount = prizeAmount;
        envelope.openedBy = openerName;

        // Update game state
        GameState.openedCount++;
        
        // Update total prize using the calculation method to ensure consistency
        GameState.totalPrize = this.calculateTotalPrize();

        // Play audio effects
        const playedSpecialSound = AudioManager.playSpecialPrizeSound(prizeAmount);
        if (!playedSpecialSound) {
            AudioManager.playOpenEnvelopeSound();
        }

        // Play opening animation
        await AnimationManager.playOpenEnvelopeAnimation(envelope);

        // Update UI
        this.updateEnvelopeUI(envelope);

        // Play prize reveal animation
        await AnimationManager.playPrizeRevealAnimation(prizeAmount, envelopeId);

        // Play special effect animation for high prizes
        if (playedSpecialSound) {
            await AnimationManager.playSpecialEffectAnimation(prizeAmount, envelopeId);
        }

        UIManager.updateGameStats();
        UIManager.showDetailedStats();

        // Check if game is finished
        if (GameState.openedCount === GameState.envelopes.length) {
            setTimeout(async () => {
                // Mark game as finished
                GameState.phase = 'finished';
                
                // Play game end audio and show summary
                AudioManager.playGameEndSound();
                UIManager.showGameSummary(GameState.totalPrize);
                
                // Play celebration animation
                await AnimationManager.playGameEndAnimation(GameState.totalPrize);
                
                // Enable restart functionality
                this.enableRestartOptions();
            }, 600); // Slightly longer delay for game end
        }

        // Reset animation state
        GameState.isAnimating = false;
    },

    /**
     * Update envelope UI after opening
     * @param {Object} envelope - opened envelope object
     */
    updateEnvelopeUI(envelope) {
        const envelopeElement = document.getElementById(envelope.id);
        if (envelopeElement) {
            envelopeElement.classList.remove('closed');
            envelopeElement.classList.add('opened');
            
            // Update content to show prize amount and opener name
            envelopeElement.innerHTML = `
                <div class="prize-amount">${envelope.prizeAmount} บาท</div>
                <div class="opener-name">${envelope.openedBy || ''}</div>
            `;
        }
    },

    /**
     * Reset game to initial state
     */
    resetGame() {
        // Stop all animations before resetting
        AnimationManager.stopAllAnimations();
        
        // Reset all game state properties
        GameState.phase = 'settings';
        GameState.settings = null;
        GameState.envelopes = [];
        GameState.totalPrize = 0;
        GameState.openedCount = 0;
        GameState.isAnimating = false;
        GameState.playerName = '';

        // Reset UI to settings screen
        UIManager.renderSettingsScreen();
        UIManager.clearError();
    },

    /**
     * Get current game state
     * @returns {Object} current game state (deep copy)
     */
    getGameState() {
        return {
            phase: GameState.phase,
            settings: GameState.settings ? { ...GameState.settings } : null,
            envelopes: GameState.envelopes.map(envelope => ({ ...envelope })),
            totalPrize: GameState.totalPrize,
            openedCount: GameState.openedCount,
            isAnimating: GameState.isAnimating,
            playerName: GameState.playerName
        };
    },

    /**
     * Calculate total prize from all opened envelopes
     * @returns {number} total prize amount
     */
    calculateTotalPrize() {
        // Handle corrupted or null envelopes gracefully
        const envelopes = GameState.envelopes || [];
        return envelopes
            .filter(envelope => envelope && envelope.isOpened)
            .reduce((total, envelope) => total + (envelope.prizeAmount || 0), 0);
    },

    /**
     * Recalculate and update total prize (for validation/correction)
     * @returns {number} updated total prize amount
     */
    updateTotalPrize() {
        const calculatedTotal = this.calculateTotalPrize();
        GameState.totalPrize = calculatedTotal;
        return calculatedTotal;
    },

    /**
     * Get game statistics
     * @returns {Object} game statistics
     */
    getGameStatistics() {
        // Handle corrupted or null envelopes gracefully
        const envelopes = GameState.envelopes || [];
        const openedEnvelopes = envelopes.filter(envelope => envelope && envelope.isOpened);
        const remainingEnvelopes = envelopes.filter(envelope => envelope && !envelope.isOpened);
        
        return {
            totalEnvelopes: envelopes.length,
            openedCount: openedEnvelopes.length,
            remainingCount: remainingEnvelopes.length,
            totalPrize: GameState.totalPrize || 0,
            averagePrize: openedEnvelopes.length > 0 ? (GameState.totalPrize || 0) / openedEnvelopes.length : 0,
            isGameComplete: envelopes.length > 0 && openedEnvelopes.length === envelopes.length,
            gamePhase: GameState.phase || 'settings'
        };
    },

    /**
     * Enable restart options after game completion
     */
    enableRestartOptions() {
        // Ensure new game button is visible and functional
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.style.display = 'block';
            newGameBtn.disabled = false;
        }
        
        // Ensure play again button is visible and functional
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.style.display = 'block';
            playAgainBtn.disabled = false;
        }
        
        // Add keyboard shortcut for quick restart (Space or Enter)
        this.addRestartKeyboardShortcuts();
    },

    /**
     * Add keyboard shortcuts for restarting the game
     */
    addRestartKeyboardShortcuts() {
        const handleKeyPress = (event) => {
            // Only handle shortcuts when game is finished
            if (GameState.phase === 'finished') {
                if (event.code === 'Space' || event.code === 'Enter') {
                    event.preventDefault();
                    this.resetGame();
                    // Remove the event listener after use
                    document.removeEventListener('keydown', handleKeyPress);
                }
            }
        };
        
        document.addEventListener('keydown', handleKeyPress);
    },

    /**
     * Start new game with same settings
     */
    startNewGameWithSameSettings() {
        if (GameState.settings) {
            // Reuse current settings for quick restart
            this.initializeGame(GameState.settings);
        } else {
            // Fall back to normal reset if no settings available
            this.resetGame();
        }
    },

    /**
     * Check if game can be restarted
     * @returns {boolean} true if game can be restarted
     */
    canRestart() {
        return GameState.phase === 'finished' || GameState.phase === 'playing';
    },

    /**
     * Get game completion status
     * @returns {Object} completion status information
     */
    getGameCompletionStatus() {
        const stats = this.getGameStatistics();
        
        return {
            isComplete: stats.isGameComplete,
            completionPercentage: stats.totalEnvelopes > 0 ? 
                Math.round((stats.openedCount / stats.totalEnvelopes) * 100) : 0,
            remainingEnvelopes: stats.remainingCount,
            canRestart: this.canRestart(),
            phase: GameState.phase
        };
    }
};

/**
 * Integration Manager
 * จัดการการเชื่อมต่อและประสานงานระหว่าง components ทั้งหมด
 */
const IntegrationManager = {
    /**
     * Initialize all systems and ensure proper integration
     */
    async initializeAllSystems() {
        try {
            console.log('Initializing Red Envelope Game systems...');
            
            // Initialize audio system first (may take time to load)
            await AudioManager.initialize();
            
            // Initialize animation system
            AnimationManager.setAnimationEnabled(true);
            
            // Set up global error handling
            this.setupGlobalErrorHandling();
            
            // Set up cross-component event coordination
            this.setupComponentCoordination();
            
            // Initialize game state
            GameController.resetGame();
            
            console.log('All systems initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize game systems:', error);
            this.handleSystemInitializationError(error);
            return false;
        }
    },

    /**
     * Set up global error handling for all components
     */
    setupGlobalErrorHandling() {
        // Handle audio system errors
        window.addEventListener('error', (event) => {
            if (event.filename && event.filename.includes('audio')) {
                console.warn('Audio system error detected, switching to fallback mode');
                AudioManager.isAudioEnabled = false;
                AudioManager.updateSoundToggleUI();
            }
        });

        // Handle animation errors
        window.addEventListener('error', (event) => {
            if (event.message && event.message.includes('animation')) {
                console.warn('Animation system error detected, disabling animations');
                AnimationManager.setAnimationEnabled(false);
            }
        });
    },

    /**
     * Set up coordination between components
     */
    setupComponentCoordination() {
        // Coordinate audio and animation for envelope opening
        const originalOpenEnvelope = GameController.openEnvelope;
        GameController.openEnvelope = async function(envelopeId) {
            try {
                // Ensure systems are ready
                if (GameState.isAnimating) {
                    console.log('Animation in progress, ignoring envelope click');
                    return;
                }

                // Call original method
                await originalOpenEnvelope.call(this, envelopeId);
                
                // Ensure UI is updated after all effects complete
                IntegrationManager.ensureUIConsistency();
            } catch (error) {
                console.error('Error opening envelope:', error);
                GameState.isAnimating = false;
                UIManager.showError('เกิดข้อผิดพลาดในการเปิดซอง');
            }
        };

        // Coordinate game reset across all systems
        const originalResetGame = GameController.resetGame;
        GameController.resetGame = function() {
            try {
                // Stop all animations and audio
                AnimationManager.stopAllAnimations();
                
                // Call original reset
                originalResetGame.call(this);
                
                // Ensure all systems are in clean state
                IntegrationManager.ensureSystemsCleanState();
            } catch (error) {
                console.error('Error resetting game:', error);
                UIManager.showError('เกิดข้อผิดพลาดในการรีเซ็ตเกม');
            }
        };
    },

    /**
     * Ensure UI consistency across all components
     */
    ensureUIConsistency() {
        try {
            // Update game statistics
            UIManager.updateGameStats();
            
            // Update audio control UI
            AudioManager.updateSoundToggleUI();
            
            // Ensure animation states are clean
            if (!AnimationManager.hasActiveAnimations()) {
                GameState.isAnimating = false;
            }
            
            // Validate game state consistency
            this.validateGameStateConsistency();
        } catch (error) {
            console.warn('UI consistency check failed:', error);
        }
    },

    /**
     * Ensure all systems are in clean state
     */
    ensureSystemsCleanState() {
        try {
            // Clear all animations
            AnimationManager.stopAllAnimations();
            
            // Reset animation state
            GameState.isAnimating = false;
            
            // Clear any UI errors
            UIManager.clearError();
            UIManager.clearFieldErrors();
            
            // Hide detailed stats if showing
            UIManager.hideDetailedStats();
            
            console.log('All systems reset to clean state');
        } catch (error) {
            console.warn('System cleanup failed:', error);
        }
    },

    /**
     * Validate game state consistency across components
     */
    validateGameStateConsistency() {
        try {
            // Validate total prize calculation
            const calculatedTotal = GameController.calculateTotalPrize();
            if (calculatedTotal !== GameState.totalPrize) {
                console.warn('Total prize inconsistency detected, correcting...');
                GameController.updateTotalPrize();
            }

            // Validate opened count
            const actualOpenedCount = GameState.envelopes.filter(env => env.isOpened).length;
            if (actualOpenedCount !== GameState.openedCount) {
                console.warn('Opened count inconsistency detected, correcting...');
                GameState.openedCount = actualOpenedCount;
            }

            // Validate envelope states
            GameState.envelopes.forEach(envelope => {
                const validation = DataModelValidator.validateEnvelope(envelope);
                if (!validation.isValid) {
                    console.warn(`Envelope ${envelope.id} validation failed:`, validation.errors);
                }
            });
        } catch (error) {
            console.warn('Game state validation failed:', error);
        }
    },

    /**
     * Handle system initialization errors
     */
    handleSystemInitializationError(error) {
        // Show user-friendly error message
        const errorMessage = 'เกิดข้อผิดพลาดในการเริ่มต้นระบบ กรุณารีเฟรชหน้าเว็บ';
        
        // Try to show error in UI if possible
        try {
            UIManager.showError(errorMessage);
        } catch (uiError) {
            // Fallback to alert if UI is not available
            alert(errorMessage);
        }
    },

    /**
     * Show keyboard shortcuts help
     */
    showKeyboardShortcuts() {
        const shortcuts = `
🎮 เกมสุ่มเปิดซองแดง - คีย์ลัด

⌨️ คีย์ลัดทั่วไป:
• Ctrl+S: เปิด/ปิดเสียง
• Ctrl+N: เกมใหม่
• Ctrl+R: รีเซ็ตเกม
• Esc: กลับหน้าการตั้งค่า
• F1: แสดงคีย์ลัด (หน้านี้)

🎯 ในหน้าการตั้งค่า:
• Enter: เริ่มเกม
• Tab: เปลี่ยนช่องกรอก

🎊 ในหน้าเกม:
• คลิกซอง: เปิดซอง
• Space/Enter: เริ่มเกมใหม่ (เมื่อจบเกม)

💡 เคล็ดลับ:
• เกมจะบันทึกความคืบหน้าอัตโนมัติ
• สามารถเปิด/ปิดเสียงได้ตลอดเวลา
• ใช้ Esc เพื่อกลับหน้าการตั้งค่าได้เสมอ
        `;
        
        alert(shortcuts);
    },

    /**
     * Handle window resize events
     */
    handleWindowResize() {
        try {
            // Recalculate envelope positions if in game
            if (GameState.phase === 'playing' && GameState.envelopes.length > 0) {
                // Trigger UI update to adjust layout
                UIManager.updateEnvelopeDisplay(GameState.envelopes);
            }
            
            // Update any responsive elements
            this.updateResponsiveElements();
            
            console.log('Window resize handled');
        } catch (error) {
            console.warn('Window resize handling failed:', error);
        }
    },

    /**
     * Update responsive elements based on screen size
     */
    updateResponsiveElements() {
        const screenWidth = window.innerWidth;
        const isMobile = screenWidth <= 768;
        
        // Adjust envelope container for mobile
        const envelopesContainer = document.getElementById('envelopes-container');
        if (envelopesContainer) {
            if (isMobile) {
                envelopesContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
                envelopesContainer.style.gap = '0.5rem';
            } else {
                envelopesContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
                envelopesContainer.style.gap = '1rem';
            }
        }
        
        // Adjust animation intensity for mobile
        if (isMobile) {
            AnimationManager.setAnimationEnabled(true); // Keep animations but they're lighter on mobile via CSS
        }
    },

    /**
     * Perform comprehensive system health check
     */
    performSystemHealthCheck() {
        const healthReport = {
            timestamp: new Date().toISOString(),
            overall: 'healthy',
            issues: [],
            warnings: []
        };

        try {
            // Check audio system
            const audioStatus = AudioManager.getAudioStatus();
            if (!audioStatus.isLoaded) {
                healthReport.warnings.push('Audio system not fully loaded');
            }

            // Check animation system
            const animationStatus = AnimationManager.getAnimationStatus();
            if (animationStatus.activeAnimationsCount > 10) {
                healthReport.warnings.push('High number of active animations detected');
            }

            // Check game state consistency
            this.validateGameStateConsistency();

            // Check for memory leaks (basic check)
            if (GameState.envelopes.length > 100) {
                healthReport.warnings.push('Large number of envelopes may impact performance');
            }

            // Check DOM elements
            const requiredElements = ['settings-screen', 'game-screen', 'game-end-screen'];
            requiredElements.forEach(elementId => {
                if (!document.getElementById(elementId)) {
                    healthReport.issues.push(`Missing required DOM element: ${elementId}`);
                    healthReport.overall = 'degraded';
                }
            });

            if (healthReport.issues.length > 0) {
                healthReport.overall = 'unhealthy';
            } else if (healthReport.warnings.length > 0) {
                healthReport.overall = 'degraded';
            }

        } catch (error) {
            healthReport.issues.push(`Health check failed: ${error.message}`);
            healthReport.overall = 'unhealthy';
        }

        return healthReport;
    },

    /**
     * Get system status for debugging
     */
    getSystemStatus() {
        return {
            audio: AudioManager.getAudioStatus(),
            animation: AnimationManager.getAnimationStatus(),
            game: GameController.getGameState(),
            gameStats: GameController.getGameStatistics(),
            completion: GameController.getGameCompletionStatus(),
            health: this.performSystemHealthCheck()
        };
    },

    /**
     * Export game state for debugging or saving
     */
    exportGameState() {
        const gameState = GameController.getGameState();
        const systemStatus = this.getSystemStatus();
        
        return {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            gameState: gameState,
            systemStatus: systemStatus,
            settings: gameState.settings,
            statistics: GameController.getGameStatistics()
        };
    }
};

/**
 * Event Handlers and Initialization
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize all systems
    const systemsReady = await IntegrationManager.initializeAllSystems();
    
    if (!systemsReady) {
        console.error('Failed to initialize game systems');
        return;
    }

    // Settings form submission
    document.getElementById('start-game-btn').addEventListener('click', function() {
        const formValidation = UIManager.validateSettingsForm();
        
        if (formValidation.isValid) {
            UIManager.clearFieldErrors();
            const settings = {
                playerName: formValidation.values.playerName,
                envelopeCount: formValidation.values.envelopeCount,
                minPrize: formValidation.values.minPrize,
                maxPrize: formValidation.values.maxPrize,
                soundEnabled: AudioManager.isAudioEnabled
            };
            
            try {
                GameController.initializeGame(settings);
                
                // Ensure all systems are coordinated after game start
                IntegrationManager.ensureUIConsistency();
            } catch (error) {
                UIManager.showError('เกิดข้อผิดพลาดในการเริ่มเกม: ' + error.message);
                console.error('Game initialization error:', error);
            }
        } else {
            UIManager.displayFieldErrors(formValidation.fieldErrors);
        }
    });

    // New game button with enhanced confirmation
    document.getElementById('new-game-btn').addEventListener('click', function() {
        // Show confirmation if game is in progress
        if (GameState.phase === 'playing' && GameState.openedCount > 0) {
            const stats = GameController.getGameStatistics();
            const progressMessage = `คุณได้เปิดซองไปแล้ว ${stats.openedCount} จาก ${stats.totalEnvelopes} ซอง\nเงินรวมปัจจุบัน: ${stats.totalPrize} บาท\n\nคุณต้องการเริ่มเกมใหม่หรือไม่?`;
            
            const confirmed = confirm(progressMessage);
            if (confirmed) {
                GameController.resetGame();
                IntegrationManager.ensureSystemsCleanState();
            }
        } else {
            GameController.resetGame();
            IntegrationManager.ensureSystemsCleanState();
        }
    });

    // Play again button
    document.getElementById('play-again-btn').addEventListener('click', function() {
        GameController.resetGame();
        IntegrationManager.ensureSystemsCleanState();
    });

    // Download results button
    document.getElementById('download-results-btn').addEventListener('click', function() {
        const success = DataManager.downloadGameResults();
        if (success) {
            // Show success message briefly
            const button = this;
            const originalText = button.textContent;
            button.textContent = '✅ ดาวน์โหลดสำเร็จ!';
            button.disabled = true;
            
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 2000);
        }
    });

    // Sound toggle button with enhanced feedback
    document.getElementById('sound-toggle').addEventListener('click', function() {
        const wasEnabled = AudioManager.isAudioEnabled;
        AudioManager.toggleSound();
        
        // Provide audio feedback if sound was just enabled
        if (!wasEnabled && AudioManager.isAudioEnabled) {
            // Play a brief test sound to confirm audio is working
            setTimeout(() => {
                AudioManager.playOpenEnvelopeSound();
            }, 100);
        }
        
        // Update UI to reflect current state
        IntegrationManager.ensureUIConsistency();
    });

    // Real-time validation for settings form with enhanced UX
    const settingsInputs = ['envelope-count', 'min-prize', 'max-prize'];
    settingsInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Clear errors when user starts typing
            input.addEventListener('input', function() {
                // Clear field-specific errors for this input
                this.classList.remove('error');
                const fieldError = this.parentNode.querySelector('.field-error');
                if (fieldError) {
                    fieldError.remove();
                }
                
                // Clear main error message if all fields have values
                const allInputs = settingsInputs.map(id => document.getElementById(id));
                const allHaveValues = allInputs.every(inp => inp && inp.value.trim());
                if (allHaveValues) {
                    UIManager.clearError();
                }
            });
            
            // Validate on blur (when user leaves the field)
            input.addEventListener('blur', function() {
                const formValidation = UIManager.validateSettingsForm();
                if (!formValidation.isValid) {
                    // Only show errors for fields that have been filled
                    const currentFieldErrors = {};
                    Object.keys(formValidation.fieldErrors).forEach(fieldName => {
                        let shouldShow = false;
                        switch (fieldName) {
                            case 'envelopeCount':
                                shouldShow = document.getElementById('envelope-count').value.trim();
                                break;
                            case 'minPrize':
                                shouldShow = document.getElementById('min-prize').value.trim();
                                break;
                            case 'maxPrize':
                                shouldShow = document.getElementById('max-prize').value.trim();
                                break;
                            case 'prizeRange':
                                shouldShow = document.getElementById('min-prize').value.trim() && 
                                           document.getElementById('max-prize').value.trim();
                                break;
                        }
                        
                        if (shouldShow) {
                            currentFieldErrors[fieldName] = formValidation.fieldErrors[fieldName];
                        }
                    });
                    
                    if (Object.keys(currentFieldErrors).length > 0) {
                        UIManager.displayFieldErrors(currentFieldErrors);
                    }
                }
            });

            // Add Enter key support for form submission
            input.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    document.getElementById('start-game-btn').click();
                }
            });
        }
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Prevent shortcuts during animations
        if (GameState.isAnimating) {
            return;
        }

        switch (event.code) {
            case 'KeyS':
                // S key: Toggle sound
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    AudioManager.toggleSound();
                }
                break;
            
            case 'KeyN':
                // N key: New game
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    if (GameState.phase === 'playing' || GameState.phase === 'finished') {
                        document.getElementById('new-game-btn').click();
                    }
                }
                break;
            
            case 'KeyR':
                // R key: Reset/Restart
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    GameController.resetGame();
                }
                break;
            
            case 'Escape':
                // Escape key: Context-sensitive action
                event.preventDefault();
                if (GameState.phase === 'playing') {
                    // Show confirmation to return to settings
                    const confirmed = confirm('คุณต้องการกลับไปหน้าการตั้งค่าหรือไม่?');
                    if (confirmed) {
                        GameController.resetGame();
                    }
                } else if (GameState.phase === 'finished') {
                    // Return to settings
                    GameController.resetGame();
                }
                break;
            
            case 'F1':
                // F1: Show help/shortcuts
                event.preventDefault();
                IntegrationManager.showKeyboardShortcuts();
                break;
        }
    });

    // Add visibility change handler to pause/resume appropriately
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Page is hidden - pause animations if any
            if (GameState.isAnimating) {
                AnimationManager.stopAllAnimations();
                GameState.isAnimating = false;
            }
        } else {
            // Page is visible again - ensure UI consistency
            IntegrationManager.ensureUIConsistency();
        }
    });

    // Add window resize handler for responsive adjustments
    window.addEventListener('resize', function() {
        // Debounce resize events
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            IntegrationManager.handleWindowResize();
        }, 250);
    });

    // Add beforeunload handler to warn about losing progress
    window.addEventListener('beforeunload', function(event) {
        if (GameState.phase === 'playing' && GameState.openedCount > 0) {
            const message = 'คุณมีเกมที่กำลังเล่นอยู่ คุณแน่ใจหรือไม่ที่จะออกจากหน้านี้?';
            event.returnValue = message;
            return message;
        }
    });

    console.log('Red Envelope Game initialized successfully');
    console.log('Keyboard shortcuts: Ctrl+S (sound), Ctrl+N (new game), Ctrl+R (reset), Esc (back), F1 (help)');
});

/**
 * Data Manager - จัดการการบันทึกและอ่านข้อมูลผู้เล่น
 */
const DataManager = {
    /**
     * ตรวจสอบความถูกต้องของชื่อผู้เล่น
     * @param {string} name - ชื่อผู้เล่น
     * @returns {object} - ผลการตรวจสอบ {isValid: boolean, error: string}
     */
    validatePlayerName(name) {
        if (!name || typeof name !== 'string') {
            return {
                isValid: false,
                error: 'กรุณากรอกชื่อผู้เล่น'
            };
        }

        const trimmedName = name.trim();
        
        if (trimmedName.length === 0) {
            return {
                isValid: false,
                error: 'กรุณากรอกชื่อผู้เล่น'
            };
        }

        if (trimmedName.length > 50) {
            return {
                isValid: false,
                error: 'ชื่อผู้เล่นต้องไม่เกิน 50 ตัวอักษร'
            };
        }

        // ตรวจสอบอักขระที่ไม่อนุญาต (เฉพาะอักขระพิเศษที่อาจทำให้ไฟล์เสียหาย)
        const invalidChars = /[<>:"/\\|?*\x00-\x1f,]/; // Added comma to prevent CSV parsing issues
        if (invalidChars.test(trimmedName)) {
            return {
                isValid: false,
                error: 'ชื่อผู้เล่นมีอักขระที่ไม่อนุญาต'
            };
        }

        return {
            isValid: true,
            error: null
        };
    },

    /**
     * จัดรูปแบบข้อมูลผลการเล่นสำหรับบันทึก
     * @param {string} playerName - ชื่อผู้เล่น
     * @param {number} totalPrize - เงินรางวัลรวม
     * @param {Date} gameDate - วันที่และเวลาที่เล่น
     * @param {object} gameSettings - การตั้งค่าเกม
     * @returns {string} - ข้อมูลในรูปแบบ CSV
     */
    formatGameResult(playerName, totalPrize, gameDate, gameSettings = {}) {
        const date = gameDate.toLocaleDateString('th-TH');
        const time = gameDate.toLocaleTimeString('th-TH');
        const envelopeCount = gameSettings.envelopeCount || 0;
        const minPrize = gameSettings.minPrize || 0;
        const maxPrize = gameSettings.maxPrize || 0;
        
        // Escape player name for CSV (replace quotes with double quotes and wrap in quotes)
        const escapedPlayerName = `"${playerName.replace(/"/g, '""')}"`;
        
        // รูปแบบ CSV: วันที่, เวลา, ชื่อผู้เล่น, จำนวนเงินรวม, จำนวนซอง, เงินรางวัลต่ำสุด, เงินรางวัลสูงสุด
        return `${date},${time},${escapedPlayerName},${totalPrize},${envelopeCount},${minPrize},${maxPrize}`;
    },

    /**
     * สร้างชื่อไฟล์สำหรับบันทึกข้อมูล
     * @returns {string} - ชื่อไฟล์
     */
    generateFileName() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        return `red_envelope_game_results_${dateStr}.txt`;
    },

    /**
     * บันทึกผลการเล่นลงไฟล์ (ดาวน์โหลดไฟล์)
     * @param {string} playerName - ชื่อผู้เล่น
     * @param {number} totalPrize - เงินรางวัลรวม
     * @param {Date} gameDate - วันที่และเวลาที่เล่น
     * @param {object} gameSettings - การตั้งค่าเกม
     * @returns {boolean} - สำเร็จหรือไม่
     */
    saveGameResult(playerName, totalPrize, gameDate = new Date(), gameSettings = {}) {
        try {
            // ตรวจสอบความถูกต้องของข้อมูล
            const nameValidation = this.validatePlayerName(playerName);
            if (!nameValidation.isValid) {
                console.error('Invalid player name:', nameValidation.error);
                return false;
            }

            if (typeof totalPrize !== 'number' || totalPrize < 0) {
                console.error('Invalid total prize:', totalPrize);
                return false;
            }

            // อ่านข้อมูลเก่าจาก localStorage (ถ้ามี)
            let existingData = '';
            const storageKey = 'redEnvelopeGameResults';
            const savedData = localStorage.getItem(storageKey);
            
            if (savedData) {
                existingData = savedData + '\n';
            } else {
                // เพิ่ม header ถ้าเป็นครั้งแรก
                existingData = 'วันที่,เวลา,ชื่อผู้เล่น,จำนวนเงินรวม,จำนวนซอง,เงินรางวัลต่ำสุด,เงินรางวัลสูงสุด\n';
            }

            // เพิ่มข้อมูลใหม่
            const newResult = this.formatGameResult(playerName, totalPrize, gameDate, gameSettings);
            const updatedData = existingData + newResult;

            // บันทึกลง localStorage
            localStorage.setItem(storageKey, updatedData);

            console.log('Game result saved successfully');
            return true;

        } catch (error) {
            console.error('Error saving game result:', error);
            return false;
        }
    },

    /**
     * ดาวน์โหลดไฟล์ผลการเล่นทั้งหมด
     * @returns {boolean} - สำเร็จหรือไม่
     */
    downloadGameResults() {
        try {
            // Create detailed report with envelope information
            let report = '=== สรุปผลการเล่นเกมซองแดงอั่งเปา ===\n\n';
            
            // Game summary
            const stats = GameController.getGameStatistics();
            report += `วันที่: ${new Date().toLocaleDateString('th-TH')}\n`;
            report += `เวลา: ${new Date().toLocaleTimeString('th-TH')}\n`;
            report += `ชื่อผู้เล่นหลัก: ${GameState.playerName || 'ไม่ระบุ'}\n`;
            report += `จำนวนเงินรวม: ${stats.totalPrize.toLocaleString()} บาท\n`;
            report += `จำนวนซองที่เปิด: ${stats.openedCount} ซอง\n`;
            report += `เงินรางวัลเฉลี่ย: ${Math.round(stats.averagePrize).toLocaleString()} บาท\n\n`;
            
            // Detailed envelope list
            const openedEnvelopes = GameState.envelopes.filter(env => env.isOpened);
            openedEnvelopes.sort((a, b) => {
                const aNum = parseInt(a.id.split('-')[1]);
                const bNum = parseInt(b.id.split('-')[1]);
                return aNum - bNum;
            });
            
            report += '=== รายละเอียดผู้เปิดซอง ===\n';
            report += 'ลำดับ,ชื่อผู้เปิดซอง,จำนวนเงิน (บาท)\n';
            openedEnvelopes.forEach((envelope, index) => {
                report += `${index + 1},${envelope.openedBy || 'ไม่ระบุชื่อ'},${envelope.prizeAmount.toLocaleString()}\n`;
            });
            
            // สร้างไฟล์และดาวน์โหลด
            const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = this.generateDetailedFileName();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.URL.revokeObjectURL(url);

            console.log('Game results downloaded successfully');
            return true;

        } catch (error) {
            console.error('Error downloading game results:', error);
            alert('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์');
            return false;
        }
    },

    /**
     * สร้างชื่อไฟล์สำหรับรายงานละเอียด
     * @returns {string} - ชื่อไฟล์
     */
    generateDetailedFileName() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
        return `red_envelope_detailed_${dateStr}_${timeStr}.txt`;
    },

    /**
     * ล้างข้อมูลผลการเล่นทั้งหมด
     * @returns {boolean} - สำเร็จหรือไม่
     */
    clearAllResults() {
        try {
            const storageKey = 'redEnvelopeGameResults';
            localStorage.removeItem(storageKey);
            console.log('All game results cleared');
            return true;
        } catch (error) {
            console.error('Error clearing game results:', error);
            return false;
        }
    },

    /**
     * ดึงข้อมูลผลการเล่นทั้งหมด
     * @returns {string|null} - ข้อมูลผลการเล่นหรือ null ถ้าไม่มี
     */
    getAllResults() {
        try {
            const storageKey = 'redEnvelopeGameResults';
            return localStorage.getItem(storageKey);
        } catch (error) {
            console.error('Error getting game results:', error);
            return null;
        }
    },

    /**
     * นับจำนวนเกมที่เล่นแล้ว
     * @returns {number} - จำนวนเกมที่เล่น
     */
    getGameCount() {
        try {
            const data = this.getAllResults();
            if (!data) return 0;
            
            // นับจำนวนบรรทัด (ลบ header)
            const lines = data.split('\n').filter(line => line.trim() !== '');
            return Math.max(0, lines.length - 1); // ลบ header line
        } catch (error) {
            console.error('Error counting games:', error);
            return 0;
        }
    }
};

// Export modules for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameState,
        SettingsManager,
        EnvelopeGenerator,
        PrizeCalculator,
        UIManager,
        GameController,
        AudioManager,
        AnimationManager,
        IntegrationManager,
        DataManager,
        HORSE_CARTOONS,
        DataModelValidator
    };
}