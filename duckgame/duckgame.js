const dino = document.getElementById("dino");
const obstacle = document.getElementById("obstacle");
const scoreDisplay = document.getElementById("score");
const gameArea = document.querySelector(".game");

let score = 0;
let isGameRunning = false;
let scoreInterval;
let isAliveInterval;
let gameSpeed = 2; 

function showToast(message, type = 'info') {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        </div>
    `;
    
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = type === 'success' ? 'rgba(245, 255, 130, 0.9)' : 'rgba(15, 15, 15, 0.9)';
    toast.style.color = type === 'success' ? '#12131a' : '#fff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    toast.style.zIndex = '1000';
    toast.style.maxWidth = '300px';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.border = '1px solid rgba(245, 255, 130, 0.2)';
    toast.style.fontFamily = 'Inter, sans-serif';
    toast.style.fontSize = '14px';
    toast.style.transition = 'all 0.3s ease';
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
    
    toast.querySelector('.toast-close').style.background = 'none';
    toast.querySelector('.toast-close').style.border = 'none';
    toast.querySelector('.toast-close').style.color = type === 'success' ? '#12131a' : '#fff';
    toast.querySelector('.toast-close').style.fontSize = '18px';
    toast.querySelector('.toast-close').style.cursor = 'pointer';
    toast.querySelector('.toast-close').style.marginLeft = '10px';
    toast.querySelector('.toast-close').onclick = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    };
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function showHowToPlay() {
    const modal = document.createElement('div');
    modal.className = 'how-to-play-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-button">&times;</button>
            <h2>How to Play</h2>
            <ul>
                <li>Press any key or tap the game area to make Ducky jump</li>
                <li>Avoid the running geese by jumping over them</li>
                <li>Your score increases the longer you survive</li>
                <li>The game gets faster as your score increases</li>
            </ul>
            <button class="got-it-button">Got it!</button>
        </div>
    `;
    
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.backgroundColor = '#1a1a1a';
    modalContent.style.padding = '30px';
    modalContent.style.borderRadius = '12px';
    modalContent.style.maxWidth = '500px';
    modalContent.style.width = '90%';
    modalContent.style.position = 'relative';
    modalContent.style.border = '1px solid rgba(245, 255, 130, 0.2)';
    modalContent.style.backdropFilter = 'blur(10px)';
    
    const closeButton = modal.querySelector('.close-button');
    closeButton.style.position = 'absolute';
    closeButton.style.top = '15px';
    closeButton.style.right = '15px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = '#fff';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    
    const heading = modal.querySelector('h2');
    heading.style.color = '#F5FF82';
    heading.style.marginBottom = '20px';
    heading.style.fontSize = '24px';
    heading.style.fontWeight = 'bold';
    
    const list = modal.querySelector('ul');
    list.style.color = '#d1d1d1';
    list.style.marginBottom = '25px';
    list.style.paddingLeft = '20px';
    
    const listItems = modal.querySelectorAll('li');
    listItems.forEach(item => {
        item.style.marginBottom = '10px';
        item.style.lineHeight = '1.5';
    });
    
    const gotItButton = modal.querySelector('.got-it-button');
    gotItButton.style.backgroundColor = '#F5FF82';
    gotItButton.style.color = '#12131a';
    gotItButton.style.border = 'none';
    gotItButton.style.padding = '10px 20px';
    gotItButton.style.borderRadius = '8px';
    gotItButton.style.cursor = 'pointer';
    gotItButton.style.fontWeight = 'bold';
    gotItButton.style.display = 'block';
    gotItButton.style.margin = '0 auto';
    
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    gotItButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    document.body.appendChild(modal);
}

function initGame() {
    score = 0;
    scoreDisplay.innerText = `Score: ${score}`;
    
    obstacle.style.animation = 'none';
    obstacle.offsetHeight;
    obstacle.style.animation = `moveObstacle ${gameSpeed}s linear infinite`;
    
    isGameRunning = true;
    
    scoreInterval = setInterval(function() {
        score++;
        scoreDisplay.innerText = `Score: ${score}`;
        
        if (score % 10 === 0 && score > 0) {
            increaseSpeed();
        }
    }, 1000);
    
    isAliveInterval = setInterval(checkCollision, 10);
}

function jump() {
    if (!isGameRunning) {
        initGame();
        return;
    }
    
    if (!dino.classList.contains("jump")) {
        dino.classList.add("jump");
        
        setTimeout(function() {
            dino.classList.remove("jump");
        }, 500);
    }
}

function increaseSpeed() {
    if (gameSpeed > 0.7) {
        gameSpeed -= 0.1;
        obstacle.style.animation = 'none';
        obstacle.offsetHeight; 
        obstacle.style.animation = `moveObstacle ${gameSpeed}s linear infinite`;
    }
}

// Check for collision
function checkCollision() {
    let dinoRect = dino.getBoundingClientRect();
    let obstacleRect = obstacle.getBoundingClientRect();
    
    let overlapX = dinoRect.right > obstacleRect.left + 10 && dinoRect.left < obstacleRect.right - 10;
    let overlapY = dinoRect.bottom > obstacleRect.top + 15;
    
    if (overlapX && overlapY) {
        gameOver();
    }
}

function gameOver() {
    clearInterval(scoreInterval);
    clearInterval(isAliveInterval);
    obstacle.style.animation = 'none';
    isGameRunning = false;
    
    showToast(`Game Over! Your final score is ${score}`, 'info');
}

function resetGame() {
    gameSpeed = 2;
    
    score = 0;
    scoreDisplay.innerText = `Score: ${score}`;
    
    obstacle.style.animation = 'none';
    
    setTimeout(function() {
        initGame();
    }, 100);
}

document.addEventListener("keydown", function(event) {
    jump();
});

gameArea.addEventListener("touchstart", function(event) {
    event.preventDefault(); 
    jump();
});

gameArea.addEventListener("click", function(event) {
    event.stopPropagation(); 
    jump();
});

document.addEventListener("click", function(event) {
    if (isGameRunning && !gameArea.contains(event.target)) {
        gameOver();
        showToast("Game paused. Click the game area to restart.", 'info');
    }
});

function toggleMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = document.body.style.overflow === 'hidden' ? '' : 'hidden';
}

const restartBtn = document.getElementById("restartBtn");
if (restartBtn) {
    restartBtn.addEventListener("click", resetGame);
}

document.addEventListener("DOMContentLoaded", function() {
    obstacle.style.animation = 'none';
    
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        const howToPlayLink = document.createElement('a');
        howToPlayLink.href = '#';
        howToPlayLink.className = 'text-gray-300 hover:text-[#F5FF82] transition';
        howToPlayLink.textContent = 'How to Play';
        howToPlayLink.addEventListener('click', function(e) {
            e.preventDefault();
            showHowToPlay();
        });
        
        navLinks.insertBefore(howToPlayLink, navLinks.lastElementChild);
    }
    
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        const howToPlayMobile = document.createElement('a');
        howToPlayMobile.href = '#';
        howToPlayMobile.className = 'text-xl text-gray-300 hover:text-[#F5FF82] transition';
        howToPlayMobile.textContent = 'How to Play';
        howToPlayMobile.addEventListener('click', function(e) {
            e.preventDefault();
            showHowToPlay();
            toggleMenu(); 
        });
        
        mobileMenu.insertBefore(howToPlayMobile, mobileMenu.lastElementChild);
    }
});