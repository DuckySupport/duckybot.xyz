function isMobile() {
    return window.innerWidth <= 768;
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (!mobileMenu) return;
    
    mobileMenu.classList.toggle('active');
    
    if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function setupMobileMenuLinks() {
    const mobileLinks = document.querySelectorAll('#mobileMenu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMobileMenu();
        });
    });
}

async function loadFeedback() {
    const container = document.getElementById('feedbackSlider');
    if (!container) return;
    
    if (isMobile()) {
        container.className = 'grid grid-cols-1 gap-4';
    } else {
        container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }

    try {
        const response = await fetch('https://api.duckybot.xyz/feedback');
        const { data: reviews } = await response.json();

        if (!reviews || reviews.length === 0) {
            container.innerHTML = '<div class="col-span-3 text-center text-white/60">Unable to fetch reviews.</div>';
            return;
        }

        const filteredReviews = reviews.filter(review => review.rating >= 4);

        if (filteredReviews.length === 0) {
            container.innerHTML = '<div class="col-span-3 text-center text-white/60">No reviews with 4 or 5 stars.</div>';
            return;
        }

        container.innerHTML = '';

        const maxReviews = isMobile() ? 3 : 6;
        const shuffledReviews = filteredReviews
            .sort(() => Math.random() - 0.5)
            .slice(0, maxReviews);

        shuffledReviews.forEach((review, index) => {
            const card = document.createElement('div');
            card.className = 'glass-card p-8 opacity-0';
            
            const delay = isMobile() ? index * 0.15 : index * 0.2;
            card.style.animation = `fadeInSlide 0.5s ease-out ${delay}s forwards`;

            const starSize = isMobile() ? 'w-5 h-5' : 'w-6 h-6';
            const filledStars = `<img src="https://duckybot.xyz/images/star.png" class="${starSize} inline-block mx-[2px]">`.repeat(review.rating);
            const emptyStars = `<img src="https://duckybot.xyz/images/star-empty.png" class="${starSize} inline-block mx-[2px]">`.repeat(5 - review.rating);

            const avatarSize = isMobile() ? 'w-16 h-16' : 'w-20 h-20';
            const usernameMaxWidth = isMobile() ? 'max-w-[150px]' : 'max-w-[200px]';
            
            card.innerHTML = `
                <div class="flex flex-col items-center gap-3 mb-4">
                    <img src="${review.submitter.avatar}" alt="${review.submitter.username}"
                        class="${avatarSize} rounded-full">
                    <div class="text-center">
                        <h4 class="font-semibold text-lg truncate ${usernameMaxWidth}">${review.submitter.username}</h4>
                        <div class="text-primary text-lg mt-2">${filledStars}${emptyStars}</div>
                    </div>
                </div>
                <p class="text-white/60 text-base text-center">${review.feedback}</p>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to fetch feedback:', error);
        container.innerHTML = '<div class="col-span-3 text-center text-white/60">Unable to fetch reviews.</div>';
    }
}

function showReviewInfo() {
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 opacity-0 transition-opacity duration-300';
    popup.onclick = (e) => {
        if (e.target === popup) {
            closeReviewPopup(popup);
        }
    };
    
    const padding = isMobile() ? 'p-6' : 'p-8 md:p-12';
    const titleSize = isMobile() ? 'text-xl' : 'text-xl md:text-3xl';
    const textSize = isMobile() ? 'text-sm' : 'text-base md:text-lg';
    
    popup.innerHTML = `
        <div class="glass-card ${padding} w-full max-w-2xl mx-4 relative transform scale-95 transition-transform duration-300">
            <button onclick="closeReviewPopup(this.closest('.fixed'))" class="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-300">
                <i class="fas fa-times text-xl"></i>
            </button>
            <h3 class="${titleSize} font-bold mb-4">How to Leave a Review</h3>
            <ol class="text-white/60 space-y-3 ${textSize}">
                <li class="flex items-start gap-3">
                    <span>1.</span>
                    <span>Join our <a href="/support" class="text-primary hover:text-primary/90 transition-colors duration-300">support server</a> or any server where Ducky is present</span>
                </li>
                <li class="flex items-start gap-3">
                    <span>2.</span>
                    <span>Use the command <code class="bg-secondary px-2 py-1 rounded text-primary">/botreview</code></span>
                </li>                            
                <li class="flex items-start gap-3">
                    <span>3.</span>
                    <span>Fill in the rating and feedback options in the command</span>
                </li>
            </ol>
        </div>
    `;
    document.body.appendChild(popup);
    
    document.body.style.overflow = 'hidden';
    
    requestAnimationFrame(() => {
        popup.style.opacity = '1';
        popup.querySelector('.glass-card').style.transform = 'scale(1)';
    });
}

function closeReviewPopup(popup) {
    if (!popup) return;
    
    popup.style.opacity = '0';
    popup.querySelector('.glass-card').style.transform = 'scale(95%)';
    
    document.body.style.overflow = '';
    
    setTimeout(() => popup.remove(), 300);
}

let cachedStats = null;

function fetchStats() {
    if (cachedStats) return Promise.resolve(cachedStats);

    return fetch('https://api.duckybot.xyz/statistics')
        .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch stats'))
        .then(data => {
            cachedStats = data && data.data ? data.data : null;
            return cachedStats;
        })
        .catch(error => {
            console.error('Stats fetch failed:', error);
            return null;
        });
}

function loadInitialVersion() {
    const versionElement = document.getElementById('duckyVersionText');
    if (!versionElement) return;

    fetchStats().then(data => {
        if (data && data.version) {
            versionElement.textContent = data.version;
        } else {
            versionElement.textContent = 'v1.0.0 Stable';
        }
    });
};


function animateStats() {
    const stats = {
        servers: 3000,
        users: 300000,
        links: 14000
    };

    fetchStats().then(data => {
        if (data) {
            stats.servers = data.guilds || stats.servers;
            stats.users = data.users || stats.users;
            stats.links = data.links || stats.links;
        }
    }).finally(() => {
        animateCounter('serverCount', stats.servers);
        animateCounter('userCount', stats.users);
        animateCounter('linkCount', stats.links);
    });
}

function animateCounter(id, target) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const duration = isMobile() ? 1500 : 2000;
    let startTime = null;
    const startValue = 0;
    
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentValue = Math.floor(startValue + progress * (target - startValue));
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(step);
}

function handleResize() {
    const wasMobile = window.innerWidth <= 768;
    const isMobileNow = isMobile();
    
    if (wasMobile !== isMobileNow) {
        loadFeedback();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setupMobileMenuLinks();
    
    loadFeedback();

    loadInitialVersion();
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === 'serverCount') {
                    animateStats();
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { threshold: 0.1 });
    
    const statsCounter = document.getElementById('serverCount');
    if (statsCounter) {
        observer.observe(statsCounter);
    }
    
    const threshold = isMobile() ? 0.05 : 0.1;
    const rootMargin = isMobile() ? '30px' : '50px';
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.classList.add('animate-slide-up');
                animationObserver.unobserve(element);
            }
        });
    }, { threshold, rootMargin });
    
    document.querySelectorAll('.card').forEach(card => {
        if (!card.classList.contains('animate-slide-up')) {
            animationObserver.observe(card);
        }
    });
    
    window.addEventListener('resize', handleResize);
});