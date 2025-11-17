const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let trexImage = new Image();
trexImage.src = 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Chromium_T-Rex-error-offline.svg';

let birdImage = new Image();
birdImage.src = "https://upload.wikimedia.org/wikipedia/commons/d/d5/Chrome_Pterodactyl.png";

// let rockImage = new Image();
// rockImage.src = "https://upload.wikimedia.org/wikipedia/commons/f/f0/Rock.png"

let trex = {
    x: 50,
    y: 255,
    width: 45,
    height: 45,
    velocityY: 0,
    gravity: 0.9,
    isJumping: false
};

let obstacles = [];
let frameCount = 0;
let isGameOver = false;
let score = 0;
let minFrames = 150;
let maxFrames = 350;
let currentThreshIndex = -1; //starts at -1 so index is zero in later logic
let nextBirdSpawnFrame = frameCount + randomIntFromInterval(minFrames, maxFrames);
let gameSpeed = 4

const speedThresholds = [
    { score: 50, minFrames: 120, maxFrames: 300, gameSpeed: 5},
    { score: 75, minFrames: 110, maxFrames: 250, gameSpeed: 5},
    { score: 100, minFrames: 90, maxFrames: 150, gameSpeed: 6},
    { score: 150, minFrames: 75, maxFrames: 125, gameSpeed: 6},
    { score: 200, minFrames: 50, maxFrames: 75, gameSpeed: 7},
    { score: 250, minFrames: 50, maxFrames: 60, gameSpeed: 7},
];

document.addEventListener('keydown', function (event) {
    if ((event.key === ' ' || event.key === 'ArrowUp') && !trex.isJumping && !isGameOver) {
        jump();
    }
});

document.addEventListener('touchstart', function () {
    if (!trex.isJumping && !isGameOver) {
        jump();
    }
});

function randomIntFromInterval(min, max){
    return Math.floor(Math.random()*(max - min + 1)) + min
}

function jump() {
    trex.isJumping = true;
    trex.velocityY = -15;
}

function update() {
    if (isGameOver) return;

    // Apply gravity
    trex.velocityY += trex.gravity;
    trex.y += trex.velocityY;

    if (trex.y >= 255) {
        trex.y = 255;
        trex.isJumping = false;
        trex.velocityY = 0;
    }

    // Spawn rock obstacles at regular intervals
    if (frameCount % 150 === 0) {
        let obstacle = {
            x: canvas.width,
            y: 270,
            width: 30,
            height: 30,
            type: "rock"
        }; 
        obstacles.push(obstacle)
    }
    // Check score thresholds and increase speed of bird spawning by decreasing interval between min and max frames
    if (currentThreshIndex + 1 < speedThresholds.length) {
        const nextThresh = speedThresholds[currentThreshIndex + 1]
        if (score >= nextThresh.score){
            minFrames = nextThresh.minFrames
            maxFrames = nextThresh.maxFrames
            gameSpeed = nextThresh.gameSpeed
            currentThreshIndex++
        }
    }
    // // Spawn cactus obstacles 
    // if (frameCount % 400 === 0) {
    //     let cactus = {
    //         x: canvas.width,
    //         y: 250,
    //         width: 15,
    //         height: 40,
    //         type: "cactus",
    //     };  
    //     obstacles.push(cactus);
    // }

    // Spawn bird obstacles
    if (frameCount >= nextBirdSpawnFrame) {
        let bird = {
            x: canvas.width,
            y: randomIntFromInterval(100, 210),
            width: 25,
            height: 20,
            type: "bird"
        };
        obstacles.push(bird)
        nextBirdSpawnFrame = frameCount + randomIntFromInterval(minFrames, maxFrames)
    }

    // Update obstacles
    obstacles.forEach((obstacle, index) => {
        if (obstacle.type === "bird"){
            obstacle.x -= (gameSpeed+2) 
        } 
        else if (obstacle.type === "rock") {
            obstacle.x -= (gameSpeed)
        }
        // else if (obstacle.type === "cactus") {
        //     obstacle.x -= (gameSpeed -1)
        // }
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score += 10
        }

        // Check for collision
        if (
            trex.x < obstacle.x + obstacle.width &&
            trex.x + trex.width > obstacle.x &&
            trex.y < obstacle.y + obstacle.height &&
            trex.y + trex.height > obstacle.y
        ) {
            isGameOver = true;
        }
    });
}

function draw() {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Trex
    ctx.drawImage(trexImage, trex.x, trex.y, trex.width, trex.height);

    // Draw obstacles
    obstacles.forEach(obstacle => {
        if (obstacle.type === "rock"){
            ctx.fillStyle = 'brown'
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
        }
        else if (obstacle.type == "bird") {
            ctx.drawImage(birdImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height)
        }
        // else if (obstacle.type === "cactus") {
        //     ctx.fillStyle = "green";
        //     // main body
        //     ctx.fillRect(obstacle.x, obstacle.y + 5, obstacle.width, obstacle.height);
        //     // left arm
        //     ctx.fillRect(obstacle.x - 5, obstacle.y - 2, obstacle.width - 10, obstacle.height - 20);
        //     // right arm
        //     ctx.fillRect(obstacle.x + 15, obstacle.y - 2, obstacle.width - 10, obstacle.height - 20);
        // }
    });


    // Draw game over text including final score
    if (isGameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
        ctx.fillText(`Final Score: ${score}`, canvas.width/2 -80, canvas.height/2 + 40);
    }

    // // Draw score text while game is active
    if (!isGameOver){
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText(`Score: ${score}`, 50, 50);
    }
}

function gameLoop() {
    frameCount++;
    update();
    draw();
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

requestAnimationFrame(gameLoop);


