document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    let lenis = null;

    /* ── Lenis smooth scroll + ScrollTrigger proxy ── */
    if (!prefersReducedMotion && !isMobile && typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);

            ScrollTrigger.scrollerProxy(document.documentElement, {
                scrollTop(value) {
                    if (arguments.length) {
                        lenis.scrollTo(value, { immediate: true });
                    }
                    return lenis.scroll;
                },
                getBoundingClientRect() {
                    return {
                        top: 0,
                        left: 0,
                        width: window.innerWidth,
                        height: window.innerHeight,
                    };
                },
            });

            ScrollTrigger.addEventListener('refresh', () => lenis.resize());
        }

        if (typeof gsap !== 'undefined') {
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        }

        document.documentElement.classList.add('lenis');
    }

    /* ── Hero entrance ── */
    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
        gsap.from('.hero-animate', {
            opacity: 0,
            y: 28,
            duration: 0.75,
            stagger: 0.1,
            ease: 'power2.out',
            delay: 0.15,
        });
    }

    /* ── Story ↔ sticky card sync ── */
    const scrollItems = document.querySelectorAll('.scroll-item');
    const panels = document.querySelectorAll('.card-panel');
    const cardLabel = document.getElementById('card-label');
    let activePanelId = null;

    function activatePanel(panelId, label) {
        if (!panelId || activePanelId === panelId) return;
        activePanelId = panelId;

        scrollItems.forEach((item) => {
            item.classList.toggle('active', item.dataset.panel === panelId);
        });

        panels.forEach((panel) => {
            panel.classList.toggle('visible', panel.id === panelId);
        });

        if (cardLabel && label) {
            cardLabel.textContent = label;
        }
    }

    function syncStoryPanel() {
        if (!scrollItems.length || isMobile) return;

        const focusLine = window.innerHeight * 0.42;
        let best = null;
        let bestDist = Infinity;

        scrollItems.forEach((item) => {
            const rect = item.getBoundingClientRect();

            // Skip items far outside the viewport
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;

            const anchor = rect.top + rect.height * 0.35;
            const dist = Math.abs(anchor - focusLine);

            if (dist < bestDist) {
                bestDist = dist;
                best = item;
            }
        });

        if (best) {
            activatePanel(best.dataset.panel, best.dataset.label);
        }
    }

    if (scrollItems.length && panels.length) {
        if (!isMobile) {
            syncStoryPanel();

            if (lenis) {
                lenis.on('scroll', syncStoryPanel);
            } else {
                window.addEventListener('scroll', syncStoryPanel, { passive: true });
            }

            window.addEventListener('resize', () => {
                syncStoryPanel();
                if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            });
        } else {
            scrollItems.forEach((item, index) => {
                if (index === 0) item.classList.add('active');
            });
            panels.forEach((panel, index) => {
                if (index === 0) panel.classList.add('visible');
            });
        }
    }

    /* ── Section reveal on scroll ── */
    if (!prefersReducedMotion) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
        );

        document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
    } else {
        document.querySelectorAll('.reveal-on-scroll').forEach((el) => el.classList.add('is-visible'));
    }

    /* ── Active nav link on scroll ── */
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = [...navLinks]
        .map((link) => {
            const id = link.getAttribute('href')?.slice(1);
            const el = id ? document.getElementById(id) : null;
            return el ? { link, el } : null;
        })
        .filter(Boolean);

    if (sections.length && typeof ScrollTrigger !== 'undefined') {
        sections.forEach(({ link, el }) => {
            ScrollTrigger.create({
                trigger: el,
                start: 'top 40%',
                end: 'bottom 40%',
                onToggle: (self) => {
                    if (self.isActive) {
                        navLinks.forEach((l) => l.classList.remove('active'));
                        link.classList.add('active');
                    }
                },
            });
        });

        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }
});
