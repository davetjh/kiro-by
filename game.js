// Game Configuration
const CONFIG = {
    canvas: { width: 1200, height: 600 },
    player: { 
        width: 40, 
        height: 40, 
        speed: 5, 
        jumpPower: 12, 
        gravity: 0.5,
        friction: 0.8,
        suckRange: 80
    },
    enemy: { 
        width: 35, 
        height: 35, 
        speed: 2,
        respawnTime: 5000
    },
    collectible: { width: 20, height: 20, value: 10 },
    projectile: { width: 15, height: 15, speed: 8 },
    colors: {
        purple: '#790ECB',
        purpleLight: '#9a3ee0',
        background: '#1a1a1a',
        platform: '#3a3a3a',
        collectible: '#FFD700'
    }
};

// Storage Manager
const StorageManager = {
    STORAGE_KEY: 'superKiroWorld_highScore',
    
    isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('LocalStorage unavailable:', e);
            return false;
        }
    },
    
    saveHighScore(score) {
        if (!this.isLocalStorageAvailable()) return;
        
        try {
            localStorage.setItem(this.STORAGE_KEY, score.toString());
        } catch (e) {
            console.warn('Failed to save high score:', e);
        }
    },
    
    getHighScore() {
        if (!this.isLocalStorageAvailable()) return 0;
        
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            const score = parseInt(stored);
            
            // Validate score is a valid non-negative number
            if (isNaN(score) || score < 0) {
                return 0;
            }
            
            return score;
        } catch (e) {
            console.warn('Failed to retrieve high score:', e);
            return 0;
        }
    }
};

// Audio Manager
const AudioManager = {
    bgMusic: null,
    isLoaded: false,
    hasError: false,
    
    init() {
        try {
            // Create audio element
            this.bgMusic = new Audio();
            this.bgMusic.src = 'background-music.mp3';
            this.bgMusic.loop = true; // Enable seamless looping
            this.bgMusic.volume = 0.5; // Set reasonable default volume
            
            // Add event listeners
            this.bgMusic.addEventListener('canplaythrough', () => {
                this.isLoaded = true;
                console.log('Background music loaded successfully');
            });
            
            this.bgMusic.addEventListener('error', (e) => {
                console.warn('Background music failed to load:', e);
                this.hasError = true;
                // Game continues without music
            });
            
            // Preload the audio
            this.bgMusic.load();
        } catch (e) {
            console.warn('Failed to initialize audio:', e);
            this.hasError = true;
        }
    },
    
    play() {
        if (this.hasError || !this.bgMusic) return;
        
        // Handle browser autoplay policy
        const playPromise = this.bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.log('Autoplay blocked, waiting for user interaction');
                // Will retry on user input
            });
        }
    },
    
    pause() {
        if (this.hasError || !this.bgMusic) return;
        
        try {
            this.bgMusic.pause();
        } catch (e) {
            console.warn('Failed to pause music:', e);
        }
    },
    
    resume() {
        if (this.hasError || !this.bgMusic) return;
        
        try {
            // Resume from where it was paused
            this.bgMusic.play().catch(err => {
                console.warn('Failed to resume music:', err);
            });
        } catch (e) {
            console.warn('Failed to resume music:', e);
        }
    }
};

// Game State
const game = {
    canvas: null,
    ctx: null,
    score: 0,
    highScore: 0,
    lives: 3,
    camera: { x: 0, y: 0 },
    keys: {},
    gameOver: false,
    levelComplete: false,
    paused: false,
    musicStarted: false,
    player: null,
    platforms: [],
    enemies: [],
    collectibles: [],
    projectiles: [],
    particles: []
};

// Power Types
const POWERS = {
    NONE: { name: 'None', color: '#790ECB' },
    FIREBALL: { name: 'Fireball', color: '#FF4500' },
    SWORD: { name: 'Sword', color: '#C0C0C0' },
    ICE: { name: 'Ice Breath', color: '#00BFFF' }
};

// Enemy Types
const ENEMY_TYPES = {
    BASIC: { power: POWERS.NONE, color: '#FF69B4', speed: 2 },
    FIRE: { power: POWERS.FIREBALL, color: '#FF4500', speed: 1.5 },
    SWORD: { power: POWERS.SWORD, color: '#C0C0C0', speed: 2.5 },
    ICE: { power: POWERS.ICE, color: '#00BFFF', speed: 1.8 }
};

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.player.width;
        this.height = CONFIG.player.height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = false;
        this.power = POWERS.NONE;
        this.isSucking = false;
        this.suckCooldown = 0;
        this.attackCooldown = 0;
        this.facingRight = true;
        this.trailSpawnCounter = 0;
        this.isDying = false;
        this.deathAnimationTimer = 0;
        this.image = new Image();
        this.image.src = 'kiro-logo.png';
        this.imageLoaded = false;
        this.image.onload = () => { this.imageLoaded = true; };
    }

    update() {
        // Handle death animation
        if (this.isDying) {
            this.deathAnimationTimer++;
            
            // Death animation duration: 60 frames (1 second at 60fps)
            if (this.deathAnimationTimer >= 60) {
                // Animation complete, handle respawn or game over
                this.isDying = false;
                this.deathAnimationTimer = 0;
                
                game.lives--;
                updateLives();
                
                if (game.lives <= 0) {
                    endGame();
                } else {
                    // Respawn player
                    this.x = 100;
                    this.y = 100;
                    this.velocityX = 0;
                    this.velocityY = 0;
                    this.power = POWERS.NONE;
                    this.trailSpawnCounter = 0;
                    updatePowerUI();
                }
            }
            
            // Block all other updates during death animation
            return;
        }
        
        // Horizontal movement
        if (game.keys['ArrowLeft']) {
            this.velocityX = -CONFIG.player.speed;
            this.facingRight = false;
        } else if (game.keys['ArrowRight']) {
            this.velocityX = CONFIG.player.speed;
            this.facingRight = true;
        } else {
            this.velocityX *= CONFIG.player.friction;
        }

        // Jump
        if (game.keys[' '] && this.isGrounded) {
            this.velocityY = -CONFIG.player.jumpPower;
            this.isGrounded = false;
        }

        // Apply gravity
        this.velocityY += CONFIG.player.gravity;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Check platform collisions
        this.isGrounded = false;
        game.platforms.forEach(platform => {
            if (this.checkCollision(platform)) {
                // Top collision (landing on platform)
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.isGrounded = true;
                }
                // Bottom collision
                else if (this.velocityY < 0 && this.y - this.velocityY >= platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                }
                // Side collisions
                else if (this.velocityX > 0) {
                    this.x = platform.x - this.width;
                } else if (this.velocityX < 0) {
                    this.x = platform.x + platform.width;
                }
            }
        });

        // Cooldowns
        if (this.suckCooldown > 0) this.suckCooldown--;
        if (this.attackCooldown > 0) this.attackCooldown--;

        // Trail particle generation
        // Generate trails when moving (velocityX or velocityY is significant)
        // Throttle generation to every 4 frames
        this.trailSpawnCounter++;
        if (this.trailSpawnCounter >= 4) {
            this.trailSpawnCounter = 0;
            // Only generate trails when player is moving
            if (Math.abs(this.velocityX) > 0.5 || Math.abs(this.velocityY) > 0.5) {
                // Create trail particle at player's center position
                const trailX = this.x + this.width / 2;
                const trailY = this.y + this.height / 2;
                game.particles.push(new TrailParticle(trailX, trailY, this.power.color));
            }
        }

        // Suck action
        if (game.keys['c'] && this.suckCooldown === 0) {
            this.suck();
            this.suckCooldown = 30;
        }

        // Attack action
        if (game.keys['v'] && this.attackCooldown === 0 && this.power !== POWERS.NONE) {
            this.attack();
            this.attackCooldown = 30;
        }

        // Boundary check
        if (this.y > CONFIG.canvas.height + 100) {
            this.die();
        }
    }

    suck() {
        this.isSucking = true;
        setTimeout(() => { this.isSucking = false; }, 300);

        // Check for nearby enemies
        game.enemies.forEach(enemy => {
            if (!enemy.dead) {
                const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
                if (dist < CONFIG.player.suckRange) {
                    this.absorbEnemy(enemy);
                }
            }
        });
    }

    absorbEnemy(enemy) {
        this.power = enemy.type.power;
        updatePowerUI();
        enemy.die();
        game.score += 50;
        updateScore();
        createParticles(enemy.x, enemy.y, enemy.type.color);
    }

    attack() {
        if (this.power === POWERS.FIREBALL) {
            this.shootFireball();
        } else if (this.power === POWERS.SWORD) {
            this.swordSlash();
        } else if (this.power === POWERS.ICE) {
            this.iceBreath();
        }
    }

    shootFireball() {
        const direction = this.facingRight ? 1 : -1;
        game.projectiles.push(new Projectile(
            this.x + this.width / 2,
            this.y + this.height / 2,
            direction,
            POWERS.FIREBALL
        ));
    }

    swordSlash() {
        const slashRange = 70;
        const slashWidth = 80;
        const slashHeight = 60;
        
        // Create slash hitbox in front of player
        const slashX = this.facingRight ? this.x : this.x - slashWidth + this.width;
        const slashY = this.y - 10;
        
        game.enemies.forEach(enemy => {
            if (!enemy.dead && !enemy.frozen) {
                // Check if enemy is in slash range
                if (enemy.x + enemy.width > slashX &&
                    enemy.x < slashX + slashWidth &&
                    enemy.y + enemy.height > slashY &&
                    enemy.y < slashY + slashHeight) {
                    enemy.die();
                    game.score += 25;
                    updateScore();
                    createParticles(enemy.x, enemy.y, enemy.type.color);
                }
            }
        });
        
        // Visual slash effect
        createSlashEffect(slashX, slashY, slashWidth, slashHeight);
    }

    iceBreath() {
        const direction = this.facingRight ? 1 : -1;
        game.projectiles.push(new IceProjectile(
            this.x + this.width / 2,
            this.y + this.height / 2,
            direction
        ));
    }

    checkCollision(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }

    die() {
        // Don't trigger death animation if already dying
        if (this.isDying) return;
        
        // Start death animation
        this.isDying = true;
        this.deathAnimationTimer = 0;
        
        // Create explosion effect at player's position
        createExplosionEffect(
            this.x + this.width / 2, 
            this.y + this.height / 2, 
            '#FF4500' // Red-orange explosion for hazard death
        );
        
        // Freeze player velocity
        this.velocityX = 0;
        this.velocityY = 0;
    }

    draw(ctx) {
        ctx.save();
        
        // Draw suck effect
        if (this.isSucking) {
            ctx.strokeStyle = this.power.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, CONFIG.player.suckRange, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Apply death animation visual effects
        if (this.isDying) {
            // Calculate animation progress (0 to 1)
            const progress = this.deathAnimationTimer / 60;
            
            // Fade out opacity
            ctx.globalAlpha = 1 - progress;
            
            // Rotate sprite during death
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(progress * Math.PI * 2); // Full rotation during animation
            ctx.translate(-this.width / 2, -this.height / 2);
            
            // Emit particle burst during death animation
            if (this.deathAnimationTimer % 5 === 0) {
                createParticles(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    this.power.color
                );
            }
        } else {
            // Flip sprite based on direction (normal behavior)
            if (!this.facingRight) {
                ctx.translate(this.x + this.width, this.y);
                ctx.scale(-1, 1);
            } else {
                ctx.translate(this.x, this.y);
            }
        }

        // Draw player with power color tint
        if (this.imageLoaded) {
            // Add glow effect if powered up
            if (this.power !== POWERS.NONE && !this.isDying) {
                ctx.shadowColor = this.power.color;
                ctx.shadowBlur = 15;
            }
            
            // Draw the image
            ctx.drawImage(this.image, 0, 0, this.width, this.height);
            
            // Reset shadow
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = this.power.color;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        ctx.restore();
    }
}

// Platform Class
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        ctx.fillStyle = CONFIG.colors.platform;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = CONFIG.colors.purple;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

// Enemy Class
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.enemy.width;
        this.height = CONFIG.enemy.height;
        this.type = type;
        this.velocityX = type.speed;
        this.velocityY = 0;
        this.dead = false;
        this.frozen = false;
        this.frozenTimer = 0;
        this.respawnTimer = 0;
        this.originalX = x;
        this.originalY = y;
    }

    update() {
        if (this.dead) {
            this.respawnTimer++;
            if (this.respawnTimer > CONFIG.enemy.respawnTime / 16) {
                this.respawn();
            }
            return;
        }

        // Handle frozen state
        if (this.frozen) {
            this.frozenTimer--;
            if (this.frozenTimer <= 0) {
                this.frozen = false;
                // Restore movement when unfrozen
                this.velocityX = this.frozenVelocityX || this.type.speed;
            }
            
            // Check if player jumps on frozen enemy
            if (game.player.velocityY > 0 && 
                game.player.y + game.player.height <= this.y + 10 &&
                game.player.x + game.player.width > this.x &&
                game.player.x < this.x + this.width &&
                game.player.y + game.player.height > this.y) {
                this.shatter();
                game.player.velocityY = -8; // Bounce
                return;
            }
            return; // Don't move when frozen
        }

        this.x += this.velocityX;
        this.velocityY += CONFIG.player.gravity;
        this.y += this.velocityY;

        // Platform collision
        let onPlatform = false;
        game.platforms.forEach(platform => {
            if (this.checkCollision(platform)) {
                if (this.velocityY > 0) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    onPlatform = true;
                }
            }
        });

        // Turn around at edges or walls
        if (!onPlatform || this.checkWall()) {
            this.velocityX *= -1;
        }

        // Check collision with player (only damage if not frozen)
        if (this.checkCollision(game.player) && !this.frozen) {
            // Create explosion effect at collision point
            const explosionX = (this.x + this.width / 2 + game.player.x + game.player.width / 2) / 2;
            const explosionY = (this.y + this.height / 2 + game.player.y + game.player.height / 2) / 2;
            createExplosionEffect(explosionX, explosionY, '#FF8C00'); // Orange explosion
            
            game.player.die();
        }
    }

    checkWall() {
        let hitWall = false;
        game.platforms.forEach(platform => {
            if (this.velocityX > 0 && this.x + this.width >= platform.x && 
                this.x < platform.x && this.y + this.height > platform.y) {
                hitWall = true;
            } else if (this.velocityX < 0 && this.x <= platform.x + platform.width && 
                       this.x + this.width > platform.x + platform.width && 
                       this.y + this.height > platform.y) {
                hitWall = true;
            }
        });
        return hitWall;
    }

    checkCollision(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }

    freeze() {
        this.frozen = true;
        this.frozenTimer = 180; // 3 seconds at 60fps
        this.frozenVelocityX = this.velocityX; // Store original velocity
        this.velocityX = 0;
    }

    shatter() {
        this.die();
        game.score += 25;
        updateScore();
        createShatterParticles(this.x, this.y, this.width, this.height);
    }

    die() {
        this.dead = true;
        this.frozen = false;
        this.respawnTimer = 0;
    }

    respawn() {
        this.dead = false;
        this.frozen = false;
        this.x = this.originalX;
        this.y = this.originalY;
        this.velocityX = this.type.speed;
        this.velocityY = 0;
    }

    draw(ctx) {
        if (this.dead) return;
        
        if (this.frozen) {
            // Draw frozen enemy with ice effect
            ctx.fillStyle = '#B0E0E6';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#00BFFF';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // Ice crystals
            ctx.fillStyle = '#E0FFFF';
            ctx.fillRect(this.x + 5, this.y + 5, 4, 4);
            ctx.fillRect(this.x + 15, this.y + 8, 4, 4);
            ctx.fillRect(this.x + 25, this.y + 5, 4, 4);
            ctx.fillRect(this.x + 10, this.y + 20, 4, 4);
            ctx.fillRect(this.x + 20, this.y + 25, 4, 4);
        } else {
            ctx.fillStyle = this.type.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // Draw eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 8, this.y + 10, 6, 6);
            ctx.fillRect(this.x + 21, this.y + 10, 6, 6);
        }
    }
}

// Collectible Class
class Collectible {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.collectible.width;
        this.height = CONFIG.collectible.height;
        this.collected = false;
        this.rotation = 0;
    }

    update() {
        if (this.collected) return;
        
        this.rotation += 0.1;
        
        if (this.checkCollision(game.player)) {
            this.collect();
        }
    }

    checkCollision(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }

    collect() {
        this.collected = true;
        game.score += CONFIG.collectible.value;
        updateScore();
        createParticles(this.x, this.y, CONFIG.colors.collectible);
    }

    draw(ctx) {
        if (this.collected) return;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.fillStyle = CONFIG.colors.collectible;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}

// Projectile Class
class Projectile {
    constructor(x, y, direction, power) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.projectile.width;
        this.height = CONFIG.projectile.height;
        this.velocityX = direction * CONFIG.projectile.speed;
        this.power = power;
        this.active = true;
    }

    update() {
        this.x += this.velocityX;
        
        // Check enemy collision
        game.enemies.forEach(enemy => {
            if (!enemy.dead && this.checkCollision(enemy)) {
                enemy.die();
                game.score += 25;
                updateScore();
                createParticles(enemy.x, enemy.y, enemy.type.color);
                this.active = false;
            }
        });

        // Check platform collision
        game.platforms.forEach(platform => {
            if (this.checkCollision(platform)) {
                this.active = false;
            }
        });

        // Remove if off screen
        if (this.x < game.camera.x - 100 || this.x > game.camera.x + CONFIG.canvas.width + 100) {
            this.active = false;
        }
    }

    checkCollision(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }

    draw(ctx) {
        ctx.fillStyle = this.power.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Trail effect
        ctx.globalAlpha = 0.5;
        ctx.fillRect(this.x - this.velocityX, this.y, this.width, this.height);
        ctx.globalAlpha = 1;
    }
}

// Ice Projectile Class
class IceProjectile {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.projectile.width;
        this.height = CONFIG.projectile.height;
        this.velocityX = direction * CONFIG.projectile.speed;
        this.active = true;
    }

    update() {
        this.x += this.velocityX;
        
        // Check enemy collision - freeze instead of kill
        game.enemies.forEach(enemy => {
            if (!enemy.dead && !enemy.frozen && this.checkCollision(enemy)) {
                enemy.freeze();
                createParticles(enemy.x, enemy.y, '#00BFFF');
                this.active = false;
            }
        });

        // Check platform collision
        game.platforms.forEach(platform => {
            if (this.checkCollision(platform)) {
                this.active = false;
            }
        });

        // Remove if off screen
        if (this.x < game.camera.x - 100 || this.x > game.camera.x + CONFIG.canvas.width + 100) {
            this.active = false;
        }
    }

    checkCollision(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }

    draw(ctx) {
        ctx.fillStyle = '#00BFFF';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Ice trail effect
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#B0E0E6';
        ctx.fillRect(this.x - this.velocityX, this.y, this.width, this.height);
        ctx.globalAlpha = 1;
    }
}

// Particle Class
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.velocityX = (Math.random() - 0.5) * 4;
        this.velocityY = (Math.random() - 0.5) * 4;
        this.life = 30;
        this.color = color;
        this.size = Math.random() * 4 + 2;
        this.gravity = 0; // Optional gravity for explosion particles
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Apply gravity if set (for explosion particles)
        if (this.gravity) {
            this.velocityY += this.gravity;
        }
        
        this.life--;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life / 30;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// Trail Particle Class
class TrailParticle extends Particle {
    constructor(x, y, color) {
        super(x, y, color);
        // Trail particles are mostly stationary with minimal velocity
        this.velocityX = (Math.random() - 0.5) * 0.5;
        this.velocityY = (Math.random() - 0.5) * 0.5;
        // Shorter lifetime than standard particles
        this.life = 20;
        this.maxLife = 20;
        // Smaller size
        this.size = Math.random() * 2 + 2;
        this.opacity = 1.0;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.life--;
        // Calculate opacity based on remaining life
        this.opacity = this.life / this.maxLife;
    }

    draw(ctx) {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// Confetti Particle Class
class ConfettiParticle extends Particle {
    constructor(x, y, color) {
        super(x, y, color);
        // Confetti has downward velocity with horizontal drift
        this.velocityX = (Math.random() - 0.5) * 4; // -2 to 2
        this.velocityY = Math.random() * 2 + 1; // 1 to 3 (downward)
        // Longer lifetime than standard particles
        this.life = 120;
        this.maxLife = 120;
        // Larger size
        this.size = Math.random() * 4 + 4; // 4-8 pixels
        // Rotation properties
        this.rotation = Math.random() * Math.PI * 2; // 0 to 2π
        this.rotationSpeed = (Math.random() - 0.5) * 0.2; // Radians per frame
        // Gravity for falling effect
        this.gravity = CONFIG.player.gravity * 0.6; // Slightly lighter than player gravity
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Apply gravity
        this.velocityY += this.gravity;
        
        // Update rotation
        this.rotation += this.rotationSpeed;
        
        this.life--;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw confetti as a rotated rectangle
        ctx.globalAlpha = Math.min(1, this.life / 30); // Fade out in last 30 frames
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.5);
        ctx.globalAlpha = 1;
        
        ctx.restore();
    }
}

// Create particles
function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        game.particles.push(new Particle(x, y, color));
    }
}

// Create shatter particles for frozen enemies
function createShatterParticles(x, y, width, height) {
    // Create ice shards
    for (let i = 0; i < 20; i++) {
        const shard = new Particle(
            x + Math.random() * width,
            y + Math.random() * height,
            Math.random() > 0.5 ? '#00BFFF' : '#B0E0E6'
        );
        shard.velocityX = (Math.random() - 0.5) * 8;
        shard.velocityY = (Math.random() - 0.5) * 8 - 2;
        shard.size = Math.random() * 6 + 3;
        shard.life = 40;
        game.particles.push(shard);
    }
}

// Create slash effect particles
function createSlashEffect(x, y, width, height) {
    for (let i = 0; i < 8; i++) {
        const slash = new Particle(
            x + Math.random() * width,
            y + Math.random() * height,
            '#C0C0C0'
        );
        slash.velocityX = (Math.random() - 0.5) * 6;
        slash.velocityY = (Math.random() - 0.5) * 6;
        slash.size = Math.random() * 8 + 4;
        slash.life = 15;
        game.particles.push(slash);
    }
}

// Create explosion effect for collisions
function createExplosionEffect(x, y, color) {
    // Generate 15-20 particles radiating outward from collision point
    const particleCount = Math.floor(Math.random() * 6) + 15; // 15-20 particles
    
    for (let i = 0; i < particleCount; i++) {
        // Calculate angle for radial distribution
        const angle = (Math.PI * 2 * i) / particleCount;
        
        // Create particle with higher initial velocity for explosion effect
        const particle = new Particle(x, y, color);
        
        // Set outward velocity based on angle (higher speed than standard particles)
        const speed = Math.random() * 4 + 4; // 4-8 speed
        particle.velocityX = Math.cos(angle) * speed;
        particle.velocityY = Math.sin(angle) * speed;
        
        // Larger particles for more visible explosion
        particle.size = Math.random() * 5 + 3;
        
        // Longer life for explosion particles
        particle.life = 40;
        
        // Add gravity property for realistic arc motion
        particle.gravity = CONFIG.player.gravity;
        
        game.particles.push(particle);
    }
}

// Create confetti effect for new high score
function createConfettiEffect() {
    // Celebratory color palette
    const colors = ['#790ECB', '#FFD700', '#FFFFFF', '#FF69B4']; // purple, gold, white, pink
    
    // Generate 30-50 particles across screen width
    const particleCount = Math.floor(Math.random() * 21) + 30; // 30-50 particles
    
    for (let i = 0; i < particleCount; i++) {
        // Spawn across the top of the screen (in camera view)
        const x = game.camera.x + Math.random() * CONFIG.canvas.width;
        const y = game.camera.y - 20; // Just above visible screen
        
        // Random color from palette
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        game.particles.push(new ConfettiParticle(x, y, color));
    }
}

// Initialize game
function init() {
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    game.canvas.width = CONFIG.canvas.width;
    game.canvas.height = CONFIG.canvas.height;

    // Load high score from localStorage
    game.highScore = StorageManager.getHighScore();

    // Initialize audio manager
    AudioManager.init();

    // Create player
    game.player = new Player(100, 100);

    // Create level
    createLevel();

    // Event listeners
    document.addEventListener('keydown', (e) => {
        game.keys[e.key] = true;
        if (e.key === ' ') e.preventDefault();
        
        // Start music on first user interaction (handles autoplay policy)
        if (!game.musicStarted && !AudioManager.hasError) {
            AudioManager.play();
            game.musicStarted = true;
        }
        
        // Pause/unpause with 'p' key
        if (e.key === 'p' || e.key === 'P') {
            togglePause();
        }
        
        // Toggle controls overlay with 'h' key
        if (e.key === 'h' || e.key === 'H') {
            toggleControlsOverlay();
        }
    });

    document.addEventListener('keyup', (e) => {
        game.keys[e.key] = false;
    });

    document.getElementById('restart-btn').addEventListener('click', restart);
    document.getElementById('next-level-btn').addEventListener('click', restart);
    document.getElementById('start-game-btn').addEventListener('click', startGame);

    // Update UI with initial scores
    updateScore();
    updateHighScoreUI();

    // Start game loop
    gameLoop();
}

// Create level
function createLevel() {
    game.platforms = [];
    game.enemies = [];
    game.collectibles = [];

    // Ground
    game.platforms.push(new Platform(0, 550, 3000, 50));

    // Platforms - creating a 2-minute level
    const platformData = [
        [200, 450, 150, 20],
        [400, 380, 120, 20],
        [600, 310, 150, 20],
        [850, 380, 100, 20],
        [1050, 450, 150, 20],
        [1300, 400, 120, 20],
        [1500, 330, 150, 20],
        [1750, 400, 100, 20],
        [1950, 470, 150, 20],
        [2200, 380, 120, 20],
        [2400, 310, 150, 20],
        [2650, 400, 150, 20],
        [2900, 450, 200, 20]
    ];

    platformData.forEach(([x, y, w, h]) => {
        game.platforms.push(new Platform(x, y, w, h));
    });

    // Enemies
    game.enemies.push(new Enemy(300, 400, ENEMY_TYPES.BASIC));
    game.enemies.push(new Enemy(650, 260, ENEMY_TYPES.FIRE));
    game.enemies.push(new Enemy(900, 330, ENEMY_TYPES.SWORD));
    game.enemies.push(new Enemy(1350, 350, ENEMY_TYPES.ICE));
    game.enemies.push(new Enemy(1550, 280, ENEMY_TYPES.BASIC));
    game.enemies.push(new Enemy(1800, 350, ENEMY_TYPES.FIRE));
    game.enemies.push(new Enemy(2000, 420, ENEMY_TYPES.SWORD));
    game.enemies.push(new Enemy(2250, 330, ENEMY_TYPES.ICE));
    game.enemies.push(new Enemy(2500, 260, ENEMY_TYPES.FIRE));
    game.enemies.push(new Enemy(2700, 350, ENEMY_TYPES.SWORD));

    // Collectibles
    for (let i = 0; i < 50; i++) {
        const platform = game.platforms[Math.floor(Math.random() * game.platforms.length)];
        const x = platform.x + Math.random() * (platform.width - 20);
        const y = platform.y - 30;
        game.collectibles.push(new Collectible(x, y));
    }

    // Goal at the end
    game.platforms.push(new Platform(2950, 350, 50, 200)); // Goal marker
}

// Update camera
function updateCamera() {
    const targetX = game.player.x - CONFIG.canvas.width / 3;
    game.camera.x += (targetX - game.camera.x) * 0.1;
    
    // Clamp camera
    game.camera.x = Math.max(0, game.camera.x);
    game.camera.x = Math.min(game.camera.x, 3000 - CONFIG.canvas.width);
}

// Game loop
function gameLoop() {
    if (game.gameOver || game.levelComplete || game.paused) return;

    // Update
    game.player.update();
    game.enemies.forEach(enemy => enemy.update());
    game.collectibles.forEach(collectible => collectible.update());
    game.projectiles = game.projectiles.filter(p => {
        if (p.update) p.update();
        return p.active;
    });
    game.particles = game.particles.filter(p => {
        p.update();
        // Remove particles when life expires
        if (p.life <= 0) return false;
        
        // Remove confetti particles that fall below visible screen
        if (p instanceof ConfettiParticle && p.y > game.camera.y + CONFIG.canvas.height) {
            return false;
        }
        
        return true;
    });

    updateCamera();

    // Check level complete
    if (game.player.x > 2900) {
        completeLevel();
    }

    // Draw
    game.ctx.fillStyle = CONFIG.colors.background;
    game.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

    game.ctx.save();
    game.ctx.translate(-game.camera.x, -game.camera.y);

    game.platforms.forEach(platform => platform.draw(game.ctx));
    game.collectibles.forEach(collectible => collectible.draw(game.ctx));
    game.enemies.forEach(enemy => enemy.draw(game.ctx));
    game.projectiles.forEach(projectile => {
        if (projectile.draw) projectile.draw(game.ctx);
    });
    game.particles.forEach(particle => particle.draw(game.ctx));
    game.player.draw(game.ctx);

    game.ctx.restore();

    requestAnimationFrame(gameLoop);
}

// UI Updates
function updateScore() {
    document.getElementById('score').textContent = `Score: ${game.score}`;
    
    // Check if current score exceeds high score
    if (game.score > game.highScore) {
        // Trigger confetti effect immediately when new high score is achieved
        createConfettiEffect();
        
        game.highScore = game.score;
        StorageManager.saveHighScore(game.highScore);
        updateHighScoreUI();
    }
}

function updateHighScoreUI() {
    document.getElementById('high-score').textContent = `High Score: ${game.highScore}`;
}

function updateLives() {
    document.getElementById('lives').textContent = `Lives: ${game.lives}`;
}

function updatePowerUI() {
    document.getElementById('current-power').textContent = game.player.power.name;
    document.getElementById('current-power').style.color = game.player.power.color;
}

// End game
function endGame() {
    game.gameOver = true;
    
    // Pause music when game ends
    AudioManager.pause();
    
    // Save high score if current score is higher
    if (game.score > game.highScore) {
        game.highScore = game.score;
        StorageManager.saveHighScore(game.highScore);
    }
    
    document.getElementById('final-score').textContent = game.score;
    document.getElementById('game-over').classList.remove('hidden');
}

// Complete level
function completeLevel() {
    game.levelComplete = true;
    
    // Pause music when level completes
    AudioManager.pause();
    
    document.getElementById('complete-score').textContent = game.score;
    document.getElementById('level-complete').classList.remove('hidden');
}

// Toggle pause
function togglePause() {
    if (game.gameOver || game.levelComplete) return;
    
    game.paused = !game.paused;
    
    if (game.paused) {
        AudioManager.pause();
    } else {
        AudioManager.resume();
        gameLoop(); // Resume game loop
    }
}

// Toggle controls overlay
function toggleControlsOverlay() {
    const overlay = document.getElementById('controls-overlay');
    const isHidden = overlay.classList.contains('hidden');
    
    if (isHidden) {
        overlay.classList.remove('hidden');
        game.paused = true;
        AudioManager.pause();
    } else {
        overlay.classList.add('hidden');
        game.paused = false;
        AudioManager.resume();
        if (!game.gameOver && !game.levelComplete) {
            gameLoop();
        }
    }
}

// Start game (from initial controls screen)
function startGame() {
    const overlay = document.getElementById('controls-overlay');
    overlay.classList.add('hidden');
    game.paused = false;
    
    // Start music on game start
    if (!game.musicStarted && !AudioManager.hasError) {
        AudioManager.play();
        game.musicStarted = true;
    }
}

// Restart
function restart() {
    game.score = 0;
    game.lives = 3;
    game.gameOver = false;
    game.levelComplete = false;
    game.paused = false;
    game.camera.x = 0;
    game.camera.y = 0;
    game.projectiles = [];
    game.particles = [];
    
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('level-complete').classList.add('hidden');
    
    game.player = new Player(100, 100);
    createLevel();
    
    updateScore();
    updateLives();
    updatePowerUI();
    
    // Resume music if it was started
    if (game.musicStarted) {
        AudioManager.play();
    }
    
    gameLoop();
}

// Start game
init();
