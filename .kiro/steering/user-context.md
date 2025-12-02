---
inclusion: always
---

# Super Kiro World - User Preferences

## Technical Stack
- Plain HTML/CSS/JavaScript (vanilla, no frameworks)

## Game Mechanics
- **Controls**:
  - Arrow keys: Movement (left/right)
  - Space: Jump
  - C: Suck/Absorb enemies
  - V: Attack (varies by power-up)

- **Physics**:
  - Gravity: 0.5
  - Jump Power: 12
  - Movement Speed: 5
  - Friction applied to horizontal movement

- **Enemy System**:
  - 4 enemy types: Basic (no power), Fireball, Sword, Ice Breath
  - Enemies respawn after defeat
  - Close-range absorption mechanic
  - One-hit kills for all attacks

- **Power-Up System**:
  - Visual: Kiro sprite changes color/appearance per power
  - UI: Icon indicator shows current active power
  - All powers use same attack key (V)

- **Level Design**:
  - First level: ~2 minutes of gameplay
  - Scrolling camera follows player
  - Platform-based with collectibles

- **Scoring**:
  - Points from: Collectibles + Defeating enemies
  - Lives system included
  - Level completion and restart functionality

## Visual Style
- Use Kiro brand colors (Purple-500: #790ECB)
- Dark theme (Black-900 background)
- Kiro-logo.png as player sprite
- Smooth animations and visual feedback
