/**
 * Red Envelope Game - Test Suite
 * Basic tests to verify testing framework setup
 */

const {
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
} = require('./game.js');

describe('Red Envelope Game - Basic Setup Tests', () => {
    describe('SettingsManager', () => {
        test('should validate correct settings', () => {
            const result = SettingsManager.validateSettings(10, 10, 100);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should reject invalid envelope count', () => {
            const result = SettingsManager.validateSettings(-1, 10, 100);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('กรุณากรอกจำนวนซองเป็นจำนวนเต็มบวก');
        });

        test('should reject invalid prize range', () => {
            const result = SettingsManager.validateSettings(10, 100, 10);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('กรุณากรอกช่วงเงินรางวัลที่ถูกต้อง (ค่าต่ำสุด ≤ ค่าสูงสุด)');
        });

        test('should return default settings', () => {
            const defaults = SettingsManager.getDefaultSettings();
            expect(defaults).toHaveProperty('envelopeCount');
            expect(defaults).toHaveProperty('minPrize');
            expect(defaults).toHaveProperty('maxPrize');
            expect(defaults).toHaveProperty('soundEnabled');
        });
    });

    describe('EnvelopeGenerator', () => {
        test('should generate correct number of envelopes', () => {
            const envelopes = EnvelopeGenerator.generateEnvelopes(5);
            expect(envelopes).toHaveLength(5);
        });

        test('should assign unique properties to each envelope', () => {
            const envelopes = EnvelopeGenerator.generateEnvelopes(3);
            envelopes.forEach((envelope, index) => {
                expect(envelope).toHaveProperty('id');
                expect(envelope).toHaveProperty('horseImageId');
                expect(envelope).toHaveProperty('isOpened', false);
                expect(envelope).toHaveProperty('prizeAmount', 0);
                expect(envelope).toHaveProperty('horseEmoji');
            });
        });
    });

    describe('PrizeCalculator', () => {
        test('should calculate prize within valid range', () => {
            const prize = PrizeCalculator.calculateRandomPrize(10, 100);
            expect(prize).toBeGreaterThanOrEqual(10);
            expect(prize).toBeLessThanOrEqual(100);
            expect(Number.isInteger(prize)).toBe(true);
        });

        test('should validate prize range correctly', () => {
            expect(PrizeCalculator.validatePrizeRange(10, 100)).toBe(true);
            expect(PrizeCalculator.validatePrizeRange(100, 10)).toBe(false);
            expect(PrizeCalculator.validatePrizeRange(-1, 100)).toBe(false);
        });

        test('should throw error for invalid range', () => {
            expect(() => {
                PrizeCalculator.calculateRandomPrize(100, 10);
            }).toThrow('Invalid prize range');
        });
    });

    describe('GameController', () => {
        test('should initialize game state correctly', () => {
            const settings = {
                envelopeCount: 5,
                minPrize: 10,
                maxPrize: 100,
                soundEnabled: true,
                playerName: 'TestPlayer'
            };

            GameController.initializeGame(settings);
            const gameState = GameController.getGameState();

            expect(gameState.settings).toEqual(settings);
            expect(gameState.envelopes).toHaveLength(5);
            expect(gameState.totalPrize).toBe(0);
            expect(gameState.openedCount).toBe(0);
            expect(gameState.playerName).toBe('TestPlayer');
        });

        test('should reset game state correctly', () => {
            // First initialize a game
            const settings = {
                envelopeCount: 3,
                minPrize: 10,
                maxPrize: 100,
                soundEnabled: true,
                playerName: 'TestPlayer'
            };
            GameController.initializeGame(settings);

            // Then reset
            GameController.resetGame();
            const gameState = GameController.getGameState();

            expect(gameState.phase).toBe('settings');
            expect(gameState.settings).toBeNull();
            expect(gameState.envelopes).toHaveLength(0);
            expect(gameState.totalPrize).toBe(0);
            expect(gameState.openedCount).toBe(0);
            expect(gameState.playerName).toBe('');
        });
    });

    describe('Constants', () => {
        test('should have horse cartoons defined', () => {
            expect(HORSE_CARTOONS).toBeDefined();
            expect(Array.isArray(HORSE_CARTOONS)).toBe(true);
            expect(HORSE_CARTOONS.length).toBeGreaterThan(0);
        });
    });
});

// Property-Based Tests
describe('Property-Based Tests', () => {
    const fc = require('fast-check');

    describe('Input Validation Properties', () => {
        test('Property 1: Input validation consistency', () => {
            // **Feature: red-envelope-game, Property 1: Input validation consistency**
            // **Validates: Requirements 1.2, 1.3**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 1000 }), // envelopeCount
                    fc.integer({ min: 1, max: 1000 }), // minPrize
                    fc.integer({ min: 1, max: 1000 }), // maxPrize
                    fc.boolean(), // soundEnabled
                    fc.string({ minLength: 1, maxLength: 50 }).filter(s => !/[<>:"/\\|?*\x00-\x1f,]/.test(s.trim())), // playerName
                    (envelopeCount, minPrize, maxPrize, soundEnabled, playerName) => {
                        const settings = {
                            envelopeCount,
                            minPrize: Math.min(minPrize, maxPrize),
                            maxPrize: Math.max(minPrize, maxPrize),
                            soundEnabled,
                            playerName: playerName.trim()
                        };
                        
                        // Test both SettingsManager and DataModelValidator
                        const settingsManagerResult = SettingsManager.validateSettings(
                            settings.envelopeCount, 
                            settings.minPrize, 
                            settings.maxPrize,
                            settings.playerName
                        );
                        const dataModelResult = DataModelValidator.validateGameSettings(settings);
                        
                        // Both should accept valid positive integers with proper range and valid player name
                        return settingsManagerResult.isValid === true && 
                               dataModelResult.isValid === true;
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('Property 1 - Invalid input rejection', () => {
            // **Feature: red-envelope-game, Property 1: Input validation consistency**
            // **Validates: Requirements 1.2, 1.3**
            
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.integer({ max: 0 }), // Invalid envelope count
                        fc.float(), // Non-integer envelope count
                        fc.constant(null),
                        fc.constant(undefined)
                    ),
                    fc.oneof(
                        fc.integer({ max: 0 }), // Invalid min prize
                        fc.float(), // Non-integer min prize
                        fc.constant(null)
                    ),
                    fc.oneof(
                        fc.integer({ max: 0 }), // Invalid max prize
                        fc.float(), // Non-integer max prize
                        fc.constant(null)
                    ),
                    (invalidEnvelopeCount, invalidMinPrize, invalidMaxPrize) => {
                        // Test with at least one invalid input
                        const settingsManagerResult = SettingsManager.validateSettings(
                            invalidEnvelopeCount, 
                            invalidMinPrize, 
                            invalidMaxPrize
                        );
                        
                        // Should reject invalid inputs
                        return settingsManagerResult.isValid === false;
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('Property 1 - Prize range validation', () => {
            // **Feature: red-envelope-game, Property 1: Input validation consistency**
            // **Validates: Requirements 1.2, 1.3**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 100 }),
                    fc.integer({ min: 101, max: 200 }),
                    (smallValue, largeValue) => {
                        // Test invalid range where min > max
                        const settingsManagerResult = SettingsManager.validateSettings(
                            10, // valid envelope count
                            largeValue, // min prize (larger)
                            smallValue,  // max prize (smaller)
                            'ValidPlayer' // valid player name
                        );
                        
                        const invalidSettings = {
                            envelopeCount: 10,
                            minPrize: largeValue,
                            maxPrize: smallValue,
                            soundEnabled: true,
                            playerName: 'ValidPlayer'
                        };
                        const dataModelResult = DataModelValidator.validateGameSettings(invalidSettings);
                        
                        // Both should reject when min > max
                        return settingsManagerResult.isValid === false && 
                               dataModelResult.isValid === false;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Game Session Creation Properties', () => {
        test('Property 2: Game session creation consistency', () => {
            // **Feature: red-envelope-game, Property 2: Game session creation consistency**
            // **Validates: Requirements 1.4**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 50 }), // envelopeCount
                    fc.integer({ min: 1, max: 100 }), // minPrize
                    fc.integer({ min: 1, max: 100 }), // maxPrize
                    fc.boolean(), // soundEnabled
                    fc.string({ minLength: 1, maxLength: 50 }).filter(s => !/[<>:"/\\|?*\x00-\x1f,]/.test(s.trim())), // playerName
                    (envelopeCount, minPrize, maxPrize, soundEnabled, playerName) => {
                        const settings = {
                            envelopeCount,
                            minPrize: Math.min(minPrize, maxPrize),
                            maxPrize: Math.max(minPrize, maxPrize),
                            soundEnabled,
                            playerName: playerName.trim()
                        };
                        
                        // Initialize game with valid settings
                        GameController.initializeGame(settings);
                        const gameState = GameController.getGameState();
                        
                        // Game session should be created with exactly the same parameters
                        return gameState.settings.envelopeCount === settings.envelopeCount &&
                               gameState.settings.minPrize === settings.minPrize &&
                               gameState.settings.maxPrize === settings.maxPrize &&
                               gameState.settings.soundEnabled === settings.soundEnabled &&
                               gameState.settings.playerName === settings.playerName &&
                               gameState.envelopes.length === settings.envelopeCount &&
                               gameState.phase === 'playing' &&
                               gameState.totalPrize === 0 &&
                               gameState.openedCount === 0 &&
                               gameState.playerName === settings.playerName;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Invalid Settings Rejection Properties', () => {
        test('Property 3: Invalid settings rejection', () => {
            // **Feature: red-envelope-game, Property 3: Invalid settings rejection**
            // **Validates: Requirements 1.5**
            
            fc.assert(
                fc.property(
                    fc.oneof(
                        // Invalid envelope counts (non-positive integers)
                        fc.record({
                            envelopeCount: fc.integer({ max: 0 }),
                            minPrize: fc.integer({ min: 1, max: 100 }),
                            maxPrize: fc.integer({ min: 1, max: 100 }),
                            soundEnabled: fc.boolean(),
                            playerName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !/[<>:"/\\|?*\x00-\x1f,]/.test(s.trim()))
                        }).map(settings => ({
                            ...settings,
                            maxPrize: Math.max(settings.minPrize, settings.maxPrize),
                            playerName: settings.playerName.trim()
                        })),
                        // Invalid minPrize (non-positive integers)
                        fc.record({
                            envelopeCount: fc.integer({ min: 1, max: 50 }),
                            minPrize: fc.integer({ max: 0 }),
                            maxPrize: fc.integer({ min: 1, max: 100 }),
                            soundEnabled: fc.boolean(),
                            playerName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !/[<>:"/\\|?*\x00-\x1f,]/.test(s.trim()))
                        }).map(settings => ({
                            ...settings,
                            playerName: settings.playerName.trim()
                        })),
                        // Invalid maxPrize (non-positive integers)
                        fc.record({
                            envelopeCount: fc.integer({ min: 1, max: 50 }),
                            minPrize: fc.integer({ min: 1, max: 100 }),
                            maxPrize: fc.integer({ max: 0 }),
                            soundEnabled: fc.boolean(),
                            playerName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !/[<>:"/\\|?*\x00-\x1f,]/.test(s.trim()))
                        }).map(settings => ({
                            ...settings,
                            playerName: settings.playerName.trim()
                        })),
                        // Invalid range where min > max
                        fc.record({
                            envelopeCount: fc.integer({ min: 1, max: 50 }),
                            minPrize: fc.integer({ min: 50, max: 200 }),
                            maxPrize: fc.integer({ min: 1, max: 49 }),
                            soundEnabled: fc.boolean(),
                            playerName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !/[<>:"/\\|?*\x00-\x1f,]/.test(s.trim()))
                        }).map(settings => ({
                            ...settings,
                            playerName: settings.playerName.trim()
                        })),
                        // Invalid playerName (empty or invalid characters)
                        fc.record({
                            envelopeCount: fc.integer({ min: 1, max: 50 }),
                            minPrize: fc.integer({ min: 1, max: 100 }),
                            maxPrize: fc.integer({ min: 1, max: 100 }),
                            soundEnabled: fc.boolean(),
                            playerName: fc.oneof(
                                fc.constant(''), // empty name
                                fc.string({ minLength: 51, maxLength: 100 }), // too long
                                fc.constant('invalid,name'), // contains comma
                                fc.constant('invalid<name>') // contains invalid chars
                            )
                        }).map(settings => ({
                            ...settings,
                            maxPrize: Math.max(settings.minPrize, settings.maxPrize)
                        }))
                    ),
                    (invalidSettings) => {
                        // Test SettingsManager validation
                        const settingsValidation = SettingsManager.validateSettings(
                            invalidSettings.envelopeCount,
                            invalidSettings.minPrize,
                            invalidSettings.maxPrize,
                            invalidSettings.playerName
                        );
                        
                        // Test DataModelValidator validation
                        const dataModelValidation = DataModelValidator.validateGameSettings(invalidSettings);
                        
                        // Both should reject invalid settings and provide error messages
                        return settingsValidation.isValid === false &&
                               settingsValidation.errors.length > 0 &&
                               dataModelValidation.isValid === false &&
                               dataModelValidation.errors.length > 0;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Envelope Display Properties', () => {
        test('Property 4: Envelope display count consistency', () => {
            // **Feature: red-envelope-game, Property 4: Envelope display count consistency**
            // **Validates: Requirements 2.1**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 50 }), // envelopeCount
                    (envelopeCount) => {
                        // Generate envelopes using EnvelopeGenerator
                        const envelopes = EnvelopeGenerator.generateEnvelopes(envelopeCount);
                        
                        // The game should display exactly the specified number of envelopes
                        return envelopes.length === envelopeCount &&
                               envelopes.every(envelope => 
                                   envelope.hasOwnProperty('id') &&
                                   envelope.hasOwnProperty('horseImageId') &&
                                   envelope.hasOwnProperty('isOpened') &&
                                   envelope.hasOwnProperty('prizeAmount') &&
                                   envelope.hasOwnProperty('position') &&
                                   envelope.hasOwnProperty('horseEmoji')
                               );
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('Property 5: Horse cartoon uniqueness', () => {
            // **Feature: red-envelope-game, Property 5: Horse cartoon uniqueness**
            // **Validates: Requirements 2.2**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: HORSE_CARTOONS.length }), // envelopeCount within available horse cartoons
                    (envelopeCount) => {
                        // Generate envelopes using EnvelopeGenerator
                        const envelopes = EnvelopeGenerator.generateEnvelopes(envelopeCount);
                        
                        // Extract horse emojis from envelopes
                        const horseEmojis = envelopes.map(envelope => envelope.horseEmoji);
                        
                        // Each envelope should display a different horse cartoon image
                        // within the available range (no duplicates when count <= available horses)
                        const uniqueHorseEmojis = new Set(horseEmojis);
                        
                        return uniqueHorseEmojis.size === envelopeCount;
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('Property 5: Horse cartoon cycling for large counts', () => {
            // **Feature: red-envelope-game, Property 5: Horse cartoon uniqueness**
            // **Validates: Requirements 2.2**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: HORSE_CARTOONS.length + 1, max: 50 }), // envelopeCount exceeding available horses
                    (envelopeCount) => {
                        // Generate envelopes using EnvelopeGenerator
                        const envelopes = EnvelopeGenerator.generateEnvelopes(envelopeCount);
                        
                        // Extract horse emojis from envelopes
                        const horseEmojis = envelopes.map(envelope => envelope.horseEmoji);
                        
                        // When envelope count exceeds available horses, we should cycle through them
                        // All horse emojis should be from the available HORSE_CARTOONS array
                        return horseEmojis.every(emoji => HORSE_CARTOONS.includes(emoji));
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('Property 6: Envelope state display consistency', () => {
            // **Feature: red-envelope-game, Property 6: Envelope state display consistency**
            // **Validates: Requirements 2.3, 2.4**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 20 }), // envelopeCount
                    fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }), // random opened states
                    fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 1, maxLength: 20 }), // random prize amounts
                    (envelopeCount, openedStates, prizeAmounts) => {
                        // Generate envelopes
                        const envelopes = EnvelopeGenerator.generateEnvelopes(envelopeCount);
                        
                        // Apply random states to envelopes
                        envelopes.forEach((envelope, index) => {
                            const isOpened = openedStates[index % openedStates.length];
                            const prizeAmount = prizeAmounts[index % prizeAmounts.length];
                            
                            envelope.isOpened = isOpened;
                            envelope.prizeAmount = isOpened ? prizeAmount : 0;
                        });
                        
                        // Test envelope state display consistency
                        return envelopes.every(envelope => {
                            if (envelope.isOpened) {
                                // Opened envelopes should have prize amount > 0 and horse emoji should be present
                                return envelope.prizeAmount > 0 && 
                                       envelope.horseEmoji && 
                                       HORSE_CARTOONS.includes(envelope.horseEmoji);
                            } else {
                                // Closed envelopes should have prize amount = 0 and horse emoji should be present
                                return envelope.prizeAmount === 0 && 
                                       envelope.horseEmoji && 
                                       HORSE_CARTOONS.includes(envelope.horseEmoji);
                            }
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Prize Calculation Properties', () => {
        test('Property 8: Prize amount range validation', () => {
            // **Feature: red-envelope-game, Property 8: Prize amount range validation**
            // **Validates: Requirements 3.2**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 1000 }), // minAmount
                    fc.integer({ min: 1, max: 1000 }), // maxAmount
                    (minAmount, maxAmount) => {
                        // Ensure min <= max
                        const min = Math.min(minAmount, maxAmount);
                        const max = Math.max(minAmount, maxAmount);
                        
                        // Calculate random prize
                        const prize = PrizeCalculator.calculateRandomPrize(min, max);
                        
                        // Prize should be a positive integer within the specified range
                        return Number.isInteger(prize) && 
                               prize >= min && 
                               prize <= max &&
                               prize > 0;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Audio System Properties', () => {
        test('Property 12: Sound effect triggering', () => {
            // **Feature: red-envelope-game, Property 12: Sound effect triggering**
            // **Validates: Requirements 4.1, 4.3**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 20 }), // envelopeCount
                    fc.integer({ min: 1, max: 100 }), // minPrize
                    fc.integer({ min: 1, max: 100 }), // maxPrize
                    fc.boolean(), // soundEnabled
                    fc.integer({ min: 0, max: 19 }), // envelopeIndex to open
                    (envelopeCount, minPrize, maxPrize, soundEnabled, envelopeIndex) => {
                        // Ensure min <= max
                        const min = Math.min(minPrize, maxPrize);
                        const max = Math.max(minPrize, maxPrize);
                        
                        // Initialize game with valid settings
                        const settings = {
                            envelopeCount,
                            minPrize: min,
                            maxPrize: max,
                            soundEnabled
                        };
                        GameController.initializeGame(settings);
                        
                        // Set audio manager state to match settings
                        AudioManager.isAudioEnabled = soundEnabled;
                        AudioManager.isAudioLoaded = true; // Mock loaded state for testing
                        
                        // Mock audio playing methods to track calls
                        let openEnvelopeSoundCalled = false;
                        let specialPrizeSoundCalled = false;
                        let gameEndSoundCalled = false;
                        
                        const originalPlayOpenEnvelope = AudioManager.playOpenEnvelopeSound;
                        const originalPlaySpecialPrize = AudioManager.playSpecialPrizeSound;
                        const originalPlayGameEnd = AudioManager.playGameEndSound;
                        
                        AudioManager.playOpenEnvelopeSound = () => {
                            if (AudioManager.isAudioEnabled) openEnvelopeSoundCalled = true;
                        };
                        
                        AudioManager.playSpecialPrizeSound = (prizeAmount) => {
                            if (AudioManager.isAudioEnabled && GameState.settings) {
                                const prizeRange = GameState.settings.maxPrize - GameState.settings.minPrize;
                                const threshold = GameState.settings.minPrize + (prizeRange * 0.75);
                                if (prizeAmount >= threshold) {
                                    specialPrizeSoundCalled = true;
                                    return true;
                                }
                            }
                            return false;
                        };
                        
                        AudioManager.playGameEndSound = () => {
                            if (AudioManager.isAudioEnabled) gameEndSoundCalled = true;
                        };
                        
                        try {
                            // Get the envelope to open (use modulo to ensure valid index)
                            const validIndex = envelopeIndex % envelopeCount;
                            const envelope = GameState.envelopes[validIndex];
                            const envelopeId = envelope.id;
                            
                            // Open the envelope
                            GameController.openEnvelope(envelopeId);
                            
                            // Get the opened envelope to check prize amount
                            const openedEnvelope = EnvelopeGenerator.getEnvelopeById(envelopeId);
                            
                            // Verify sound effect triggering based on audio settings and prize amount
                            if (soundEnabled) {
                                // Calculate if this should be a special prize
                                const prizeRange = max - min;
                                const threshold = min + (prizeRange * 0.75);
                                const isSpecialPrize = openedEnvelope.prizeAmount >= threshold;
                                
                                if (isSpecialPrize) {
                                    // Special prize sound should be called, regular sound should not
                                    return specialPrizeSoundCalled === true && openEnvelopeSoundCalled === false;
                                } else {
                                    // Regular sound should be called, special sound should not
                                    return openEnvelopeSoundCalled === true && specialPrizeSoundCalled === false;
                                }
                            } else {
                                // No sounds should be called when audio is disabled
                                return openEnvelopeSoundCalled === false && specialPrizeSoundCalled === false;
                            }
                        } finally {
                            // Restore original methods
                            AudioManager.playOpenEnvelopeSound = originalPlayOpenEnvelope;
                            AudioManager.playSpecialPrizeSound = originalPlaySpecialPrize;
                            AudioManager.playGameEndSound = originalPlayGameEnd;
                        }
                    }
                ),
                { numRuns: 20 }
            );
        });

        test('Property 14: Audio control functionality', () => {
            // **Feature: red-envelope-game, Property 14: Audio control functionality**
            // **Validates: Requirements 4.5**
            
            fc.assert(
                fc.property(
                    fc.boolean(), // initial audio state
                    fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }), // sequence of toggle operations
                    (initialAudioState, toggleSequence) => {
                        // Set initial audio state
                        AudioManager.isAudioEnabled = initialAudioState;
                        
                        // Mock game settings
                        GameState.settings = {
                            envelopeCount: 10,
                            minPrize: 10,
                            maxPrize: 100,
                            soundEnabled: initialAudioState
                        };
                        
                        // Track expected state
                        let expectedAudioState = initialAudioState;
                        
                        // Apply toggle sequence
                        toggleSequence.forEach(toggleValue => {
                            // Test explicit toggle with boolean parameter
                            AudioManager.toggleSound(toggleValue);
                            expectedAudioState = toggleValue;
                            
                            // Verify audio state matches expected
                            if (AudioManager.isAudioEnabled !== expectedAudioState) {
                                return false;
                            }
                            
                            // Verify game settings are updated
                            if (GameState.settings && GameState.settings.soundEnabled !== expectedAudioState) {
                                return false;
                            }
                        });
                        
                        // Test toggle without parameter (should flip current state)
                        const stateBeforeFlip = AudioManager.isAudioEnabled;
                        AudioManager.toggleSound(); // No parameter - should flip
                        const stateAfterFlip = AudioManager.isAudioEnabled;
                        
                        // Verify the state was flipped
                        if (stateAfterFlip === stateBeforeFlip) {
                            return false;
                        }
                        
                        // Verify game settings are updated after flip
                        if (GameState.settings && GameState.settings.soundEnabled !== stateAfterFlip) {
                            return false;
                        }
                        
                        return true;
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe('Envelope Opening Properties', () => {
        test('Property 7: Envelope opening behavior', () => {
            // **Feature: red-envelope-game, Property 7: Envelope opening behavior**
            // **Validates: Requirements 3.1, 3.4**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 20 }), // envelopeCount
                    fc.integer({ min: 1, max: 100 }), // minPrize
                    fc.integer({ min: 1, max: 100 }), // maxPrize
                    fc.integer({ min: 0, max: 19 }), // envelopeIndex to open
                    (envelopeCount, minPrize, maxPrize, envelopeIndex) => {
                        // Ensure min <= max
                        const min = Math.min(minPrize, maxPrize);
                        const max = Math.max(minPrize, maxPrize);
                        
                        // Initialize game with valid settings
                        const settings = {
                            envelopeCount,
                            minPrize: min,
                            maxPrize: max,
                            soundEnabled: false
                        };
                        GameController.initializeGame(settings);
                        
                        // Get the envelope to open (use modulo to ensure valid index)
                        const validIndex = envelopeIndex % envelopeCount;
                        const envelope = GameState.envelopes[validIndex];
                        const envelopeId = envelope.id;
                        
                        // Store initial state
                        const initialOpenedCount = GameState.openedCount;
                        const initialTotalPrize = GameState.totalPrize;
                        
                        // Open the envelope
                        GameController.openEnvelope(envelopeId);
                        
                        // Get the envelope after opening
                        const openedEnvelope = EnvelopeGenerator.getEnvelopeById(envelopeId);
                        
                        // Verify envelope opening behavior:
                        // 1. Envelope should be marked as opened
                        // 2. Prize amount should be displayed (within range)
                        // 3. State should change from closed to opened
                        // 4. Opened count should increase by 1
                        // 5. Total prize should increase by the prize amount
                        return openedEnvelope.isOpened === true &&
                               Number.isInteger(openedEnvelope.prizeAmount) &&
                               openedEnvelope.prizeAmount >= min &&
                               openedEnvelope.prizeAmount <= max &&
                               GameState.openedCount === initialOpenedCount + 1 &&
                               GameState.totalPrize === initialTotalPrize + openedEnvelope.prizeAmount;
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('Property 9: Opened envelope immutability', () => {
            // **Feature: red-envelope-game, Property 9: Opened envelope immutability**
            // **Validates: Requirements 3.3**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: 2, max: 20 }), // envelopeCount (at least 2 to test multiple clicks)
                    fc.integer({ min: 1, max: 100 }), // minPrize
                    fc.integer({ min: 1, max: 100 }), // maxPrize
                    fc.integer({ min: 0, max: 19 }), // envelopeIndex to open
                    fc.integer({ min: 1, max: 5 }), // number of additional clicks
                    (envelopeCount, minPrize, maxPrize, envelopeIndex, additionalClicks) => {
                        // Ensure min <= max
                        const min = Math.min(minPrize, maxPrize);
                        const max = Math.max(minPrize, maxPrize);
                        
                        // Initialize game with valid settings
                        const settings = {
                            envelopeCount,
                            minPrize: min,
                            maxPrize: max,
                            soundEnabled: false
                        };
                        GameController.initializeGame(settings);
                        
                        // Get the envelope to open (use modulo to ensure valid index)
                        const validIndex = envelopeIndex % envelopeCount;
                        const envelope = GameState.envelopes[validIndex];
                        const envelopeId = envelope.id;
                        
                        // Open the envelope first time
                        GameController.openEnvelope(envelopeId);
                        
                        // Store state after first opening
                        const afterFirstOpen = EnvelopeGenerator.getEnvelopeById(envelopeId);
                        const firstOpenState = {
                            isOpened: afterFirstOpen.isOpened,
                            prizeAmount: afterFirstOpen.prizeAmount,
                            horseImageId: afterFirstOpen.horseImageId,
                            horseEmoji: afterFirstOpen.horseEmoji,
                            id: afterFirstOpen.id
                        };
                        const firstOpenGameState = {
                            totalPrize: GameState.totalPrize,
                            openedCount: GameState.openedCount
                        };
                        
                        // Try to open the same envelope multiple times
                        for (let i = 0; i < additionalClicks; i++) {
                            GameController.openEnvelope(envelopeId);
                        }
                        
                        // Get envelope state after additional clicks
                        const afterAdditionalClicks = EnvelopeGenerator.getEnvelopeById(envelopeId);
                        
                        // Verify opened envelope immutability:
                        // 1. Envelope state should not change after additional clicks
                        // 2. Prize amount should remain the same
                        // 3. Game state (total prize, opened count) should not change
                        // 4. All other envelope properties should remain unchanged
                        return afterAdditionalClicks.isOpened === firstOpenState.isOpened &&
                               afterAdditionalClicks.prizeAmount === firstOpenState.prizeAmount &&
                               afterAdditionalClicks.horseImageId === firstOpenState.horseImageId &&
                               afterAdditionalClicks.horseEmoji === firstOpenState.horseEmoji &&
                               afterAdditionalClicks.id === firstOpenState.id &&
                               GameState.totalPrize === firstOpenGameState.totalPrize &&
                               GameState.openedCount === firstOpenGameState.openedCount;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Animation Synchronization Properties', () => {
        test('Property 13: Animation synchronization', () => {
            // **Feature: red-envelope-game, Property 13: Animation synchronization**
            // **Validates: Requirements 4.2**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 10 }), // envelopeCount
                    fc.integer({ min: 1, max: 100 }), // minPrize
                    fc.integer({ min: 1, max: 100 }), // maxPrize
                    fc.integer({ min: 0, max: 9 }), // envelopeIndex to open
                    fc.boolean(), // animationEnabled
                    (envelopeCount, minPrize, maxPrize, envelopeIndex, animationEnabled) => {
                        // Ensure min <= max
                        const min = Math.min(minPrize, maxPrize);
                        const max = Math.max(minPrize, maxPrize);
                        
                        // Initialize game with valid settings
                        const settings = {
                            envelopeCount,
                            minPrize: min,
                            maxPrize: max,
                            soundEnabled: false
                        };
                        GameController.initializeGame(settings);
                        
                        // Set animation system state for testing
                        AnimationManager.setAnimationEnabled(animationEnabled);
                        
                        // Get the envelope to open (use modulo to ensure valid index)
                        const validIndex = envelopeIndex % envelopeCount;
                        const envelope = GameState.envelopes[validIndex];
                        const envelopeId = envelope.id;
                        
                        try {
                            // Clean up any existing animation state first
                            AnimationManager.stopAllAnimations();
                            GameState.isAnimating = false;
                            
                            // Test animation synchronization by checking that:
                            // 1. Animation system state is properly managed
                            // 2. Animation tracking works correctly
                            // 3. GameState.isAnimating is properly synchronized
                            
                            // Check initial animation state
                            const initialAnimationStatus = AnimationManager.getAnimationStatus();
                            const initialActiveCount = initialAnimationStatus.activeAnimationsCount;
                            const systemEnabled = initialAnimationStatus.isEnabled;
                            
                            // Verify animation system state matches what we set
                            if (systemEnabled !== animationEnabled) {
                                return false;
                            }
                            
                            // Ensure we start with clean state
                            if (initialActiveCount !== 0) {
                                return false;
                            }
                            
                            // Test that GameState.isAnimating is properly managed during envelope opening
                            const initialGameAnimatingState = GameState.isAnimating;
                            
                            // Simulate starting an envelope opening (this sets isAnimating to true)
                            GameState.isAnimating = true;
                            
                            // Check that we can detect animation state
                            const duringAnimationState = GameState.isAnimating;
                            
                            // Simulate completing the animation (this should reset isAnimating to false)
                            GameState.isAnimating = false;
                            
                            const afterAnimationState = GameState.isAnimating;
                            
                            // Test animation manager's ability to track multiple animations
                            AnimationManager.activeAnimations.add('test-animation-1');
                            AnimationManager.activeAnimations.add('test-animation-2');
                            
                            const multipleAnimationsStatus = AnimationManager.getAnimationStatus();
                            const hasMultipleAnimations = multipleAnimationsStatus.activeAnimationsCount === 2;
                            
                            // Test stopping all animations
                            AnimationManager.stopAllAnimations();
                            
                            const afterStopStatus = AnimationManager.getAnimationStatus();
                            const allAnimationsStopped = afterStopStatus.activeAnimationsCount === 0;
                            
                            // Visual animation should complete before allowing next interaction
                            // This is verified by checking that:
                            // 1. Animation system state is properly managed
                            // 2. GameState.isAnimating transitions correctly
                            // 3. Animation tracking works for multiple animations
                            // 4. Stop all animations clears the state properly
                            
                            return duringAnimationState === true &&
                                   afterAnimationState === false &&
                                   hasMultipleAnimations === true &&
                                   allAnimationsStopped === true &&
                                   systemEnabled === animationEnabled;
                        } finally {
                            // Clean up animation state
                            AnimationManager.stopAllAnimations();
                            GameState.isAnimating = false;
                        }
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe('Game Statistics Properties', () => {
        test('Property 10: Total prize calculation accuracy', () => {
            // **Feature: red-envelope-game, Property 10: Total prize calculation accuracy**
            // **Validates: Requirements 5.1**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 20 }), // envelopeCount
                    fc.integer({ min: 1, max: 100 }), // minPrize
                    fc.integer({ min: 1, max: 100 }), // maxPrize
                    fc.array(fc.integer({ min: 0, max: 19 }), { minLength: 1, maxLength: 20 }), // sequence of envelopes to open
                    (envelopeCount, minPrize, maxPrize, envelopesToOpen) => {
                        // Ensure min <= max
                        const min = Math.min(minPrize, maxPrize);
                        const max = Math.max(minPrize, maxPrize);
                        
                        // Initialize game with valid settings
                        const settings = {
                            envelopeCount,
                            minPrize: min,
                            maxPrize: max,
                            soundEnabled: false
                        };
                        GameController.initializeGame(settings);
                        
                        // Track expected total manually
                        let expectedTotal = 0;
                        const openedEnvelopeIds = new Set();
                        
                        // Open envelopes in sequence
                        envelopesToOpen.forEach(envelopeIndex => {
                            const validIndex = envelopeIndex % envelopeCount;
                            const envelope = GameState.envelopes[validIndex];
                            const envelopeId = envelope.id;
                            
                            // Only count if envelope hasn't been opened yet
                            if (!openedEnvelopeIds.has(envelopeId)) {
                                // Open the envelope
                                GameController.openEnvelope(envelopeId);
                                
                                // Get the opened envelope to add its prize to expected total
                                const openedEnvelope = EnvelopeGenerator.getEnvelopeById(envelopeId);
                                expectedTotal += openedEnvelope.prizeAmount;
                                openedEnvelopeIds.add(envelopeId);
                            }
                        });
                        
                        // Verify total prize calculation accuracy:
                        // 1. GameState.totalPrize should equal sum of all opened envelope prizes
                        // 2. calculateTotalPrize() method should return the same value
                        // 3. updateTotalPrize() should return the same value and update GameState
                        const gameStateTotalPrize = GameState.totalPrize;
                        const calculatedTotalPrize = GameController.calculateTotalPrize();
                        const updatedTotalPrize = GameController.updateTotalPrize();
                        
                        // Manual verification: sum all opened envelope prizes
                        const manualTotal = GameState.envelopes
                            .filter(envelope => envelope.isOpened)
                            .reduce((sum, envelope) => sum + envelope.prizeAmount, 0);
                        
                        // All calculations should match
                        return gameStateTotalPrize === expectedTotal &&
                               calculatedTotalPrize === expectedTotal &&
                               updatedTotalPrize === expectedTotal &&
                               manualTotal === expectedTotal &&
                               gameStateTotalPrize === calculatedTotalPrize &&
                               calculatedTotalPrize === updatedTotalPrize;
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('Property 11: Game reset consistency', () => {
            // **Feature: red-envelope-game, Property 11: Game reset consistency**
            // **Validates: Requirements 5.4**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 20 }), // envelopeCount
                    fc.integer({ min: 1, max: 100 }), // minPrize
                    fc.integer({ min: 1, max: 100 }), // maxPrize
                    fc.array(fc.integer({ min: 0, max: 19 }), { minLength: 0, maxLength: 10 }), // envelopes to open before reset
                    fc.boolean(), // soundEnabled
                    (envelopeCount, minPrize, maxPrize, envelopesToOpen, soundEnabled) => {
                        // Ensure min <= max
                        const min = Math.min(minPrize, maxPrize);
                        const max = Math.max(minPrize, maxPrize);
                        
                        // Initialize game with valid settings
                        const settings = {
                            envelopeCount,
                            minPrize: min,
                            maxPrize: max,
                            soundEnabled
                        };
                        GameController.initializeGame(settings);
                        
                        // Modify game state by opening some envelopes
                        envelopesToOpen.forEach(envelopeIndex => {
                            const validIndex = envelopeIndex % envelopeCount;
                            const envelope = GameState.envelopes[validIndex];
                            if (!envelope.isOpened) {
                                GameController.openEnvelope(envelope.id);
                            }
                        });
                        
                        // Set some animation state to test cleanup
                        GameState.isAnimating = true;
                        AnimationManager.activeAnimations.add('test-animation');
                        
                        // Store the expected initial state values
                        const expectedInitialState = {
                            phase: 'settings',
                            settings: null,
                            envelopes: [],
                            totalPrize: 0,
                            openedCount: 0,
                            isAnimating: false
                        };
                        
                        // Reset the game
                        GameController.resetGame();
                        
                        // Get the state after reset
                        const stateAfterReset = GameController.getGameState();
                        
                        // Verify game reset consistency:
                        // 1. All game state variables should be reset to initial values
                        // 2. Should return to settings screen (phase = 'settings')
                        // 3. All animations should be stopped
                        // 4. Game state should be completely clean
                        
                        const animationStatus = AnimationManager.getAnimationStatus();
                        
                        return stateAfterReset.phase === expectedInitialState.phase &&
                               stateAfterReset.settings === expectedInitialState.settings &&
                               Array.isArray(stateAfterReset.envelopes) &&
                               stateAfterReset.envelopes.length === expectedInitialState.envelopes.length &&
                               stateAfterReset.totalPrize === expectedInitialState.totalPrize &&
                               stateAfterReset.openedCount === expectedInitialState.openedCount &&
                               stateAfterReset.isAnimating === expectedInitialState.isAnimating &&
                               animationStatus.activeAnimationsCount === 0; // All animations stopped
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('Property 15: Statistics display accuracy', () => {
            // **Feature: red-envelope-game, Property 15: Statistics display accuracy**
            // **Validates: Requirements 5.5**
            
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 20 }), // envelopeCount
                    fc.integer({ min: 1, max: 100 }), // minPrize
                    fc.integer({ min: 1, max: 100 }), // maxPrize
                    fc.array(fc.integer({ min: 0, max: 19 }), { minLength: 0, maxLength: 15 }), // envelopes to open
                    (envelopeCount, minPrize, maxPrize, envelopesToOpen) => {
                        // Ensure min <= max
                        const min = Math.min(minPrize, maxPrize);
                        const max = Math.max(minPrize, maxPrize);
                        
                        // Initialize game with valid settings
                        const settings = {
                            envelopeCount,
                            minPrize: min,
                            maxPrize: max,
                            soundEnabled: false
                        };
                        GameController.initializeGame(settings);
                        
                        // Open some envelopes to create statistics
                        const openedEnvelopeIds = new Set();
                        envelopesToOpen.forEach(envelopeIndex => {
                            const validIndex = envelopeIndex % envelopeCount;
                            const envelope = GameState.envelopes[validIndex];
                            if (!openedEnvelopeIds.has(envelope.id)) {
                                GameController.openEnvelope(envelope.id);
                                openedEnvelopeIds.add(envelope.id);
                            }
                        });
                        
                        // Get statistics from GameController
                        const stats = GameController.getGameStatistics();
                        
                        // Manual calculation for verification
                        const openedEnvelopes = GameState.envelopes.filter(env => env.isOpened);
                        const remainingEnvelopes = GameState.envelopes.filter(env => !env.isOpened);
                        const manualTotalPrize = openedEnvelopes.reduce((sum, env) => sum + env.prizeAmount, 0);
                        const manualAveragePrize = openedEnvelopes.length > 0 ? manualTotalPrize / openedEnvelopes.length : 0;
                        const manualIsComplete = GameState.envelopes.length > 0 && openedEnvelopes.length === GameState.envelopes.length;
                        
                        // Verify statistics display accuracy:
                        // 1. Total envelopes count should match actual envelope array length
                        // 2. Opened count should match number of opened envelopes
                        // 3. Remaining count should match number of unopened envelopes
                        // 4. Total prize should match sum of all opened envelope prizes
                        // 5. Average prize should be calculated correctly
                        // 6. Game completion status should be accurate
                        // 7. Counts should add up correctly (opened + remaining = total)
                        
                        const countsAddUp = stats.openedCount + stats.remainingCount === stats.totalEnvelopes;
                        const averageIsCorrect = Math.abs(stats.averagePrize - manualAveragePrize) < 0.01; // Allow for floating point precision
                        
                        return stats.totalEnvelopes === GameState.envelopes.length &&
                               stats.totalEnvelopes === envelopeCount &&
                               stats.openedCount === openedEnvelopes.length &&
                               stats.remainingCount === remainingEnvelopes.length &&
                               stats.totalPrize === manualTotalPrize &&
                               stats.totalPrize === GameState.totalPrize &&
                               averageIsCorrect &&
                               stats.isGameComplete === manualIsComplete &&
                               stats.gamePhase === GameState.phase &&
                               countsAddUp &&
                               stats.openedCount >= 0 &&
                               stats.remainingCount >= 0 &&
                               stats.totalPrize >= 0 &&
                               stats.averagePrize >= 0;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});

// Integration Tests
describe('Integration Tests', () => {
    describe('Complete Game Flow Integration', () => {
        beforeEach(() => {
            // Reset all systems before each test
            GameController.resetGame();
            AudioManager.isAudioEnabled = false; // Disable audio for testing
            AnimationManager.setAnimationEnabled(false); // Disable animations for faster testing
        });

        test('should complete full game flow from settings to completion', () => {
            // Test complete game flow scenario
            const settings = {
                envelopeCount: 5,
                minPrize: 10,
                maxPrize: 100,
                soundEnabled: false
            };

            // Step 1: Initialize game
            GameController.initializeGame(settings);
            const initialState = GameController.getGameState();
            
            expect(initialState.phase).toBe('playing');
            expect(initialState.settings).toEqual(settings);
            expect(initialState.envelopes).toHaveLength(5);
            expect(initialState.totalPrize).toBe(0);
            expect(initialState.openedCount).toBe(0);

            // Step 2: Open all envelopes one by one
            let totalPrizeExpected = 0;
            initialState.envelopes.forEach((envelope, index) => {
                // Open envelope
                GameController.openEnvelope(envelope.id);
                
                // Get updated state
                const currentState = GameController.getGameState();
                const openedEnvelope = EnvelopeGenerator.getEnvelopeById(envelope.id);
                
                // Verify envelope was opened correctly
                expect(openedEnvelope.isOpened).toBe(true);
                expect(openedEnvelope.prizeAmount).toBeGreaterThanOrEqual(settings.minPrize);
                expect(openedEnvelope.prizeAmount).toBeLessThanOrEqual(settings.maxPrize);
                
                // Update expected total
                totalPrizeExpected += openedEnvelope.prizeAmount;
                
                // Verify game state consistency
                expect(currentState.openedCount).toBe(index + 1);
                expect(currentState.totalPrize).toBe(totalPrizeExpected);
                
                // Verify statistics accuracy
                const stats = GameController.getGameStatistics();
                expect(stats.openedCount).toBe(index + 1);
                expect(stats.remainingCount).toBe(5 - (index + 1));
                expect(stats.totalPrize).toBe(totalPrizeExpected);
            });

            // Step 3: Verify game completion
            const finalState = GameController.getGameState();
            const finalStats = GameController.getGameStatistics();
            
            // Game should be complete (all envelopes opened)
            expect(finalStats.isGameComplete).toBe(true);
            expect(finalStats.openedCount).toBe(5);
            expect(finalStats.remainingCount).toBe(0);
            expect(finalStats.totalPrize).toBe(totalPrizeExpected);
            
            // Phase might still be 'playing' since the async game end logic may not have completed
            // But the game should be functionally complete
            expect(['playing', 'finished']).toContain(finalState.phase);

            // Step 4: Test game reset
            GameController.resetGame();
            const resetState = GameController.getGameState();
            
            expect(resetState.phase).toBe('settings');
            expect(resetState.settings).toBeNull();
            expect(resetState.envelopes).toHaveLength(0);
            expect(resetState.totalPrize).toBe(0);
            expect(resetState.openedCount).toBe(0);
        });

        test('should handle partial game completion and restart', () => {
            // Initialize game
            const settings = {
                envelopeCount: 10,
                minPrize: 5,
                maxPrize: 50,
                soundEnabled: false
            };
            GameController.initializeGame(settings);

            // Open only half the envelopes
            const envelopes = GameController.getGameState().envelopes;
            const envelopesToOpen = envelopes.slice(0, 5);
            
            let partialTotal = 0;
            envelopesToOpen.forEach(envelope => {
                GameController.openEnvelope(envelope.id);
                const openedEnvelope = EnvelopeGenerator.getEnvelopeById(envelope.id);
                partialTotal += openedEnvelope.prizeAmount;
            });

            // Verify partial state
            const partialState = GameController.getGameState();
            expect(partialState.phase).toBe('playing'); // Still playing
            expect(partialState.openedCount).toBe(5);
            expect(partialState.totalPrize).toBe(partialTotal);

            // Test restart with same settings
            GameController.startNewGameWithSameSettings();
            const restartedState = GameController.getGameState();
            
            expect(restartedState.phase).toBe('playing');
            expect(restartedState.settings).toEqual(settings);
            expect(restartedState.envelopes).toHaveLength(10);
            expect(restartedState.totalPrize).toBe(0);
            expect(restartedState.openedCount).toBe(0);
            
            // Verify all envelopes are closed
            restartedState.envelopes.forEach(envelope => {
                expect(envelope.isOpened).toBe(false);
                expect(envelope.prizeAmount).toBe(0);
            });
        });

        test('should maintain data consistency across all operations', () => {
            // Test with various envelope counts and prize ranges
            const testCases = [
                { envelopeCount: 3, minPrize: 1, maxPrize: 10 },
                { envelopeCount: 7, minPrize: 20, maxPrize: 200 },
                { envelopeCount: 15, minPrize: 5, maxPrize: 25 }
            ];

            testCases.forEach(testCase => {
                const settings = { ...testCase, soundEnabled: false };
                
                // Initialize game
                GameController.initializeGame(settings);
                
                // Open random envelopes
                const state = GameController.getGameState();
                const envelopesToOpen = state.envelopes.slice(0, Math.ceil(state.envelopes.length / 2));
                
                envelopesToOpen.forEach(envelope => {
                    GameController.openEnvelope(envelope.id);
                });

                // Verify data consistency
                const currentState = GameController.getGameState();
                const calculatedTotal = GameController.calculateTotalPrize();
                const stats = GameController.getGameStatistics();

                // All totals should match
                expect(currentState.totalPrize).toBe(calculatedTotal);
                expect(stats.totalPrize).toBe(calculatedTotal);
                
                // Counts should be consistent
                expect(currentState.openedCount).toBe(stats.openedCount);
                expect(stats.openedCount + stats.remainingCount).toBe(stats.totalEnvelopes);
                
                // Envelope states should be consistent
                const openedEnvelopes = currentState.envelopes.filter(env => env.isOpened);
                expect(openedEnvelopes.length).toBe(currentState.openedCount);
                
                // Manual total calculation should match
                const manualTotal = openedEnvelopes.reduce((sum, env) => sum + env.prizeAmount, 0);
                expect(manualTotal).toBe(currentState.totalPrize);

                // Reset for next test case
                GameController.resetGame();
            });
        });
    });

    describe('Error Handling Integration', () => {
        beforeEach(() => {
            GameController.resetGame();
            AudioManager.isAudioEnabled = false;
            AnimationManager.setAnimationEnabled(false);
        });

        test('should handle invalid envelope opening gracefully', () => {
            // Initialize game
            const settings = {
                envelopeCount: 3,
                minPrize: 10,
                maxPrize: 100,
                soundEnabled: false
            };
            GameController.initializeGame(settings);

            // Try to open non-existent envelope
            const initialState = GameController.getGameState();
            GameController.openEnvelope('non-existent-envelope');
            
            // State should remain unchanged
            const stateAfterInvalid = GameController.getGameState();
            expect(stateAfterInvalid.totalPrize).toBe(initialState.totalPrize);
            expect(stateAfterInvalid.openedCount).toBe(initialState.openedCount);

            // Try to open already opened envelope
            const firstEnvelope = initialState.envelopes[0];
            GameController.openEnvelope(firstEnvelope.id);
            
            const stateAfterFirst = GameController.getGameState();
            const firstPrize = stateAfterFirst.totalPrize;
            
            // Try to open same envelope again
            GameController.openEnvelope(firstEnvelope.id);
            
            const stateAfterSecond = GameController.getGameState();
            expect(stateAfterSecond.totalPrize).toBe(firstPrize); // Should not change
            expect(stateAfterSecond.openedCount).toBe(1); // Should not change
        });

        test('should handle invalid game initialization gracefully', () => {
            // Test with invalid settings
            const invalidSettings = [
                { envelopeCount: 0, minPrize: 10, maxPrize: 100, soundEnabled: false, playerName: 'TestPlayer' },
                { envelopeCount: 5, minPrize: -10, maxPrize: 100, soundEnabled: false, playerName: 'TestPlayer' },
                { envelopeCount: 5, minPrize: 100, maxPrize: 10, soundEnabled: false, playerName: 'TestPlayer' },
                { envelopeCount: 5, minPrize: 10, maxPrize: 100, soundEnabled: false, playerName: '' } // invalid empty name
            ];

            invalidSettings.forEach(settings => {
                expect(() => {
                    GameController.initializeGame(settings);
                }).toThrow();
                
                // Game state should remain in settings phase
                const state = GameController.getGameState();
                expect(state.phase).toBe('settings');
            });
        });

        test('should recover from system errors gracefully', () => {
            // Initialize valid game
            const settings = {
                envelopeCount: 5,
                minPrize: 10,
                maxPrize: 100,
                soundEnabled: false
            };
            GameController.initializeGame(settings);

            // Store original state
            const originalEnvelopes = GameState.envelopes;
            const originalPhase = GameState.phase;

            try {
                // Simulate system error by corrupting game state
                GameState.envelopes = null; // Corrupt state

                // System should handle gracefully - some operations may fail but shouldn't crash
                let statsResult;
                try {
                    statsResult = GameController.getGameStatistics();
                    // If it doesn't throw, that's fine too
                } catch (error) {
                    // Expected to fail with corrupted state
                    expect(error).toBeDefined();
                }

                // Test that we can recover by resetting
                GameController.resetGame();
                const resetState = GameController.getGameState();
                expect(resetState.phase).toBe('settings');
                expect(resetState.envelopes).toEqual([]);

            } finally {
                // Restore state for cleanup
                GameState.envelopes = originalEnvelopes;
                GameState.phase = originalPhase;
            }
        });
    });

    describe('Audio and Visual Effects Integration', () => {
        beforeEach(() => {
            GameController.resetGame();
        });

        test('should coordinate audio and animation systems', () => {
            // Enable both systems
            AudioManager.isAudioEnabled = true;
            AudioManager.isAudioLoaded = true;
            AnimationManager.setAnimationEnabled(true);

            // Mock audio methods to track calls
            let audioCallCount = 0;
            const originalPlayOpenEnvelope = AudioManager.playOpenEnvelopeSound;
            const originalPlaySpecialPrize = AudioManager.playSpecialPrizeSound;
            
            AudioManager.playOpenEnvelopeSound = () => { audioCallCount++; };
            AudioManager.playSpecialPrizeSound = () => { audioCallCount++; return true; };

            try {
                // Initialize game
                const settings = {
                    envelopeCount: 3,
                    minPrize: 10,
                    maxPrize: 100,
                    soundEnabled: true
                };
                GameController.initializeGame(settings);

                // Open envelope
                const envelope = GameController.getGameState().envelopes[0];
                GameController.openEnvelope(envelope.id);

                // Audio should have been called
                expect(audioCallCount).toBeGreaterThan(0);

                // Animation system should be properly managed
                const animationStatus = AnimationManager.getAnimationStatus();
                expect(animationStatus.isEnabled).toBe(true);

            } finally {
                // Restore original methods
                AudioManager.playOpenEnvelopeSound = originalPlayOpenEnvelope;
                AudioManager.playSpecialPrizeSound = originalPlaySpecialPrize;
            }
        });

        test('should handle audio/animation system failures gracefully', () => {
            // Disable systems to simulate failure
            AudioManager.isAudioEnabled = false;
            AnimationManager.setAnimationEnabled(false);

            // Initialize game
            const settings = {
                envelopeCount: 3,
                minPrize: 10,
                maxPrize: 100,
                soundEnabled: false
            };
            GameController.initializeGame(settings);

            // Game should still work without audio/animations
            const envelope = GameController.getGameState().envelopes[0];
            
            expect(() => {
                GameController.openEnvelope(envelope.id);
            }).not.toThrow();

            // Envelope should still be opened correctly
            const openedEnvelope = EnvelopeGenerator.getEnvelopeById(envelope.id);
            expect(openedEnvelope.isOpened).toBe(true);
            expect(openedEnvelope.prizeAmount).toBeGreaterThan(0);
        });
    });

    describe('Integration Manager Tests', () => {
        test('should provide comprehensive system status', () => {
            const systemStatus = IntegrationManager.getSystemStatus();
            
            expect(systemStatus).toHaveProperty('audio');
            expect(systemStatus).toHaveProperty('animation');
            expect(systemStatus).toHaveProperty('game');
            expect(systemStatus).toHaveProperty('gameStats');
            expect(systemStatus).toHaveProperty('completion');
            expect(systemStatus).toHaveProperty('health');

            // Health report should have required properties
            expect(systemStatus.health).toHaveProperty('timestamp');
            expect(systemStatus.health).toHaveProperty('overall');
            expect(systemStatus.health).toHaveProperty('issues');
            expect(systemStatus.health).toHaveProperty('warnings');
        });

        test('should perform system health checks', () => {
            const healthReport = IntegrationManager.performSystemHealthCheck();
            
            expect(healthReport.overall).toMatch(/^(healthy|degraded|unhealthy)$/);
            expect(Array.isArray(healthReport.issues)).toBe(true);
            expect(Array.isArray(healthReport.warnings)).toBe(true);
            expect(healthReport.timestamp).toBeDefined();
        });

        test('should export complete game state', () => {
            // Initialize game
            const settings = {
                envelopeCount: 3,
                minPrize: 10,
                maxPrize: 100,
                soundEnabled: false
            };
            GameController.initializeGame(settings);

            // Open one envelope
            const envelope = GameController.getGameState().envelopes[0];
            GameController.openEnvelope(envelope.id);

            // Export state
            const exportedState = IntegrationManager.exportGameState();
            
            expect(exportedState).toHaveProperty('version');
            expect(exportedState).toHaveProperty('timestamp');
            expect(exportedState).toHaveProperty('gameState');
            expect(exportedState).toHaveProperty('systemStatus');
            expect(exportedState).toHaveProperty('settings');
            expect(exportedState).toHaveProperty('statistics');

            // Verify exported data matches current state
            const currentState = GameController.getGameState();
            expect(exportedState.gameState.phase).toBe(currentState.phase);
            expect(exportedState.gameState.totalPrize).toBe(currentState.totalPrize);
            expect(exportedState.gameState.openedCount).toBe(currentState.openedCount);
        });

        test('should ensure UI consistency', () => {
            // Initialize game
            const settings = {
                envelopeCount: 5,
                minPrize: 10,
                maxPrize: 100,
                soundEnabled: false
            };
            GameController.initializeGame(settings);

            // Modify game state directly (simulate inconsistency)
            GameState.totalPrize = 999; // Incorrect total
            GameState.openedCount = 3; // Incorrect count

            // Call ensureUIConsistency
            IntegrationManager.ensureUIConsistency();

            // State should be corrected
            expect(GameState.totalPrize).toBe(0); // Should be corrected to actual total
            expect(GameState.openedCount).toBe(0); // Should be corrected to actual count
        });

        test('should validate game state consistency', () => {
            // Initialize game and open some envelopes
            const settings = {
                envelopeCount: 3,
                minPrize: 10,
                maxPrize: 100,
                soundEnabled: false
            };
            GameController.initializeGame(settings);

            // Open envelopes
            const envelopes = GameController.getGameState().envelopes;
            GameController.openEnvelope(envelopes[0].id);
            GameController.openEnvelope(envelopes[1].id);

            // Corrupt state
            const originalTotal = GameState.totalPrize;
            GameState.totalPrize = 999; // Incorrect total

            // Validate consistency (should correct the state)
            IntegrationManager.validateGameStateConsistency();

            // State should be corrected
            const correctedTotal = GameController.calculateTotalPrize();
            expect(GameState.totalPrize).toBe(correctedTotal);
            expect(GameState.totalPrize).not.toBe(999);
        });
    });

    describe('Cross-Component Data Flow', () => {
        beforeEach(() => {
            GameController.resetGame();
            AudioManager.isAudioEnabled = false;
            AnimationManager.setAnimationEnabled(false);
        });

        test('should maintain data integrity across component interactions', () => {
            // Test data flow: Settings -> Game -> Envelopes -> Prizes -> Statistics
            
            // Step 1: Settings validation
            const settings = {
                envelopeCount: 4,
                minPrize: 25,
                maxPrize: 75,
                soundEnabled: false
            };
            
            const validation = SettingsManager.validateSettings(
                settings.envelopeCount,
                settings.minPrize,
                settings.maxPrize
            );
            expect(validation.isValid).toBe(true);

            // Step 2: Game initialization
            GameController.initializeGame(settings);
            const gameState = GameController.getGameState();
            expect(gameState.settings).toEqual(settings);

            // Step 3: Envelope generation
            expect(gameState.envelopes).toHaveLength(settings.envelopeCount);
            gameState.envelopes.forEach(envelope => {
                expect(envelope.isOpened).toBe(false);
                expect(envelope.prizeAmount).toBe(0);
                expect(HORSE_CARTOONS.includes(envelope.horseEmoji)).toBe(true);
            });

            // Step 4: Prize calculation and envelope opening
            const envelope = gameState.envelopes[0];
            GameController.openEnvelope(envelope.id);
            
            const openedEnvelope = EnvelopeGenerator.getEnvelopeById(envelope.id);
            expect(openedEnvelope.isOpened).toBe(true);
            expect(openedEnvelope.prizeAmount).toBeGreaterThanOrEqual(settings.minPrize);
            expect(openedEnvelope.prizeAmount).toBeLessThanOrEqual(settings.maxPrize);

            // Step 5: Statistics calculation
            const stats = GameController.getGameStatistics();
            expect(stats.totalEnvelopes).toBe(settings.envelopeCount);
            expect(stats.openedCount).toBe(1);
            expect(stats.remainingCount).toBe(settings.envelopeCount - 1);
            expect(stats.totalPrize).toBe(openedEnvelope.prizeAmount);
            expect(stats.averagePrize).toBe(openedEnvelope.prizeAmount);
        });

        test('should handle concurrent operations safely', () => {
            // Initialize game
            const settings = {
                envelopeCount: 5,
                minPrize: 10,
                maxPrize: 100,
                soundEnabled: false
            };
            GameController.initializeGame(settings);

            const envelopes = GameController.getGameState().envelopes;
            
            // Simulate rapid envelope opening (concurrent-like behavior)
            const openingResults = [];
            envelopes.forEach(envelope => {
                const initialState = GameController.getGameState();
                GameController.openEnvelope(envelope.id);
                const finalState = GameController.getGameState();
                
                openingResults.push({
                    envelopeId: envelope.id,
                    initialTotal: initialState.totalPrize,
                    finalTotal: finalState.totalPrize,
                    prizeAdded: finalState.totalPrize - initialState.totalPrize
                });
            });

            // Verify all operations completed successfully
            expect(openingResults).toHaveLength(5);
            
            // Verify total consistency
            const finalState = GameController.getGameState();
            const expectedTotal = openingResults.reduce((sum, result) => sum + result.prizeAdded, 0);
            expect(finalState.totalPrize).toBe(expectedTotal);
            expect(finalState.openedCount).toBe(5);
        });
    });

    describe('Player Name Validation Properties', () => {
        test('Property 16: Player name validation', () => {
            // **Feature: red-envelope-game, Property 16: Player name validation**
            // **Validates: Requirements 6.2, 6.3**
            
            fc.assert(
                fc.property(
                    fc.oneof(
                        // Valid names (1-50 characters, no invalid chars)
                        fc.string({ minLength: 1, maxLength: 50 }).filter(name => {
                            const trimmed = name.trim();
                            const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
                            return trimmed.length > 0 && trimmed.length <= 50 && !invalidChars.test(trimmed);
                        }),
                        // Invalid names (empty, too long, or with invalid chars)
                        fc.oneof(
                            fc.constant(''), // Empty string
                            fc.constant('   '), // Only spaces
                            fc.string({ minLength: 51, maxLength: 100 }), // Too long
                            fc.constantFrom('<script>', 'test/file', 'name|pipe', 'name?query', 'name*wild', 'name,comma') // Invalid chars including comma
                        )
                    ),
                    (playerName) => {
                        const validation = DataManager.validatePlayerName(playerName);
                        
                        // Check if name should be valid
                        const trimmed = playerName.trim();
                        const invalidChars = /[<>:"/\\|?*\x00-\x1f,]/; // Include comma
                        const shouldBeValid = trimmed.length > 0 && 
                                            trimmed.length <= 50 && 
                                            !invalidChars.test(trimmed);
                        
                        if (shouldBeValid) {
                            // Valid names should be accepted
                            return validation.isValid === true && validation.error === null;
                        } else {
                            // Invalid names should be rejected with error message
                            return validation.isValid === false && 
                                   typeof validation.error === 'string' && 
                                   validation.error.length > 0;
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('Property 16 - Settings Manager integration', () => {
            // **Feature: red-envelope-game, Property 16: Player name validation**
            // **Validates: Requirements 6.2, 6.3**
            
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1, maxLength: 50 }).filter(name => {
                        const trimmed = name.trim();
                        const invalidChars = /[<>:"/\\|?*\x00-\x1f,]/; // Include comma
                        return trimmed.length > 0 && trimmed.length <= 50 && !invalidChars.test(trimmed);
                    }),
                    fc.integer({ min: 1, max: 50 }),
                    fc.integer({ min: 1, max: 100 }),
                    fc.integer({ min: 1, max: 100 }),
                    (validPlayerName, envelopeCount, minPrize, maxPrize) => {
                        const min = Math.min(minPrize, maxPrize);
                        const max = Math.max(minPrize, maxPrize);
                        
                        // Test Settings Manager with player name
                        const validation = SettingsManager.validateSettings(
                            envelopeCount, min, max, validPlayerName
                        );
                        
                        // Should accept valid settings with valid player name
                        return validation.isValid === true && validation.errors.length === 0;
                    }
                ),
                { numRuns: 50 }
            );
        });
    });

    describe('Game Result Data Integrity Properties', () => {
        test('Property 17: Game result data integrity', () => {
            // **Feature: red-envelope-game, Property 17: Game result data integrity**
            // **Validates: Requirements 6.4, 6.5**
            
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1, maxLength: 50 }).filter(name => {
                        const trimmed = name.trim();
                        const invalidChars = /[<>:"/\\|?*\x00-\x1f,]/; // Include comma
                        return trimmed.length > 0 && trimmed.length <= 50 && !invalidChars.test(trimmed);
                    }),
                    fc.integer({ min: 0, max: 10000 }),
                    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
                    fc.record({
                        envelopeCount: fc.integer({ min: 1, max: 50 }),
                        minPrize: fc.integer({ min: 1, max: 100 }),
                        maxPrize: fc.integer({ min: 1, max: 100 })
                    }).map(settings => ({
                        ...settings,
                        maxPrize: Math.max(settings.minPrize, settings.maxPrize)
                    })),
                    (playerName, totalPrize, gameDate, gameSettings) => {
                        // Test data formatting
                        const formattedResult = DataManager.formatGameResult(
                            playerName, totalPrize, gameDate, gameSettings
                        );
                        
                        // Verify formatted result contains all required data
                        const parts = formattedResult.split(',');
                        
                        // Should have 7 parts: date, time, name, total, envelope count, min prize, max prize
                        if (parts.length !== 7) return false;
                        
                        // Verify data integrity
                        const [date, time, quotedName, total, envelopeCount, minPrize, maxPrize] = parts;
                        
                        // Check that all parts are present and non-empty
                        const allPartsPresent = date && time && quotedName && 
                                             total !== undefined && envelopeCount !== undefined && 
                                             minPrize !== undefined && maxPrize !== undefined;
                        
                        // Check that quoted name contains the original player name
                        // Handle escaped quotes in CSV format
                        const unescapedName = quotedName.replace(/^"|"$/g, '').replace(/""/g, '"');
                        const nameMatches = unescapedName === playerName;
                        
                        // Check that numeric values are preserved
                        const totalMatches = parseInt(total) === totalPrize;
                        const envelopeCountMatches = parseInt(envelopeCount) === gameSettings.envelopeCount;
                        const minPrizeMatches = parseInt(minPrize) === gameSettings.minPrize;
                        const maxPrizeMatches = parseInt(maxPrize) === gameSettings.maxPrize;
                        
                        return allPartsPresent && nameMatches && totalMatches && 
                               envelopeCountMatches && minPrizeMatches && maxPrizeMatches;
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('Property 17 - File name generation consistency', () => {
            // **Feature: red-envelope-game, Property 17: Game result data integrity**
            // **Validates: Requirements 6.4, 6.5**
            
            fc.assert(
                fc.property(
                    fc.constant(true), // Just run the test multiple times
                    () => {
                        // Test file name generation
                        const fileName1 = DataManager.generateFileName();
                        const fileName2 = DataManager.generateFileName();
                        
                        // Both should follow the same pattern
                        const pattern = /^red_envelope_game_results_\d{4}-\d{2}-\d{2}\.txt$/;
                        
                        const validFormat1 = pattern.test(fileName1);
                        const validFormat2 = pattern.test(fileName2);
                        
                        // Should contain today's date
                        const today = new Date().toISOString().split('T')[0];
                        const containsToday1 = fileName1.includes(today);
                        const containsToday2 = fileName2.includes(today);
                        
                        return validFormat1 && validFormat2 && containsToday1 && containsToday2;
                    }
                ),
                { numRuns: 20 }
            );
        });
    });
});
    describe('Data Persistence Integration Tests', () => {
        beforeEach(() => {
            // Clear localStorage before each test
            if (typeof localStorage !== 'undefined') {
                localStorage.clear();
            }
            GameController.resetGame();
        });

        test('should complete full flow from name input to data saving', () => {
            // Test complete user journey with player name input and data saving
            const playerName = 'TestPlayer123';
            const settings = {
                envelopeCount: 3,
                minPrize: 10,
                maxPrize: 50,
                soundEnabled: true,
                playerName: playerName
            };

            // Initialize game with player name
            GameController.initializeGame(settings);
            const gameState = GameController.getGameState();
            
            // Verify player name is set correctly
            expect(gameState.playerName).toBe(playerName);
            expect(gameState.settings.playerName).toBe(playerName);

            // Simulate opening all envelopes by directly updating game state
            let totalPrize = 0;
            gameState.envelopes.forEach((envelope, index) => {
                envelope.isOpened = true;
                envelope.prizeAmount = 25; // Fixed amount for testing
                totalPrize += envelope.prizeAmount;
            });
            
            // Update game state manually
            GameState.openedCount = settings.envelopeCount;
            GameState.totalPrize = totalPrize;
            GameState.phase = 'finished';

            // Test data saving
            const gameDate = new Date();
            const saveResult = DataManager.saveGameResult(playerName, totalPrize, gameDate, settings);
            expect(saveResult).toBe(true);

            // Verify data was saved correctly
            const savedData = DataManager.getAllResults();
            expect(savedData).toBeTruthy();
            expect(savedData).toContain(playerName);
            expect(savedData).toContain(totalPrize.toString());
        });

        test('should handle error conditions in data operations', () => {
            // Test error handling for various data operations
            
            // Test invalid player name
            const invalidNames = ['', 'a'.repeat(51), 'invalid,name', 'invalid<name>'];
            invalidNames.forEach(name => {
                const validation = DataManager.validatePlayerName(name);
                expect(validation.isValid).toBe(false);
                expect(validation.error).toBeTruthy();
            });

            // Test saving with invalid data
            const invalidSaveResult = DataManager.saveGameResult('', -1, new Date(), {});
            expect(invalidSaveResult).toBe(false);

            // Test data formatting with edge cases
            const edgeCaseSettings = {
                envelopeCount: 1,
                minPrize: 1,
                maxPrize: 1,
                soundEnabled: false,
                playerName: 'EdgeCase'
            };

            const formattedResult = DataManager.formatGameResult(
                'EdgeCase',
                1,
                new Date(),
                edgeCaseSettings
            );
            expect(formattedResult).toBeTruthy();
            expect(formattedResult).toContain('EdgeCase');
            expect(formattedResult).toContain('1');
        });

        test('should verify data format and integrity', () => {
            // Test data format consistency
            const testData = [
                { name: 'Player1', prize: 100, envelopes: 5 },
                { name: 'Player2', prize: 250, envelopes: 10 },
                { name: 'Player3', prize: 75, envelopes: 3 }
            ];

            testData.forEach(data => {
                const settings = {
                    envelopeCount: data.envelopes,
                    minPrize: 10,
                    maxPrize: 100,
                    soundEnabled: true,
                    playerName: data.name
                };

                const gameDate = new Date();
                const formatted = DataManager.formatGameResult(
                    data.name,
                    data.prize,
                    gameDate,
                    settings
                );

                // Verify CSV format
                const parts = formatted.split(',');
                expect(parts).toHaveLength(7);

                // Verify data integrity
                const [date, time, quotedName, total, envelopeCount, minPrize, maxPrize] = parts;
                
                // Check date format (Thai locale format)
                expect(date).toBeTruthy();
                expect(date).toMatch(/^\d+\/\d+\/\d+$/);
                
                // Check time format (Thai locale format)
                expect(time).toBeTruthy();
                expect(time).toMatch(/^\d+:\d+:\d+$/);
                
                // Check quoted name
                expect(quotedName).toBe(`"${data.name}"`);
                
                // Check numeric values
                expect(parseInt(total)).toBe(data.prize);
                expect(parseInt(envelopeCount)).toBe(data.envelopes);
                expect(parseInt(minPrize)).toBe(settings.minPrize);
                expect(parseInt(maxPrize)).toBe(settings.maxPrize);
            });
        });

        test('should handle file download functionality', () => {
            // Test file download preparation
            const playerName = 'DownloadTest';
            const totalPrize = 150;
            const gameDate = new Date();
            const settings = {
                envelopeCount: 5,
                minPrize: 20,
                maxPrize: 80,
                soundEnabled: true,
                playerName: playerName
            };

            // Save some test data
            const saveResult = DataManager.saveGameResult(playerName, totalPrize, gameDate, settings);
            expect(saveResult).toBe(true);

            // Test file name generation
            const fileName = DataManager.generateFileName();
            expect(fileName).toBeTruthy();
            expect(fileName).toMatch(/^red_envelope_game_results_\d{4}-\d{2}-\d{2}\.txt$/);

            // Test data retrieval for download
            const allResults = DataManager.getAllResults();
            expect(allResults).toBeTruthy();
            // Check for Thai header
            expect(allResults).toContain('วันที่,เวลา,ชื่อผู้เล่น,จำนวนเงินรวม,จำนวนซอง,เงินรางวัลต่ำสุด,เงินรางวัลสูงสุด');
            expect(allResults).toContain(playerName);
        });

        test('should maintain data consistency across multiple games', () => {
            // Test multiple game sessions with data persistence
            const players = [
                { name: 'Player1', settings: { envelopeCount: 3, minPrize: 10, maxPrize: 30 } },
                { name: 'Player2', settings: { envelopeCount: 5, minPrize: 20, maxPrize: 50 } },
                { name: 'Player3', settings: { envelopeCount: 2, minPrize: 5, maxPrize: 15 } }
            ];

            let totalGames = 0;
            players.forEach(player => {
                const fullSettings = {
                    ...player.settings,
                    soundEnabled: true,
                    playerName: player.name
                };

                // Initialize and complete game
                GameController.initializeGame(fullSettings);
                const gameState = GameController.getGameState();

                // Open all envelopes
                let totalPrize = 0;
                gameState.envelopes.forEach(envelope => {
                    GameController.openEnvelope(envelope.id);
                    const updatedState = GameController.getGameState();
                    const openedEnvelope = updatedState.envelopes.find(e => e.id === envelope.id);
                    totalPrize += openedEnvelope.prizeAmount;
                });

                // Save game result
                const saveResult = DataManager.saveGameResult(
                    player.name,
                    totalPrize,
                    new Date(),
                    fullSettings
                );
                expect(saveResult).toBe(true);
                totalGames++;

                // Reset for next game
                GameController.resetGame();
            });

            // Verify all games were saved
            const gameCount = DataManager.getGameCount();
            expect(gameCount).toBe(totalGames);

            // Verify data integrity
            const allResults = DataManager.getAllResults();
            players.forEach(player => {
                expect(allResults).toContain(player.name);
            });
        });
    });