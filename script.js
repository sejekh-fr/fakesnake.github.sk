// --- Game Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

// Game constants
const TILE_SIZE = 20;
const CANVAS_SIZE = 400; // Must match canvas width/height in HTML
const TILE_COUNT = CANVAS_SIZE / TILE_SIZE;

let snake = [{ x: 10, y: 10 }]; // Initial snake position (start at center-ish)
let food = { x: 15, y: 10 };
let dx = 1; // x velocity (start moving right)
let dy = 0; // y velocity
let score = 0;
let gameLoopId; // To control the game interval
let gameSpeed = 150; // Initial speed in milliseconds (smaller is faster)

// --- Utility Functions ---

function drawTile(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#000000'; // Add a border for visibility
    ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function generateFood() {
    let newFood;
    do {
        // Generate random coordinates within the grid
        newFood = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
    } while (isFoodOnSnake(newFood)); // Ensure food doesn't spawn on the snake

    food = newFood;
}

function isFoodOnSnake(pos) {
    return snake.some(segment => segment.x === pos.x && segment.y === pos.y);
}

// --- Game Logic ---

function updateGame() {
    // 1. Calculate the new head position
    const newHead = { x: snake[0].x + dx, y: snake[0].y + dy };

    // 2. Check for game over (Collision with wall or self)
    if (
        newHead.x < 0 || newHead.x >= TILE_COUNT ||
        newHead.y < 0 || newHead.y >= TILE_COUNT ||
        checkSelfCollision(newHead)
    ) {
        return gameOver();
    }

    // 3. Add the new head to the beginning of the snake
    snake.unshift(newHead);

    // 4. Check if the snake ate the food
    if (newHead.x === food.x && newHead.y === food.y) {
        // Increase score, generate new food, and speed up
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        generateFood();
        // Optional: Speed up the game after eating
        if (gameSpeed > 50) {
            gameSpeed -= 5;
            clearInterval(gameLoopId);
            gameLoopId = setInterval(main, gameSpeed);
        }
    } else {
        // If no food, remove the tail to make it move
        snake.pop();
    }
}

function checkSelfCollision(head) {
    // Check if the new head position collides with any part of the existing snake body
    // Start checking from the second segment (index 1)
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    return false;
}

function drawGame() {
    // 1. Clear the canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 2. Draw the food
    drawTile(food.x, food.y, 'red');

    // 3. Draw the snake
    snake.forEach((segment, index) => {
        // Head is dark green, body is light green
        const color = index === 0 ? 'darkgreen' : 'green';
        drawTile(segment.x, segment.y, color);
    });
}

function gameOver() {
    clearInterval(gameLoopId);
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`Final Score: ${score}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 20);
    alert(`Game Over! Your final score is: ${score}`);
}

// --- Input Handling ---

document.addEventListener('keydown', (e) => {
    // Prevent the snake from reversing direction (e.g., from right to left)
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 's':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

// --- Main Loop ---

function main() {
    updateGame();
    drawGame();
}

// Start the game!
gameLoopId = setInterval(main, gameSpeed);