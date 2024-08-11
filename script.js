const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const pauseButton = document.getElementById('pauseButton');
const restartButton = document.getElementById('restartButton');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let dx = 1;
let dy = 0;
let score = 0;
let highScore = 0;
let gameLoop;
let isPaused = false;
let moveCounter = 0;
const moveInterval = 10; // Adjust this to change speed (higher = slower)

document.addEventListener('keydown', changeDirection);
pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', restartGame);

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    if (isPaused) return;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

function moveSnake() {
    const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };
    
    // Wrap around the screen
    head.x = (head.x + tileCount) % tileCount;
    head.y = (head.y + tileCount) % tileCount;
    
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = `Score: ${score}`;
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    for (let segment of snake) {
        if (food.x === segment.x && food.y === segment.y) {
            generateFood();
            return;
        }
    }
}

function drawSnake() {
    const segmentSize = gridSize * 0.8;
    const eyeSize = gridSize * 0.15;
    
    // Draw body
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
        ctx.beginPath();
        ctx.arc(
            segment.x * gridSize + gridSize / 2,
            segment.y * gridSize + gridSize / 2,
            segmentSize / 2,
            0,
            2 * Math.PI
        );
        ctx.fill();
        
        // Connect segments
        if (index > 0) {
            ctx.beginPath();
            ctx.moveTo(
                segment.x * gridSize + gridSize / 2,
                segment.y * gridSize + gridSize / 2
            );
            ctx.lineTo(
                snake[index - 1].x * gridSize + gridSize / 2,
                snake[index - 1].y * gridSize + gridSize / 2
            );
            ctx.lineWidth = segmentSize;
            ctx.strokeStyle = '#4CAF50';
            ctx.stroke();
        }
    });
    
    // Draw eyes
    const head = snake[0];
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(
        head.x * gridSize + gridSize / 2 + dx * gridSize * 0.2,
        head.y * gridSize + gridSize / 2 + dy * gridSize * 0.2 - dx * gridSize * 0.2,
        eyeSize,
        0,
        2 * Math.PI
    );
    ctx.arc(
        head.x * gridSize + gridSize / 2 + dx * gridSize * 0.2,
        head.y * gridSize + gridSize / 2 + dy * gridSize * 0.2 + dx * gridSize * 0.2,
        eyeSize,
        0,
        2 * Math.PI
    );
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(
        head.x * gridSize + gridSize / 2 + dx * gridSize * 0.25,
        head.y * gridSize + gridSize / 2 + dy * gridSize * 0.25 - dx * gridSize * 0.2,
        eyeSize * 0.5,
        0,
        2 * Math.PI
    );
    ctx.arc(
        head.x * gridSize + gridSize / 2 + dx * gridSize * 0.25,
        head.y * gridSize + gridSize / 2 + dy * gridSize * 0.25 + dx * gridSize * 0.2,
        eyeSize * 0.5,
        0,
        2 * Math.PI
    );
    ctx.fill();
}

function drawGame() {
    ctx.fillStyle = '#F0F0F0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawSnake();

    // Draw food
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 1, 0, 2 * Math.PI);
    ctx.fill();
}

function checkCollision() {
    const head = snake[0];

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = `High Score: ${highScore}`;
    }
}

function endGame() {
    cancelAnimationFrame(gameLoop);
    updateHighScore();
    restartButton.style.display = 'inline-block';
    pauseButton.style.display = 'none';
}

function restartGame() {
    snake = [{x: 10, y: 10}];
    food = {x: 15, y: 15};
    dx = 1;
    dy = 0;
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    restartButton.style.display = 'none';
    pauseButton.style.display = 'inline-block';
    isPaused = false;
    pauseButton.textContent = 'Pause';
    startGame();
}

function togglePause() {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    if (!isPaused) {
        startGame();
    } else {
        cancelAnimationFrame(gameLoop);
    }
}

function game() {
    if (!isPaused) {
        if (checkCollision()) {
            endGame();
            return;
        }

        moveCounter++;
        if (moveCounter >= moveInterval) {
            moveSnake();
            moveCounter = 0;
        }

        drawGame();
    }

    gameLoop = requestAnimationFrame(game);
}

function startGame() {
    gameLoop = requestAnimationFrame(game);
}

startGame();