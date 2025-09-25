# Swedish City Quiz 🇸🇪

A fun web-based quiz game where you test your knowledge of Swedish geography by placing pins on a map!

## How to Play

1. You'll see a map of Sweden without any cities marked
2. A Swedish city name will be displayed
3. Click on the map where you think the city is located
4. Your pin and the correct location will be shown
5. You'll get points based on how close you were (closer = more points)
6. Complete 10 cities to see your final score!

## Scoring System

- **Perfect** (0-10km): 100 points 🎯
- **Excellent** (10-50km): 80-99 points 🌟
- **Good** (50-100km): 50-79 points 👍
- **Average** (100-200km): 25-49 points 👌
- **Poor** (200km+): 0-24 points 💪

## How to Run

### Option 1: Simple HTTP Server (Recommended)
Open a terminal in the project directory and run one of these commands:

**Python 3:**
```bash
python3 -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js (if you have it installed):**
```bash
npx http-server
```

Then open your browser and go to `http://localhost:8000`

### Option 2: Live Server Extension (VS Code)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 3: Direct File Opening
You can also try opening `index.html` directly in your browser, but some browsers may block the map tiles due to CORS policies.

## Features

- 🗺️ Interactive map of Sweden using OpenStreetMap
- 🎯 50+ Swedish cities including major cities and smaller towns
- 📊 Real-time scoring based on distance accuracy
- 📱 Responsive design that works on mobile devices
- 🔄 Randomized questions for replay value
- 🏆 Performance ratings and final score

## Technologies Used

- **Leaflet.js** - Interactive maps
- **OpenStreetMap** - Map tiles
- **Vanilla JavaScript** - Game logic
- **CSS3** - Modern styling with gradients and animations
- **HTML5** - Semantic structure

## File Structure

```
map-city-quiz/
├── index.html      # Main HTML file
├── style.css       # Styles and responsive design
├── script.js       # Game logic and map interactions
├── cities.js       # Database of Swedish cities with coordinates
└── README.md       # This file
```

## Customization

You can easily customize the quiz by editing `cities.js`:
- Add more cities with their coordinates
- Change the number of questions (modify `totalQuestions` in `script.js`)
- Adjust the scoring system in the `calculatePoints()` function

## Browser Compatibility

Works on all modern browsers including:
- Chrome/Chromium
- Firefox
- Safari
- Edge

Enjoy testing your knowledge of Swedish geography! 🇸🇪