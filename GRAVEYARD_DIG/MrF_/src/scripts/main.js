// ============================================
// MAIN ENTRY POINT - MR.F 103
// ============================================
import { initializeProtocol, displayConsoleSignature } from './loader.js';
import { initAnimations, initHoverEffects, optimizePerformance } from './animations.js';
import { getConfig } from './config.js';

// For cursor - we'll use inline for now since GSAP is loaded from CDN
// import { initCursor } from './cursor.js';
// For Three.js - we'll use inline for now since Three.js is loaded from CDN
// import { initThreeJS } from './three-background.js';

// Display console signature
displayConsoleSignature();

// Initialize cursor system (inline implementation)
function initCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorDot = document.querySelector('.cursor-dot');

    if (!cursor || !cursorDot || !window.gsap) return;

    document.addEventListener('mousemove', (e) => {
        window.gsap.to(cursor, { duration: 0.3, left: e.clientX, top: e.clientY });
        window.gsap.to(cursorDot, { duration: 0.1, left: e.clientX, top: e.clientY });
    });

    document.querySelectorAll('a, button, .product-card').forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            window.gsap.to(cursor, { duration: 0.3, scale: 1.8, borderColor: '#0ea5e9' });
        });
        elem.addEventListener('mouseleave', () => {
            window.gsap.to(cursor, { duration: 0.3, scale: 1, borderColor: '#D4AF37' });
        });
    });
}

// Initialize Three.js background (inline implementation)
function initThreeJS() {
    if (!window.THREE) return;
    
    try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        const container = document.getElementById('threejs-background');
        if (container) {
            container.appendChild(renderer.domElement);
        }

        const particleCount = 600;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 120;
            positions[i + 1] = (Math.random() - 0.5) * 120;
            positions[i + 2] = (Math.random() - 0.5) * 120;

            const isGold = Math.random() > 0.5;
            colors[i] = isGold ? 0.83 : 0.05;
            colors[i + 1] = isGold ? 0.69 : 0.65;
            colors[i + 2] = isGold ? 0.22 : 0.91;
            
            sizes[i / 3] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true
        });

        const particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        function animate() {
            requestAnimationFrame(animate);
            
            if (particleSystem) {
                particleSystem.rotation.x += 0.0003;
                particleSystem.rotation.y += 0.0005;
                
                targetX = mouseX * 0.2;
                targetY = mouseY * 0.2;
                
                particleSystem.rotation.x += (targetY - particleSystem.rotation.x) * 0.05;
                particleSystem.rotation.y += (targetX - particleSystem.rotation.y) * 0.05;
            }

            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();
    } catch (error) {
        console.log('3D Background initialization skipped:', error);
    }
}

// Wait for DOM and libraries to be loaded
window.addEventListener('load', async () => {
    // Get configuration
    const config = getConfig();
    console.log('Environment:', config.environment);

    // Initialize protocol (loading screen)
    await initializeProtocol();

    // Initialize all systems
    try {
        initCursor();
        initThreeJS();
        initAnimations();
        initHoverEffects();
        optimizePerformance();
    } catch (error) {
        console.error('Initialization error:', error);
    }

    // Update dynamic content with config values
    updateDynamicContent(config);
});

// Update dynamic content based on configuration
function updateDynamicContent(config) {
    // Update phone numbers
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.href = `tel:${config.phone}`;
    });

    // Update emails
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.href = `mailto:${config.email}`;
    });

    // Update app links
    document.querySelectorAll('a[href*="app.mrf103"]').forEach(link => {
        link.href = config.appUrl;
    });

    // Update author links
    document.querySelectorAll('a[href*="author.mrf103"]').forEach(link => {
        link.href = config.authorUrl;
    });
}
