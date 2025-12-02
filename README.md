# Kiro-by 🎮

A 2D platformer game where you control Kiro, absorb enemy powers, and navigate through challenging levels. Built with vanilla JavaScript, HTML5 Canvas, and CSS.

## 🚀 Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- That's it! No build tools or dependencies required.

### Running Locally

1. **Clone or download this repository**
   ```bash
   git clone <your-repo-url>
   cd kiro-by
   ```

2. **Open the game**
   
   Simply open `index.html` in your web browser:
   - Double-click `index.html`, or
   - Right-click → Open with → Your browser, or
   - Drag and drop `index.html` into your browser

3. **Start playing!**

### Using a Local Server (Optional)

For the best experience, especially if you encounter CORS issues with audio files, run a local server:

**Python 3:**
```bash
python -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js (if you have it installed):**
```bash
npx http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

## 🎮 How to Play

### Controls

- **Arrow Keys** (← →): Move left and right
- **Space**: Jump
- **C**: Suck/Absorb enemies (get close to them first)
- **V**: Attack with your current power

### Gameplay

- Absorb enemies to gain their powers
- Use powers to defeat other enemies
- Collect items for points
- Reach the end of the level to win
- Don't fall off the platforms or lose all your lives!

### Power Types

- **No Power** (Default): Can only absorb enemies
- **Fireball** 🔥: Shoot fireballs at enemies
- **Sword** ⚔️: Melee slash attack
- **Ice Breath** ❄️: Freeze enemies in place

## 📁 Project Structure

```
kiro-by/
├── index.html              # Main game page
├── game.js                 # All game logic and mechanics
├── style.css               # UI styling
├── kiro-logo.png          # Player sprite
├── background-music.mp3   # Game audio
└── README.md              # This file
```

## 🌐 Deploying to the Web

### GitHub Pages

1. Push your code to a GitHub repository
2. Go to Settings → Pages
3. Select your main branch as the source
4. Your game will be live at `https://yourusername.github.io/repo-name`

### Netlify

1. Sign up at [netlify.com](https://netlify.com)
2. Drag and drop your project folder
3. Your game is instantly deployed!

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts

### Any Static Host

Since this is a static site, you can deploy to:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Cloudflare Pages
- Surge.sh
- Any web hosting service

Just upload all the files and ensure `index.html` is at the root.

## 🛠️ Customization

### Modify Game Settings

Edit the `CONFIG` object in `game.js`:

```javascript
const CONFIG = {
    gravity: 0.5,        // Adjust gravity strength
    jumpPower: 12,       // How high the player jumps
    moveSpeed: 5,        // Player movement speed
    // ... more settings
};
```

### Change Colors

Update the color scheme in `CONFIG.colors`:

```javascript
colors: {
    primary: '#790ECB',    // Kiro purple
    background: '#1a1a1a', // Dark background
    // ... more colors
}
```

### Add New Levels

Modify the `createLevel()` function in `game.js` to add platforms, enemies, and collectibles.

## 🎵 Audio Setup

The game includes background music. If audio doesn't play:

1. Ensure `background-music.mp3` is in the project root
2. Use a local server (see "Using a Local Server" above)
3. Check browser console for any errors
4. Some browsers require user interaction before playing audio

## 🐛 Troubleshooting

**Game doesn't load:**
- Check browser console (F12) for errors
- Ensure all files are in the correct locations
- Try using a local server

**Audio doesn't play:**
- Use a local server instead of opening the file directly
- Check that the audio file exists
- Some browsers block autoplay - click on the page first

**Performance issues:**
- Close other browser tabs
- Try a different browser
- Check if hardware acceleration is enabled

## 📝 License

This project was created as part of the AWS re:Invent workshop. Feel free to modify and use it for your own purposes.

## 🤝 Contributing

This is a workshop project, but feel free to fork it and make it your own! Add new features, levels, enemies, or power-ups.

## 🎓 Built With

- HTML5 Canvas for rendering
- Vanilla JavaScript (ES6+)
- CSS3 for styling
- No frameworks or build tools required!

---

**Enjoy playing Kiro-by!** 🎮✨
