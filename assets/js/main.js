document.addEventListener('DOMContentLoaded', () => {
    // Only run animations if user prefers reduced motion is false
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optional: Unobserve after animation completes to free resources
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all elements that have the reveal-on-scroll class
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        revealElements.forEach(element => {
            observer.observe(element);
        });

        // Also add the class to sections if they don't have it (though they should be covered above if added)
        // But we want to ensure sections specifically get the class for the logic below
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.add('reveal-on-scroll');
            observer.observe(section);
        });

        // Stagger cards
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.05}s`;
            card.classList.add('reveal-on-scroll');
            observer.observe(card);
        });
    }
});
