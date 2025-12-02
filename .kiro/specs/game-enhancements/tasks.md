# Implementation Plan

- [x] 1. Implement score persistence system with localStorage
  - Create StorageManager object with save/load/validation methods
  - Add highScore property to game state
  - Integrate high score loading on game initialization
  - Integrate high score saving on game end
  - Add high score display to UI
  - Handle localStorage unavailability gracefully
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 1.1 Write property test for score persistence
  - **Property 1: Score persistence on game end**
  - **Validates: Requirements 1.1**

- [ ]* 1.2 Write property test for high score retrieval
  - **Property 2: High score retrieval on initialization**
  - **Validates: Requirements 1.2**

- [ ]* 1.3 Write property test for high score updates
  - **Property 3: High score update when exceeded**
  - **Validates: Requirements 1.3**

- [ ]* 1.4 Write property test for UI score display
  - **Property 4: UI displays both scores**
  - **Validates: Requirements 1.5**

- [x] 2. Implement trail particle system
  - Create TrailParticle class extending Particle
  - Add trail generation logic to Player.update()
  - Implement opacity decay over particle lifetime
  - Add color matching based on current power-up
  - Throttle trail generation (every 3-5 frames)
  - Ensure trails stop when game is paused
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 2.1 Write property test for trail generation during movement
  - **Property 5: Trail generation during movement**
  - **Validates: Requirements 2.1**

- [ ]* 2.2 Write property test for trail opacity decay
  - **Property 6: Trail particle opacity decay**
  - **Validates: Requirements 2.2**

- [ ]* 2.3 Write property test for trail particle cleanup
  - **Property 7: Trail particle cleanup**
  - **Validates: Requirements 2.3**

- [ ]* 2.4 Write property test for trail color matching
  - **Property 8: Trail color matches power**
  - **Validates: Requirements 2.4**

- [x] 3. Implement explosion effects for collisions
  - Create createExplosionEffect() function
  - Integrate explosion on enemy collision (in Player.update())
  - Integrate explosion on hazard fall (in Player.die())
  - Implement particle burst with outward velocities
  - Add gravity to explosion particles for realistic arcs
  - Ensure proper cleanup of explosion particles
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 3.1 Write property test for explosion on collision
  - **Property 9: Explosion on enemy collision**
  - **Validates: Requirements 3.1**

- [ ]* 3.2 Write property test for explosion particle structure
  - **Property 10: Explosion particle structure**
  - **Validates: Requirements 3.3**

- [ ]* 3.3 Write property test for explosion cleanup
  - **Property 11: Explosion particle cleanup**
  - **Validates: Requirements 3.4**

- [x] 4. Implement confetti celebration effect
  - Create ConfettiParticle class with rotation
  - Create createConfettiEffect() function
  - Add high score check in updateScore()
  - Trigger confetti when new high score achieved
  - Implement gravity and horizontal drift physics
  - Add cleanup for particles below screen
  - Use celebratory color palette (purple, gold, white, pink)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 4.1 Write property test for confetti trigger
  - **Property 12: Confetti trigger on new high score**
  - **Validates: Requirements 4.1**

- [ ]* 4.2 Write property test for confetti generation
  - **Property 13: Confetti particle generation**
  - **Validates: Requirements 4.2**

- [ ]* 4.3 Write property test for confetti physics
  - **Property 14: Confetti physics**
  - **Validates: Requirements 4.3**

- [ ]* 4.4 Write property test for confetti cleanup
  - **Property 15: Confetti cleanup by position**
  - **Validates: Requirements 4.4**

- [x] 5. Implement death animation system
  - Add isDying and deathAnimationTimer properties to Player
  - Implement death animation sequence in Player.die()
  - Block player input during death animation
  - Add visual effects (fade, rotation, particle burst)
  - Ensure animation completes before respawn
  - Ensure animation plays before game over screen
  - Reset animation state on respawn
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 5.1 Write property test for death animation sequence
  - **Property 16: Death animation before respawn**
  - **Validates: Requirements 5.1**

- [ ]* 5.2 Write property test for input blocking
  - **Property 17: Input blocking during death**
  - **Validates: Requirements 5.2**

- [ ]* 5.3 Write property test for respawn position
  - **Property 18: Respawn position after death**
  - **Validates: Requirements 5.4**

- [ ]* 5.4 Write property test for game over sequence
  - **Property 19: Death animation before game over**
  - **Validates: Requirements 5.5**

- [x] 6. Implement background music system
  - Create AudioManager object with init/play/pause/resume methods
  - Add background music audio element to HTML or load dynamically
  - Initialize audio on game init with error handling
  - Start music playback on game start (handle autoplay policy)
  - Enable seamless looping via loop attribute
  - Integrate pause/resume with game pause state
  - Handle audio loading failures gracefully
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 6.1 Write property test for music loading
  - **Property 20: Music loading on initialization**
  - **Validates: Requirements 6.1**

- [ ]* 6.2 Write property test for music playback state
  - **Property 21: Music playback during gameplay**
  - **Validates: Requirements 6.2**

- [ ]* 6.3 Write property test for music looping
  - **Property 22: Music looping**
  - **Validates: Requirements 6.3**

- [ ]* 6.4 Write property test for music pause
  - **Property 23: Music pause with game state**
  - **Validates: Requirements 6.4**

- [ ]* 6.5 Write property test for music resume
  - **Property 24: Music resume from pause**
  - **Validates: Requirements 6.5**

- [ ]* 6.6 Write property test for audio failure handling
  - **Property 25: Graceful audio failure handling**
  - **Validates: Requirements 6.6**
