const toggleBtn = document.querySelector(".toggle-btn");
const navLinks = document.querySelector(".nav-links");

toggleBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

const animateElements = document.querySelectorAll(".animate");
const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight)
  );
};
const handleScrollAnimation = () => {
  animateElements.forEach((el) => {
    if (isInViewport(el)) {
      el.classList.add("show");
    }
  });
};
window.addEventListener("scroll", handleScrollAnimation);
handleScrollAnimation();

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      if (entry.target.classList.contains("feature-card")) {
        entry.target.style.transitionDelay = `${Math.random() * 0.3}s`;
      }
    }
  });
}, observerOptions);

document
  .querySelectorAll(".animate, .feature-card, .stat-card")
  .forEach((el) => {
    observer.observe(el);
  });

const heroImage = document.querySelector(".hero-image img");
const heroContent = document.querySelector(".hero-content");

window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  if (heroImage && scrolled < window.innerHeight) {
    heroImage.style.transform = `translateY(${scrolled * 0.4}px)`;
    heroContent.style.transform = `translateY(${scrolled * 0.2}px)`;
  }
});

const navbar = document.querySelector(".navbar");
let lastScroll = 0;
let isScrolling = false;

const handleNavbarVisibility = () => {
  const currentScroll = window.pageYOffset;
  const scrollDelta = Math.abs(currentScroll - lastScroll);

  if (scrollDelta < 10) return;

  if (currentScroll <= 50) {
    navbar.style.transform = "translateY(0)";
    navbar.style.background = "rgba(15, 15, 15, 0.6)";
    navbar.style.margin = "20px";
  } else if (currentScroll > lastScroll) {
    navbar.style.transform = "translateY(-100%)";
  } else {
    navbar.style.transform = "translateY(0)";
    navbar.style.background = "rgba(15, 15, 15, 0.9)";
    navbar.style.margin = "10px";
  }

  lastScroll = currentScroll;
};

window.addEventListener("scroll", () => {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      handleNavbarVisibility();
      isScrolling = false;
    });
    isScrolling = true;
  }
});

const navLinkItems = document.querySelectorAll(".nav-links a");

navLinkItems.forEach((link) => {
  link.addEventListener("mouseenter", (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    e.target.style.setProperty("--mouse-x", x);
    e.target.style.setProperty("--mouse-y", y);
  });
});

function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.textContent = value.toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const value = parseInt(el.textContent.replace(/,/g, ""));
        animateValue(el, 0, value, 2000);
        statsObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll(".stat-card h3").forEach((el) => {
  statsObserver.observe(el);
});

const cursor = document.createElement("div");
cursor.className = "cursor-glow";
document.body.appendChild(cursor);

document.addEventListener("mousemove", (e) => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});

const style = document.createElement("style");
style.textContent = `
  .cursor-glow {
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(245, 255, 130, 0.15), transparent 70%);
    position: fixed;
    pointer-events: none;
    transform: translate(-50%, -50%);
    z-index: 9999;
    transition: 0.1s ease-out;
    mix-blend-mode: screen;
  }
`;
document.head.appendChild(style);

const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
const navLinksContainer = document.querySelector(".nav-links");

function toggleMenu() {
  mobileMenuBtn.classList.toggle("active");
  navLinksContainer.classList.toggle("active");
  document.body.style.overflow = navLinksContainer.classList.contains("active")
    ? "hidden"
    : "";
}

mobileMenuBtn.addEventListener("click", toggleMenu);

document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".navbar") &&
    navLinksContainer.classList.contains("active")
  ) {
    toggleMenu();
  }
});

navLinksContainer.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (navLinksContainer.classList.contains("active")) {
      toggleMenu();
    }
  });
});

let touchStartY = 0;
let touchEndY = 0;

document.addEventListener(
  "touchstart",
  (e) => {
    touchStartY = e.touches[0].clientY;
  },
  false
);

document.addEventListener(
  "touchmove",
  (e) => {
    if (navLinksContainer.classList.contains("active")) {
      e.preventDefault();
    }
  },
  { passive: false }
);

document.addEventListener(
  "touchend",
  (e) => {
    touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY;

    if (navLinksContainer.classList.contains("active") && deltaY > 50) {
      toggleMenu();
    }
  },
  false
);

const isMobile = window.matchMedia("(max-width: 768px)").matches;
if (!isMobile) {
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    if (heroImage && scrolled < window.innerHeight) {
      heroImage.style.transform = `translateY(${scrolled * 0.4}px)`;
      heroContent.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
  });
}
