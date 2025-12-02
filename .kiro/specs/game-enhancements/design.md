# Design Document: Game Enhancements

## Overview

This design document outlines the implementation of score persistence and visual effects enhancements for Super Kiro World. The enhancements will add a save system using browser local storage to track high scores across sessions, and implement four distinct visual effect systems: trail particles that follow Kiro during movement, explosion effects for collision feedback, confetti celebrations for new high scores, and death animations for life loss events.

The design integrates seamlessly with the existing game architecture, leveraging the current particle system and extending it with new particle types and behaviors. All enhancements maintain the game's visual identity using Kiro brand colors and the established dark theme aesthetic.

## Architecture

### High-Level Structure

The enhancements follow the existing game architecture pattern:

1. **Storage Layer**: LocalStorage wrapper for persistent data management
2. **Particle System Extensions**: New particle types and generators for visual effects
3. **Game State Integration**: Hooks into existing game events (movement, collision, scoring, death)
4. **UI Updates**: Extended UI to display high scores

### Component Interaction Flow

```
Player Movement → Trail Particle Generator → Particle System → Renderer
Player Collision → Explosion Effect Generator → Particle System → Renderer
Score Update → High Score Check → Confetti Generator (if new high) → Particle System
Player Death → Death Animation Controller → Visual Effects → Respawn Logic
Game End → Score Persistence → LocalStorage
Game Init → Score Retrieval → LocalStorage → UI Update
```

## Components and Interfaces

### 1. Storage Manager

**Purpose**: Handle all persistent data operations using browser LocalStorage

**Interface**:
```javascript
const StorageManager = {
    saveHighScore(score),
    getHighScore(),
    isLocalStorageAvailable()
}
```

**Responsibilities**:
- Save current score to local storage when game ends
- Retrieve high score on game initialization
- Handle localStorage unavailability gracefully
- Validate and sanitize stored data

### 2. Trail Particle System

**Purpose**: Generate particles that follow Kiro during movement

**New Class**: `TrailParticle extends Particle`

**Properties**:
- Position (x, y)
- Velocity (minimal, mostly stationary)
- Life (shorter than standard particles, ~20 frames)
- Color (matches current power-up)
- Size (smaller than standard particles)
- Opacity (fades from 1 to 0)

**Generation Logic**:
- Triggered every 3-5 frames during player movement
- Spawned at player's center position
- Color determined by `game.player.power.color`
- No generation when player is stationary or game is paused

### 3. Explosion Effect System

**Purpose**: Create visual feedback for harmful collisions

**New Function**: `createExplosionEffect(x, y, color)`

**Behavior**:
- Generates 15-20 particles radiating outward from collision point
- Particles have higher initial velocity than standard particles
- Uses orange/red colors for enemy collisions, custom colors for hazards
- Particles affected by gravity for realistic arc motion
- Triggered on:
  - Enemy collision (when not absorbing)
  - Fall into pit/hazard
  - Damage events

### 4. Confetti Effect System

**Purpose**: Celebrate new high score achievements

**New Class**: `ConfettiParticle extends Particle`

**Properties**:
- Position (spawned across top of screen)
- Velocity (downward with horizontal drift)
- Gravity (affected by game gravity)
- Color (random from palette: purple, gold, white, pink)
- Size (larger than trail particles)
- Rotation (spinning effect)
- Life (longer duration, ~120 frames)

**Generation Logic**:
- Triggered immediately when `currentScore > highScore`
- Spawns 30-50 particles across screen width
- Particles fall with gravity and horizontal drift
- Removed when falling below screen bounds

### 5. Death Animation System

**Purpose**: Provide smooth visual transition when losing a life

**New Properties on Player**:
- `isDying` (boolean flag)
- `deathAnimationTimer` (frame counter)

**Animation Sequence**:
1. Set `isDying = true`, freeze player input
2. Play visual effects (fade out, rotation, particle burst)
3. Duration: 60 frames (1 second at 60fps)
4. On completion: reset player position, restore control

**Visual Effects**:
- Fade player opacity from 1 to 0
- Rotate player sprite
- Emit particle burst at death location
- Optional: screen shake effect

### 6. UI Extensions

**New UI Elements**:
- High score display in top UI bar
- Visual indicator when new high score is achieved (pulsing effect)

**Updates Required**:
- Modify `#ui` div to include high score
- Add CSS for high score styling
- Create `updateHighScoreUI()` function

### 7. Background Music System

**Purpose**: Provide continuous looping background music during gameplay

**New Component**: `AudioManager`

**Interface**:
```javascript
const AudioManager = {
    bgMusic: null,           // Audio element
    isLoaded: boolean,
    init(),
    play(),
    pause(),
    resume(),
    setLoop(boolean)
}
```

**Properties**:
- Audio element reference
- Loading state flag
- Playing state flag
- Error state flag

**Behavior**:
- Load audio file on game initialization
- Start playback when game begins
- Loop seamlessly when track ends
- Pause/resume with game state
- Handle loading failures gracefully without blocking gameplay

**Integration Points**:
- Initialize in `init()` function
- Start playback on first user interaction (browser autoplay policy)
- Pause in game pause handler
- Resume in game resume handler
- Continue playing during level transitions

## Data Models

### LocalStorage Schema

```javascript
{
    "superKiroWorld_highScore": number  // Integer score value
}
```

**Key**: `"superKiroWorld_highScore"`
**Value**: Integer representing the highest score achieved
**Default**: 0 (when no data exists)

### Particle Type Extensions

**TrailParticle**:
```javascript
{
    x: number,
    y: number,
    velocityX: number,  // Near zero
    velocityY: number,  // Near zero
    life: number,       // 15-20 frames
    color: string,      // Hex color from power
    size: number,       // 2-4 pixels
    opacity: number     // 1.0 to 0.0
}
```

**ConfettiParticle**:
```javascript
{
    x: number,
    y: number,
    velocityX: number,  // -2 to 2
    velocityY: number,  // 1 to 3 (downward)
    life: number,       // 120 frames
    color: string,      // Random from palette
    size: number,       // 4-8 pixels
    rotation: number,   // 0 to 2π
    rotationSpeed: number  // Radians per frame
}
```

### Player State Extensions

```javascript
Player {
    // ... existing properties
    isDying: boolean,
    deathAnimationTimer: number,
    trailSpawnCounter: number  // Throttle trail generation
}
```

### Game State Extensions

```javascript
game {
    // ... existing properties
    highScore: number,
    newHighScoreAchieved: boolean  // Flag for confetti trigger
}
```

### Audio Data Model

```javascript
AudioManager {
    bgMusic: HTMLAudioElement,
    isLoaded: boolean,
    hasError: boolean
}
```

**Audio File**:
- Format: MP3 or OGG (browser compatible)
- Location: Root directory or `/assets/` folder
- Filename: `background-music.mp3`
- Loop: Enabled via `loop` attribute


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Score Persistence Properties

**Property 1: Score persistence on game end**
*For any* valid game score, when the game session ends, querying localStorage should return that score value.
**Validates: Requirements 1.1**

**Property 2: High score retrieval on initialization**
*For any* stored high score value in localStorage, initializing the game should load and display that value in the UI.
**Validates: Requirements 1.2**

**Property 3: High score update when exceeded**
*For any* pair of scores where current score > stored high score, the system should update localStorage with the new high score.
**Validates: Requirements 1.3**

**Property 4: UI displays both scores**
*For any* game state, the UI should contain both current score and high score elements with their respective values.
**Validates: Requirements 1.5**

### Trail Particle Properties

**Property 5: Trail generation during movement**
*For any* player movement state (velocityX ≠ 0 or velocityY ≠ 0), the system should generate trail particles at the player's position.
**Validates: Requirements 2.1**

**Property 6: Trail particle opacity decay**
*For any* trail particle, updating it should decrease its opacity, and opacity should reach zero within its lifetime.
**Validates: Requirements 2.2**

**Property 7: Trail particle cleanup**
*For any* particle with life ≤ 0, it should be removed from the game.particles array.
**Validates: Requirements 2.3**

**Property 8: Trail color matches power**
*For any* power-up state, newly generated trail particles should have a color matching the current power's color.
**Validates: Requirements 2.4**

### Explosion Effect Properties

**Property 9: Explosion on enemy collision**
*For any* collision between player and enemy (without absorption), an explosion effect should be created at the collision coordinates.
**Validates: Requirements 3.1**

**Property 10: Explosion particle structure**
*For any* explosion effect created, it should generate multiple particles (15-20) with outward velocities from the origin point.
**Validates: Requirements 3.3**

**Property 11: Explosion particle cleanup**
*For any* explosion particle, when its life reaches zero, it should be removed from the rendering queue.
**Validates: Requirements 3.4**

### Confetti Effect Properties

**Property 12: Confetti trigger on new high score**
*For any* score update where newScore > currentHighScore, a confetti effect should be triggered immediately.
**Validates: Requirements 4.1**

**Property 13: Confetti particle generation**
*For any* confetti effect triggered, it should generate multiple colorful particles (30-50) distributed across the screen width.
**Validates: Requirements 4.2**

**Property 14: Confetti physics**
*For any* confetti particle, it should have downward velocity and be affected by gravity on each update.
**Validates: Requirements 4.3**

**Property 15: Confetti cleanup by position**
*For any* confetti particle where y > screen height, it should be removed from the particles array.
**Validates: Requirements 4.4**

### Death Animation Properties

**Property 16: Death animation before respawn**
*For any* life loss event (lives > 0), the death animation should complete before the player respawns.
**Validates: Requirements 5.1**

**Property 17: Input blocking during death**
*For any* frame where the death animation is active (isDying = true), player input should not affect player velocity or position.
**Validates: Requirements 5.2**

**Property 18: Respawn position after death**
*For any* death animation completion, the player's position should be reset to the designated spawn coordinates.
**Validates: Requirements 5.4**

**Property 19: Death animation before game over**
*For any* life loss event where lives = 0, the death animation should complete before the game over screen is displayed.
**Validates: Requirements 5.5**

### Background Music Properties

**Property 20: Music loading on initialization**
*For any* game initialization, the AudioManager should attempt to load the background music file.
**Validates: Requirements 6.1**

**Property 21: Music playback during gameplay**
*For any* active game state (not paused, not game over), the background music should be playing.
**Validates: Requirements 6.2**

**Property 22: Music looping**
*For any* background music track that reaches its end, it should automatically restart from the beginning.
**Validates: Requirements 6.3**

**Property 23: Music pause with game state**
*For any* game pause event, the background music should pause at its current position.
**Validates: Requirements 6.4**

**Property 24: Music resume from pause**
*For any* game resume event, the background music should continue from where it was paused.
**Validates: Requirements 6.5**

**Property 25: Graceful audio failure handling**
*For any* audio loading failure, the game should continue normal operation without the music.
**Validates: Requirements 6.6**

## Error Handling

### LocalStorage Errors

**Scenario**: LocalStorage is unavailable (private browsing, storage quota exceeded, disabled)

**Handling**:
1. Wrap all localStorage operations in try-catch blocks
2. Check `isLocalStorageAvailable()` before operations
3. If unavailable, initialize `game.highScore = 0` and continue
4. Log warning to console but don't block gameplay
5. Display high score as 0 in UI

**Code Pattern**:
```javascript
try {
    localStorage.setItem(key, value);
} catch (e) {
    console.warn('LocalStorage unavailable:', e);
    // Continue without persistence
}
```

### Particle System Overload

**Scenario**: Too many particles causing performance issues

**Handling**:
1. Implement particle cap (max 500 particles)
2. When cap reached, remove oldest particles first
3. Throttle trail particle generation (every 3-5 frames, not every frame)
4. Prioritize important effects (explosions, confetti) over trails

### Animation State Conflicts

**Scenario**: Multiple death events triggered simultaneously

**Handling**:
1. Check `player.isDying` flag before starting new death animation
2. If already dying, ignore subsequent death triggers
3. Ensure animation completes before allowing new death events
4. Reset all animation flags on respawn

### Invalid Score Data

**Scenario**: Corrupted or invalid data in localStorage

**Handling**:
1. Validate retrieved score is a number
2. Check score is non-negative
3. If invalid, reset to 0 and overwrite storage
4. Use `parseInt()` with fallback to 0

**Code Pattern**:
```javascript
const storedScore = parseInt(localStorage.getItem(key)) || 0;
const validScore = Math.max(0, storedScore);
```

### Audio Loading Errors

**Scenario**: Background music file fails to load or is unavailable

**Handling**:
1. Wrap audio initialization in try-catch
2. Add error event listener to audio element
3. Set `hasError` flag if loading fails
4. Log warning to console
5. Continue game without music
6. Don't block game initialization or gameplay

**Code Pattern**:
```javascript
AudioManager.bgMusic.addEventListener('error', (e) => {
    console.warn('Background music failed to load:', e);
    AudioManager.hasError = true;
    // Game continues without music
});
```

### Browser Autoplay Policy

**Scenario**: Browser blocks autoplay of audio

**Handling**:
1. Attempt to play music on first user interaction (click, keypress)
2. Use `play().catch()` to handle autoplay rejection
3. Retry playback on user input if initially blocked
4. Display optional "Click to enable music" message if needed

**Code Pattern**:
```javascript
const playMusic = () => {
    AudioManager.bgMusic.play().catch(err => {
        console.log('Autoplay blocked, waiting for user interaction');
    });
};
```

## Testing Strategy

### Unit Testing Approach

**Storage Manager Tests**:
- Test saving score to localStorage
- Test retrieving score from localStorage
- Test handling of missing localStorage data
- Test handling of invalid stored data
- Test localStorage unavailability gracefully

**Particle Generation Tests**:
- Test trail particle creation during movement
- Test explosion particle creation on collision
- Test confetti particle creation on high score
- Test particle color assignment based on power
- Test particle cleanup when life expires

**Death Animation Tests**:
- Test animation flag setting on death
- Test input blocking during animation
- Test respawn after animation completes
- Test game over sequence with animation

**UI Update Tests**:
- Test high score display on initialization
- Test score update in UI
- Test high score update when exceeded

**Audio Manager Tests**:
- Test audio initialization and loading
- Test play/pause/resume functionality
- Test looping behavior
- Test error handling for missing audio file
- Test integration with game pause state

### Property-Based Testing Approach

Property-based testing will verify that the system behaves correctly across a wide range of inputs and states. We'll use a JavaScript property-based testing library (fast-check) to generate random test cases.

**Configuration**:
- Library: fast-check (npm package)
- Minimum iterations per property: 100
- Each test tagged with format: `**Feature: game-enhancements, Property {number}: {property_text}**`

**Test Categories**:

1. **Score Persistence Properties** (Properties 1-4)
   - Generate random score values (0 to 1,000,000)
   - Test localStorage round-trip consistency
   - Verify high score updates correctly
   - Test UI rendering with various score combinations

2. **Trail Particle Properties** (Properties 5-8)
   - Generate random player positions and velocities
   - Generate random power states
   - Verify particle generation, decay, and cleanup
   - Test color matching across all power types

3. **Explosion Properties** (Properties 9-11)
   - Generate random collision coordinates
   - Verify particle count and velocity distribution
   - Test cleanup timing

4. **Confetti Properties** (Properties 12-15)
   - Generate random score pairs where current > high
   - Verify particle generation and distribution
   - Test physics and cleanup

5. **Death Animation Properties** (Properties 16-19)
   - Generate random death scenarios
   - Verify animation sequence and timing
   - Test input blocking and respawn behavior

6. **Background Music Properties** (Properties 20-25)
   - Test audio loading and initialization
   - Verify playback state during different game states
   - Test pause/resume synchronization with game state
   - Test looping behavior
   - Test graceful failure handling

**Property Test Structure**:
```javascript
// Example property test
test('Property 1: Score persistence on game end', () => {
    fc.assert(
        fc.property(fc.integer(0, 1000000), (score) => {
            // Feature: game-enhancements, Property 1: Score persistence on game end
            game.score = score;
            endGame();
            const retrieved = StorageManager.getHighScore();
            return retrieved === score;
        }),
        { numRuns: 100 }
    );
});
```

### Integration Testing

**End-to-End Scenarios**:
1. Complete game session with score persistence
2. Multiple sessions with high score tracking
3. Visual effects during full gameplay
4. Death and respawn cycle with animations

**Browser Compatibility**:
- Test localStorage across different browsers
- Test particle rendering performance
- Test animation smoothness at 60fps

### Manual Testing Checklist

- [ ] Trail particles appear during movement with correct colors
- [ ] Explosion effects trigger on collisions
- [ ] Confetti appears when achieving new high score
- [ ] Death animation plays smoothly before respawn
- [ ] High score persists across browser sessions
- [ ] Game handles localStorage unavailability gracefully
- [ ] All effects maintain 60fps performance
- [ ] Visual effects match Kiro brand colors
- [ ] Background music starts playing during gameplay
- [ ] Music loops seamlessly without gaps
- [ ] Music pauses when game is paused
- [ ] Music resumes correctly after unpause
- [ ] Game works normally if audio file is missing

## Implementation Notes

### Performance Considerations

1. **Particle Pooling**: Consider implementing object pooling for particles to reduce garbage collection
2. **Throttling**: Trail particles generated every 3-5 frames, not every frame
3. **Culling**: Remove off-screen particles immediately
4. **Batch Rendering**: Draw all particles of same type in single pass

### Browser Compatibility

- LocalStorage supported in all modern browsers (IE8+)
- Canvas 2D context widely supported
- RequestAnimationFrame polyfill not needed for target browsers

### Visual Consistency

- All particle colors use CONFIG.colors palette
- Trail particles match power-up colors exactly
- Confetti uses celebratory colors: purple (#790ECB), gold (#FFD700), white (#FFFFFF), pink (#FF69B4)
- Explosion particles use warm colors: orange (#FF8C00), red (#FF4500), yellow (#FFD700)

### Code Organization

- Add StorageManager object after CONFIG definition
- Add new particle classes after existing Particle class
- Add effect generator functions after existing createParticles()
- Extend Player class with death animation properties
- Extend game state with highScore tracking
- Update UI functions to include high score display

### Future Enhancements

- Multiple save slots for different players
- Score history/statistics tracking
- Customizable particle effects
- Sound effects for visual events
- Screen shake on explosions
- Slow-motion effect during death animation
