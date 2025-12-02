# Technical Stack

## Core Technologies

- **HTML5 Canvas** for rendering
- **Vanilla JavaScript** (ES6+) - no frameworks or libraries
- **CSS3** for UI styling

## Architecture

- Object-oriented design with ES6 classes
- Game loop using `requestAnimationFrame`
- Configuration-driven design with centralized CONFIG object
- Entity-component pattern for game objects

## Key Classes

- `Player` - Main character with movement, jumping, power absorption, and attacks
- `Enemy` - AI-controlled enemies with different types and behaviors
- `Platform` - Static collision objects
- `Collectible` - Score items with rotation animation
- `Projectile` - Fireball attacks
- `IceProjectile` - Ice breath attacks with freeze mechanic
- `Particle` - Visual effects system

## Game Systems

- **Physics**: Gravity (0.5), friction (0.8), velocity-based movement
- **Collision Detection**: AABB (Axis-Aligned Bounding Box)
- **Camera**: Smooth scrolling with lerp interpolation
- **Input**: Keyboard event listeners with key state tracking
- **Rendering**: Canvas 2D context with layer-based drawing

## Running the Game

Open `index.html` in a web browser. No build process or dependencies required.

## File Structure

- `index.html` - Game container and UI elements
- `game.js` - All game logic, classes, and systems
- `style.css` - UI styling and layout
- `kiro-logo.png` - Player sprite image
