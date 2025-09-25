class SwedishCityQuiz {
    constructor() {
        this.map = null;
        this.currentCityIndex = 0;
        this.score = 0;
        this.totalQuestions = 10;
        this.questionCities = [];
        this.userMarker = null;
        this.correctMarker = null;
        this.gameActive = false;

        this.init();
    }

    init() {
        this.initMap();
        this.selectRandomCities();
        this.setupEventListeners();
        this.startGame();
    }

    initMap() {
        // Initialize the map centered on Sweden
        this.map = L.map('map').setView([62.0, 15.0], 5);

        // Use CartoDB Positron tiles which have minimal labels, or try to use a label-free version
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors, © CARTO',
            subdomains: 'abcd',
            maxZoom: 18,
        }).addTo(this.map);

        // Fallback: Add CSS to hide any remaining labels
        const style = document.createElement('style');
        style.textContent = `
            .leaflet-container text,
            .leaflet-tile-pane .leaflet-layer text,
            .leaflet-control-attribution {
                font-size: 0 !important;
                opacity: 0 !important;
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        // Add click event listener to place the initial pin
        this.map.on('click', (e) => this.onMapClick(e));
    } selectRandomCities() {
        // Shuffle and select random cities
        const shuffled = [...swedishCities].sort(() => 0.5 - Math.random());
        this.questionCities = shuffled.slice(0, this.totalQuestions);

        // Update total questions display
        document.getElementById('total-questions').textContent = this.totalQuestions;
    }

    setupEventListeners() {
        document.getElementById('submit-btn').addEventListener('click', () => this.submitAnswer());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
    }

    startGame() {
        this.gameActive = true;
        this.currentCityIndex = 0;
        this.score = 0;
        this.updateScore();
        this.showCurrentCity();
    }

    showCurrentCity() {
        if (this.currentCityIndex >= this.questionCities.length) {
            this.endGame();
            return;
        }

        const city = this.questionCities[this.currentCityIndex];
        document.getElementById('city-name').textContent = city.name;
        document.getElementById('current-question').textContent = this.currentCityIndex + 1;

        // Show pin instructions and hide previous results
        document.getElementById('pin-instruction').style.display = 'block';
        document.getElementById('distance-info').style.display = 'none';
        document.getElementById('submit-btn').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';

        // Clear previous markers
        this.clearMarkers();

        this.gameActive = true;
    } onMapClick(e) {
        if (!this.gameActive) return;

        const userLat = e.latlng.lat;
        const userLng = e.latlng.lng;

        // Remove existing user marker if any
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
        }

        // Place draggable user marker
        this.userMarker = L.marker([userLat, userLng], {
            draggable: true,
            icon: L.divIcon({
                className: 'custom-pin user-pin',
                html: '📍',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            })
        }).addTo(this.map);

        this.userMarker.bindPopup('<div class="pin-popup user-pin">Your guess - drag to move!</div>');

        // Show submit button
        document.getElementById('submit-btn').style.display = 'inline-block';
        document.getElementById('pin-instruction').style.display = 'none';

        // Add drag event listeners
        this.userMarker.on('dragstart', () => {
            this.userMarker.closePopup();
        });

        this.userMarker.on('dragend', () => {
            this.userMarker.openPopup();
        });
    }

    submitAnswer() {
        if (!this.userMarker || !this.gameActive) return;

        const userLat = this.userMarker.getLatLng().lat;
        const userLng = this.userMarker.getLatLng().lng;
        const currentCity = this.questionCities[this.currentCityIndex];

        // Update user marker to non-draggable and change popup
        this.userMarker.dragging.disable();
        this.userMarker.bindPopup('<div class="pin-popup user-pin">Your final answer</div>');

        // Place correct marker
        this.correctMarker = L.marker([currentCity.lat, currentCity.lng], {
            icon: L.divIcon({
                className: 'custom-pin correct-pin',
                html: '✅',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            })
        }).addTo(this.map);

        this.correctMarker.bindPopup(`<div class="pin-popup correct-pin">${currentCity.name}</div>`);

        // Calculate distance and score
        const distance = this.calculateDistance(userLat, userLng, currentCity.lat, currentCity.lng);
        const points = this.calculatePoints(distance);

        this.score += points;
        this.updateScore();

        // Show results
        this.showResults(distance, points, currentCity.name);

        // Fit map to show both markers
        const group = new L.featureGroup([this.userMarker, this.correctMarker]);
        this.map.fitBounds(group.getBounds().pad(0.1));

        // Hide submit button and show next button
        document.getElementById('submit-btn').style.display = 'none';

        this.gameActive = false;
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLng = this.deg2rad(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return Math.round(distance);
    }

    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    calculatePoints(distance) {
        // Scoring system: closer = more points
        // Perfect (0-10km): 100 points
        // Excellent (10-50km): 80-99 points  
        // Good (50-100km): 50-79 points
        // Average (100-200km): 25-49 points
        // Poor (200km+): 0-24 points

        if (distance <= 10) return 100;
        if (distance <= 50) return Math.max(80, 100 - Math.floor((distance - 10) / 2));
        if (distance <= 100) return Math.max(50, 80 - Math.floor((distance - 50) / 2));
        if (distance <= 200) return Math.max(25, 50 - Math.floor((distance - 100) / 4));
        return Math.max(0, 25 - Math.floor((distance - 200) / 20));
    }

    showResults(distance, points, cityName) {
        const distanceInfo = document.getElementById('distance-info');
        const distanceText = document.getElementById('distance-text');
        const pointsEarned = document.getElementById('points-earned');

        let accuracy = '';
        if (distance <= 10) accuracy = 'Perfect! 🎯';
        else if (distance <= 50) accuracy = 'Excellent! 🌟';
        else if (distance <= 100) accuracy = 'Good! 👍';
        else if (distance <= 200) accuracy = 'Not bad! 👌';
        else accuracy = 'Keep trying! 💪';

        distanceText.textContent = `${distance} km from ${cityName} - ${accuracy}`;
        pointsEarned.textContent = `+${points} points`;

        distanceInfo.style.display = 'block';
        document.getElementById('next-btn').style.display = 'inline-block';
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    nextQuestion() {
        this.currentCityIndex++;

        // Reset map view to Sweden
        this.map.setView([62.0, 15.0], 5);

        this.showCurrentCity();
    }

    clearMarkers() {
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
            this.userMarker = null;
        }
        if (this.correctMarker) {
            this.map.removeLayer(this.correctMarker);
            this.correctMarker = null;
        }
    }

    endGame() {
        this.gameActive = false;

        // Hide game elements
        document.querySelector('.question-panel').style.display = 'none';
        document.querySelector('.controls').style.display = 'none';

        // Show final score
        const finalScoreDiv = document.getElementById('final-score');
        const finalScoreValue = document.getElementById('final-score-value');
        const scoreRating = document.getElementById('score-rating');

        finalScoreValue.textContent = this.score;

        // Calculate rating
        const percentage = (this.score / (this.totalQuestions * 100)) * 100;
        let rating = '';
        let ratingClass = '';

        if (percentage >= 90) {
            rating = 'Outstanding! You know Sweden very well! 🏆';
            ratingClass = 'score-excellent';
        } else if (percentage >= 75) {
            rating = 'Great job! Impressive knowledge! 🌟';
            ratingClass = 'score-excellent';
        } else if (percentage >= 60) {
            rating = 'Good work! Keep exploring! 👍';
            ratingClass = 'score-good';
        } else if (percentage >= 40) {
            rating = 'Not bad! Room for improvement! 👌';
            ratingClass = 'score-average';
        } else {
            rating = 'Keep learning! Sweden has many beautiful places! 💪';
            ratingClass = 'score-poor';
        }

        scoreRating.textContent = rating;
        scoreRating.className = ratingClass;

        finalScoreDiv.style.display = 'block';
        document.getElementById('restart-btn').style.display = 'inline-block';

        // Clear markers
        this.clearMarkers();

        // Reset map view
        this.map.setView([62.0, 15.0], 5);
    }

    restartGame() {
        // Reset UI
        document.querySelector('.question-panel').style.display = 'block';
        document.querySelector('.controls').style.display = 'block';
        document.getElementById('final-score').style.display = 'none';
        document.getElementById('restart-btn').style.display = 'none';

        // Select new random cities
        this.selectRandomCities();

        // Start new game
        this.startGame();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SwedishCityQuiz();
});