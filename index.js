function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
    console.log('Mobile menu toggled');
}

async function loadFeedback() {
    const container = document.getElementById('feedbackSlider');
    container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

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

        const shuffledReviews = filteredReviews
            .sort(() => Math.random() - 0.5)
            .slice(0, 6);

        shuffledReviews.forEach((review, index) => {
            const card = document.createElement('div');
            card.className = 'glass-card p-8 opacity-0';
            card.style.animation = `fadeInSlide 0.5s ease-out ${index * 0.2}s forwards`;

            const filledStars = `<img src="https://duckybot.xyz/images/star.png" class="w-6 h-6 inline-block mx-[3px]">`.repeat(review.rating);
            const emptyStars = `<img src="https://duckybot.xyz/images/star-empty.png" class="w-6 h-6 inline-block mx-[3px]">`.repeat(5 - review.rating);

            card.innerHTML = `
                <div class="flex flex-col items-center gap-4 mb-6">
                    <img src="${review.submitter.avatar}" alt="${review.submitter.username}"
                        class="w-20 h-20 rounded-full">
                    <div class="text-center">
                        <h4 class="font-semibold text-lg truncate max-w-[200px]">${review.submitter.username}</h4>
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
    popup.innerHTML = `
        <div class="glass-card p-8 md:p-12 w-full max-w-2xl mx-4 relative transform scale-95 transition-transform duration-300">
            <button onclick="closeReviewPopup(this.closest('.fixed'))" class="absolute top-6 right-6 text-white/60 hover:text-white transition-colors duration-300">
                <i class="fas fa-times text-xl"></i>
            </button>
            <h3 class="text-xl md:text-3xl font-bold mb-6">How to Leave a Review</h3>
            <ol class="text-white/60 space-y-4 text-base md:text-lg">
                <li class="flex items-start gap-4">
                    <span>1.</span>
                    <span>Join our <a href="/support" class="text-primary hover:text-primary/90 transition-colors duration-300">support server</a> or any server where Ducky is present</span>
                </li>
                <li class="flex items-start gap-4">
                    <span>2.</span>
                    <span>Use the command <code class="bg-secondary px-2 py-1 rounded text-primary">/botreview</code></span>
                </li>                            
                <li class="flex items-start gap-4">
                    <span>3.</span>
                    <span>Fill in the rating and feedback options in the command</span>
                </li>
            </ol>
        </div>
    `;
    document.body.appendChild(popup);
    requestAnimationFrame(() => {
        popup.style.opacity = '1';
        popup.querySelector('.glass-card').style.transform = 'scale(1)';
    });
}

function closeReviewPopup(popup) {
    popup.style.opacity = '0';
    popup.querySelector('.glass-card').style.transform = 'scale(95%)';
    setTimeout(() => popup.remove(), 300);
}

function animateStats() {
    const stats = {
        servers: 1700,
        users: 250000,
        links: 6000
    };

    fetch('https://api.duckybot.xyz/statistics')
        .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch stats'))
        .then(data => {
            if (data && data.data) {
                stats.servers = data.data.guilds || stats.servers;
                stats.users = data.data.users || stats.users;
                stats.links = data.data.links || stats.links;
            }
        })
        .catch(error => {
            console.error('Stats fetch failed:', error);
        })
        .finally(() => {
            animateCounter('serverCount', stats.servers);
            animateCounter('userCount', stats.users);
            animateCounter('linkCount', stats.links);
        });
}

function animateCounter(id, target) {
    const element = document.getElementById(id);
    if (!element) return;
    
    let startTime = null;
    const duration = 2000; 
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

document.addEventListener('DOMContentLoaded', function() {
    loadFeedback();
    
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
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.classList.add('animate-slide-up');
                animationObserver.unobserve(element);
            }
        });
    }, { threshold: 0.1, rootMargin: '50px' });
    
    document.querySelectorAll('.card').forEach(card => {
        if (!card.classList.contains('animate-slide-up')) {
            animationObserver.observe(card);
        }
    });
});