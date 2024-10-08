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
    // Get current dino Y position
    let dinoBottom = parseInt(window.getComputedStyle(dino).getPropertyValue("bottom"));

    // Get current obstacle X position
    let obstacleLeft = parseInt(window.getComputedStyle(obstacle).getPropertyValue("right"));

    // Adjusted collision detection with a smaller range
    if (obstacleLeft > 520 && obstacleLeft < 580 && dinoBottom <= 20) {
        alert(`Game Over! Your final score is ${score}`);
        clearInterval(scoreInterval);
        clearInterval(isAlive);
        location.reload(); // Reloads the game on Game Over
    }
}, 10);
