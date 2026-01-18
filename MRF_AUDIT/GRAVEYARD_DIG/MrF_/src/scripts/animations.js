// ============================================
// GSAP CINEMATIC SCROLL ANIMATIONS
// ============================================

export function initAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;
    
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    
    gsap.registerPlugin(ScrollTrigger);

    // Hero parallax effect
    gsap.to('.hero-section', {
        opacity: 0.2,
        y: 300,
        scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5
        }
    });

    // Animate product cards on scroll
    gsap.utils.toArray('.product-card').forEach((card, index) => {
        gsap.from(card, {
            opacity: 0,
            y: 100,
            rotationX: -15,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'top 50%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Section title reveal
    gsap.from('.section-title', {
        opacity: 0,
        scale: 0.8,
        y: 50,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.section-title',
            start: 'top 80%'
        }
    });

    // Footer fade in
    gsap.from('.footer-section', {
        opacity: 0,
        y: 80,
        duration: 1,
        scrollTrigger: {
            trigger: '.footer-section',
            start: 'top 90%'
        }
    });
}

// ============================================
// ADVANCED HOVER MICRO-INTERACTIONS
// ============================================
export function initHoverEffects() {
    if (!window.gsap) return;
    
    const gsap = window.gsap;

    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                scale: 1.03,
                duration: 0.4,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                scale: 1,
                duration: 0.4,
                ease: 'power2.out'
            });
        });
    });

    // Button pulse effect
    const heroBtn = document.querySelector('.hero-cta');
    if (heroBtn) {
        gsap.to(heroBtn, {
            boxShadow: '0 25px 90px rgba(212, 175, 55, 0.9), 0 10px 50px rgba(14, 165, 233, 0.8)',
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
}

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================
export function optimizePerformance() {
    if (!window.gsap) return;
    
    const gsap = window.gsap;
    
    // Reduce animations on low-end devices
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.globalTimeline.timeScale(0);
    }
}
