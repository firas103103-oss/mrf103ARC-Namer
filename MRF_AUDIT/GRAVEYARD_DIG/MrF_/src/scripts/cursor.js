// ============================================
// QUANTUM CURSOR SYSTEM
// ============================================
export function initCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorDot = document.querySelector('.cursor-dot');

    if (!cursor || !cursorDot) return;

    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { duration: 0.3, left: e.clientX, top: e.clientY });
        gsap.to(cursorDot, { duration: 0.1, left: e.clientX, top: e.clientY });
    });

    // Cursor interaction effects
    document.querySelectorAll('a, button, .product-card').forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            gsap.to(cursor, { duration: 0.3, scale: 1.8, borderColor: '#0ea5e9' });
        });
        elem.addEventListener('mouseleave', () => {
            gsap.to(cursor, { duration: 0.3, scale: 1, borderColor: '#D4AF37' });
        });
    });
}
