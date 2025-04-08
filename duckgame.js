const dino = document.getElementById("dino");
const obstacle = document.getElementById("obstacle");
const scoreDisplay = document.getElementById("score");
let score = 0;

document.addEventListener("keydown", function () {
    jump();
});

function jump() {
    if (!dino.classList.contains("jump")) {
        dino.classList.add("jump");

        setTimeout(function () {
            dino.classList.remove("jump");
        }, 500);
    }
}

// Update score every second
let scoreInterval = setInterval(function () {
    score++;
    scoreDisplay.innerText = `Score: ${score}`;
}, 1000);

let isAlive = setInterval(function () {
    // Get current dino and obstacle positions
    let dinoRect = dino.getBoundingClientRect();
    let obstacleRect = obstacle.getBoundingClientRect();

    // Adjusted collision detection
    let overlapX = dinoRect.right > obstacleRect.left + 5 && dinoRect.left < obstacleRect.right - 5;
    let overlapY = dinoRect.bottom > obstacleRect.top + 10;

    if (overlapX && overlapY) {
        alert(`Game Over! Your final score is ${score}`);
        clearInterval(scoreInterval);
        clearInterval(isAlive);
        location.reload(); // Reloads the game on Game Over
    }
}, 10);
