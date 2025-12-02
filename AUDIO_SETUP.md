# Background Music Setup

## Audio File Requirement

The game expects a background music file named `background-music.mp3` in the root directory.

## Setup Instructions

1. Place your background music file in the root directory
2. Name it `background-music.mp3` (or update the filename in `game.js` AudioManager.init())
3. Supported formats: MP3, OGG, WAV (MP3 recommended for browser compatibility)

## Features

- **Automatic Loading**: Music loads when the game initializes
- **Autoplay Handling**: Music starts on first user interaction (keyboard input)
- **Seamless Looping**: Music loops continuously during gameplay
- **Pause/Resume**: Press 'P' to pause/unpause the game and music
- **Graceful Failure**: Game continues normally if audio file is missing

## Testing Without Audio

The game will work perfectly without the audio file. You'll see a console warning:
```
Background music failed to load
```

This is expected behavior and the game will continue to function normally.

## Recommended Audio Specifications

- **Format**: MP3
- **Duration**: 30-120 seconds (will loop)
- **Bitrate**: 128-192 kbps
- **Volume**: Normalized to avoid clipping
- **Style**: Upbeat, retro game music that matches the platformer theme
