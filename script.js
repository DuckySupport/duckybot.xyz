// Select elements
const toggleBtn = document.querySelector(".toggle-btn");
const navLinks = document.querySelector(".nav-links");

toggleBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Select all elements with the 'animate' class
const animateElements = document.querySelectorAll(".animate");

// Function to check if an element is in the viewport
const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight)
  );
};

// Function to add the 'show' class when an element enters the viewport
const handleScrollAnimation = () => {
  animateElements.forEach((el) => {
    if (isInViewport(el)) {
      el.classList.add("show");
    }
  });
};

// Listen to scroll events
window.addEventListener("scroll", handleScrollAnimation);

// Trigger animation on page load
handleScrollAnimation();
