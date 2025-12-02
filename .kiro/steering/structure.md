# Project Structure

## File Organization

```
/
├── index.html          # Main HTML file with game container and UI
├── game.js             # Complete game implementation
├── style.css           # All styling for UI and game container
├── kiro-logo.png       # Player sprite asset
└── .kiro/
    └── steering/       # AI assistant guidance files
```

## Code Organization (game.js)

The game code follows a top-down structure:

1. **Configuration** - `CONFIG` object with all game constants
2. **Game State** - `game` object holding runtime state
3. **Constants** - `POWERS` and `ENEMY_TYPES` definitions
4. **Classes** - Game entity classes (Player, Enemy, Platform, etc.)
5. **Helper Functions** - Particle creation, effects
6. **Initialization** - `init()` function and event setup
7. **Level Creation** - `createLevel()` with platform/enemy placement
8. **Game Loop** - `gameLoop()` with update/render cycle
9. **UI Functions** - Score, lives, power indicator updates
10. **Game State Management** - End game, level complete, restart

## Conventions

- **Naming**: PascalCase for classes, camelCase for functions/variables, UPPER_CASE for constants
- **Coordinates**: Top-left origin (0,0), positive X right, positive Y down
- **Colors**: Hex codes stored in CONFIG.colors
- **Timing**: Frame-based (60 FPS target), cooldowns in frames
- **Collision**: All entities have x, y, width, height properties
- **State Management**: Boolean flags (dead, frozen, collected, active)

## UI Structure (index.html)

- `#game-container` - Main wrapper
- `#ui` - Top bar with score, lives, power indicator
- `#gameCanvas` - Canvas element for game rendering
- `#game-over` - Modal overlay for game over state
- `#level-complete` - Modal overlay for level completion
- `#controls` - Bottom bar with control instructions

## Styling Approach (style.css)

- Dark theme with purple accents
- Flexbox for UI layout
- Absolute positioning for overlays
- Pixel-perfect rendering with `image-rendering: pixelated`
- Smooth transitions on interactive elements
