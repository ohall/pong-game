// Game elements
const ball = document.getElementById('ball');
const paddleLeft = document.getElementById('paddle-left');
const paddleRight = document.getElementById('paddle-right');
const playerScore = document.getElementById('player-score');
const aiScore = document.getElementById('ai-score');
const startBtn = document.getElementById('start-btn');
const gameContainer = document.querySelector('.game-container');

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
    }

    // Paddle collision
    if (
        ballX <= paddleWidth + 10 &&
        ballY + ballSize >= paddleLeftY &&
        ballY <= paddleLeftY + paddleHeight
    ) {
        handlePaddleCollision(paddleLeftY, true);
    } else if (
        ballX >= gameWidth - paddleWidth - ballSize - 10 &&
        ballY + ballSize >= paddleRightY &&
        ballY <= paddleRightY + paddleHeight
    ) {
        handlePaddleCollision(paddleRightY, false);
    }

    // Score points
    if (ballX < 0) {
        aiPoints++;
        aiScore.textContent = aiPoints;
        resetBall();
    } else if (ballX > gameWidth - ballSize) {
        playerPoints++;
        playerScore.textContent = playerPoints;
        resetBall();
    }

    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
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

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    updateBall();
    updatePaddles();
    
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