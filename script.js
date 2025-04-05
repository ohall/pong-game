// Game elements
const ball = document.getElementById('ball');
const paddleLeft = document.getElementById('paddle-left');
const paddleRight = document.getElementById('paddle-right');
const playerScore = document.getElementById('player-score');
const aiScore = document.getElementById('ai-score');
const startBtn = document.getElementById('start-btn');
const gameContainer = document.querySelector('.game-container');

// Create strobe effect element
const strobeEffect = document.createElement('div');
strobeEffect.className = 'strobe';
gameContainer.appendChild(strobeEffect);

// Create floating disco lights
for (let i = 0; i < 12; i++) {
    const discoLight = document.createElement('div');
    discoLight.className = 'disco-light';
    discoLight.style.left = `${Math.random() * 100}%`;
    discoLight.style.top = `${Math.random() * 100}%`;
    discoLight.style.animationDuration = `${6 + Math.random() * 8}s`;
    discoLight.style.animationDelay = `${Math.random() * 5}s`;
    gameContainer.appendChild(discoLight);
}

// Game settings
const gameWidth = gameContainer.offsetWidth;
const gameHeight = gameContainer.offsetHeight;
const paddleHeight = 100;
const paddleWidth = 10;
const ballSize = 15;
let ballSpeedX = 5;
let ballSpeedY = 2;
let playerPoints = 0;
let aiPoints = 0;
let gameRunning = false;
let animationFrameId;
let trailElements = [];
let lastBeat = 0;
const beatInterval = 600; // milliseconds between beats

// Initial positions
let ballX = gameWidth / 2 - ballSize / 2;
let ballY = gameHeight / 2 - ballSize / 2;
let paddleLeftY = gameHeight / 2 - paddleHeight / 2;
let paddleRightY = gameHeight / 2 - paddleHeight / 2;

// Keyboard control
let keysPressed = {};

// Initialize game elements
function initializeGame() {
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
    paddleLeft.style.top = `${paddleLeftY}px`;
    paddleRight.style.top = `${paddleRightY}px`;
    playerScore.textContent = playerPoints;
    aiScore.textContent = aiPoints;
}

// Reset ball position
function resetBall() {
    ballX = gameWidth / 2 - ballSize / 2;
    ballY = gameHeight / 2 - ballSize / 2;
    ballSpeedX = ballSpeedX > 0 ? 5 : -5;
    ballSpeedY = 2;
}

// Update ball position
function updateBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Wall collision (top/bottom)
    if (ballY <= 0 || ballY >= gameHeight - ballSize) {
        ballSpeedY = -ballSpeedY;
        triggerStrobeEffect();
    }

    // Paddle collision
    if (
        ballX <= paddleWidth + 10 &&
        ballY + ballSize >= paddleLeftY &&
        ballY <= paddleLeftY + paddleHeight
    ) {
        handlePaddleCollision(paddleLeftY, true);
        triggerStrobeEffect();
    } else if (
        ballX >= gameWidth - paddleWidth - ballSize - 10 &&
        ballY + ballSize >= paddleRightY &&
        ballY <= paddleRightY + paddleHeight
    ) {
        handlePaddleCollision(paddleRightY, false);
        triggerStrobeEffect();
    }

    // Score points
    if (ballX < 0) {
        aiPoints++;
        aiScore.textContent = aiPoints;
        resetBall();
        triggerStrobeEffect(true);
    } else if (ballX > gameWidth - ballSize) {
        playerPoints++;
        playerScore.textContent = playerPoints;
        resetBall();
        triggerStrobeEffect(true);
    }

    // Create trail effect
    createTrailElement();

    // Update ball position
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
    
    // Update beat-synced effects
    updateBeatEffects();
}

// Handle paddle collision physics
function handlePaddleCollision(paddleY, isLeftPaddle) {
    // Reverse X direction
    ballSpeedX = -ballSpeedX;

    // Increase speed slightly
    if (Math.abs(ballSpeedX) < 15) {
        ballSpeedX *= 1.1;
    }

    // Calculate impact point (where on the paddle the ball hit)
    const impactPoint = (ballY + ballSize / 2 - paddleY) / paddleHeight;
    
    // Calculate angle (-45 to 45 degrees)
    const angle = (impactPoint - 0.5) * Math.PI / 2;
    
    // Set Y speed based on impact point
    ballSpeedY = Math.sin(angle) * Math.abs(ballSpeedX) * 0.75;
}

// Update paddles
function updatePaddles() {
    // Player paddle (left)
    if ((keysPressed['ArrowUp'] || keysPressed['w'] || keysPressed['W']) && paddleLeftY > 0) {
        paddleLeftY -= 7;
    }
    if ((keysPressed['ArrowDown'] || keysPressed['s'] || keysPressed['S']) && paddleLeftY < gameHeight - paddleHeight) {
        paddleLeftY += 7;
    }

    // AI paddle (right) - follows the ball
    const paddleCenter = paddleRightY + paddleHeight / 2;
    const ballCenter = ballY + ballSize / 2;
    
    // Add some delay and limitation to make AI beatable
    if (paddleCenter < ballCenter - 35) {
        paddleRightY += 5; // Move down
    } else if (paddleCenter > ballCenter + 35) {
        paddleRightY -= 5; // Move up
    }

    // Keep AI paddle within bounds
    if (paddleRightY < 0) paddleRightY = 0;
    if (paddleRightY > gameHeight - paddleHeight) paddleRightY = gameHeight - paddleHeight;

    // Update paddle positions
    paddleLeft.style.top = `${paddleLeftY}px`;
    paddleRight.style.top = `${paddleRightY}px`;
}

// Create trail element
function createTrailElement() {
    const trail = document.createElement('div');
    trail.className = 'trail';
    trail.style.width = `${ballSize * 0.8}px`;
    trail.style.height = `${ballSize * 0.8}px`;
    trail.style.left = `${ballX + ballSize/10}px`;
    trail.style.top = `${ballY + ballSize/10}px`;
    
    // Random color for rainbow effect
    const hue = Math.floor(Math.random() * 360);
    trail.style.filter = `hue-rotate(${hue}deg)`;
    
    gameContainer.appendChild(trail);
    trailElements.push({
        element: trail,
        createdAt: Date.now(),
        initialOpacity: 0.7
    });
    
    // Limit the number of trail elements to prevent performance issues
    if (trailElements.length > 40) {
        gameContainer.removeChild(trailElements[0].element);
        trailElements.shift();
    }
}

// Update trail elements
function updateTrailElements() {
    const currentTime = Date.now();
    
    trailElements.forEach((trail, i) => {
        const age = currentTime - trail.createdAt;
        if (age > 1000) {
            gameContainer.removeChild(trail.element);
            trailElements.splice(i, 1);
        } else {
            const opacity = trail.initialOpacity * (1 - age / 1000);
            const scale = 1 + (age / 1000);
            trail.element.style.opacity = opacity;
            trail.element.style.transform = `scale(${scale})`;
        }
    });
}

// Strobe effect
function triggerStrobeEffect(intense = false) {
    strobeEffect.style.opacity = intense ? 0.4 : 0.2;
    setTimeout(() => {
        strobeEffect.style.opacity = 0;
    }, 100);
}

// Beat-synced effects
function updateBeatEffects() {
    const currentTime = Date.now();
    
    if (currentTime - lastBeat > beatInterval) {
        lastBeat = currentTime;
        
        // Pulse the game container's border
        gameContainer.style.borderColor = `rgba(255, 255, 255, ${0.2 + Math.random() * 0.4})`;
        
        // Update disco lights colors
        document.querySelectorAll('.disco-light').forEach(light => {
            const hue = Math.floor(Math.random() * 360);
            light.style.filter = `hue-rotate(${hue}deg)`;
        });
    }
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    updateBall();
    updatePaddles();
    updateTrailElements();
    
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Event listeners
startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        startBtn.textContent = 'Pause';
        gameLoop();
    } else {
        gameRunning = false;
        startBtn.textContent = 'Resume';
        cancelAnimationFrame(animationFrameId);
    }
});

document.addEventListener('keydown', (e) => {
    keysPressed[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keysPressed[e.key] = false;
});

// Initialize the game
initializeGame();