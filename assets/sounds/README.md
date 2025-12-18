# Audio Assets for Red Envelope Game

This directory contains the audio files used in the Red Envelope Game.

## Required Audio Files

### envelope-open.mp3
- **Purpose**: Sound effect played when opening an envelope
- **Duration**: ~0.3 seconds
- **Description**: A pleasant "pop" or "whoosh" sound
- **Format**: MP3, 44.1kHz, stereo or mono
- **Volume**: Moderate level, not too loud

### special-prize.mp3
- **Purpose**: Sound effect for high-value prizes (top 25% of prize range)
- **Duration**: ~0.5-0.8 seconds
- **Description**: Celebratory sound, like coins jingling or a small fanfare
- **Format**: MP3, 44.1kHz, stereo or mono
- **Volume**: Slightly louder than envelope-open sound

### game-end.mp3
- **Purpose**: Sound effect when all envelopes are opened
- **Duration**: ~1.0-1.5 seconds
- **Description**: Triumphant completion sound, like a victory fanfare
- **Format**: MP3, 44.1kHz, stereo or mono
- **Volume**: Moderate level, celebratory but not overwhelming

### background.mp3 (Optional)
- **Purpose**: Background music during gameplay
- **Duration**: Loop-able track, 30-60 seconds
- **Description**: Light, festive music suitable for Chinese New Year theme
- **Format**: MP3, 44.1kHz, stereo
- **Volume**: Low level, should not interfere with sound effects

## Fallback System

If audio files are not found, the game will automatically generate synthetic sound effects using Web Audio API:

- **Envelope Open**: Multi-harmonic tone with quick decay
- **Special Prize**: Ascending frequency sweep with sparkle effects
- **Game End**: Triumphant chord progression (C major)

## Implementation Notes

- All audio files are loaded asynchronously when the game starts
- The game gracefully handles missing audio files
- Audio can be toggled on/off by the user
- Browser autoplay policies are respected