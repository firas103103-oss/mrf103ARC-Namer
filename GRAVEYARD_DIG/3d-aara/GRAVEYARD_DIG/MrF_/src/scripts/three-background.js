// ============================================
// THREE.JS NEURAL NETWORK BACKGROUND
// ============================================
import * as THREE from 'three';

let scene, camera, renderer, particles, particleSystem;

export function initThreeJS() {
    try {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        const container = document.getElementById('threejs-background');
        if (container) {
            container.appendChild(renderer.domElement);
        }

        // Create advanced particle network
        const particleCount = 600;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 120;
            positions[i + 1] = (Math.random() - 0.5) * 120;
            positions[i + 2] = (Math.random() - 0.5) * 120;

            // Alternate between gold and cyan
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

        particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        // Create connection lines
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xD4AF37,
            transparent: true,
            opacity: 0.15
        });

        animate();
        setupMouseInteraction();
        setupResize();
    } catch (error) {
        console.log('3D Background initialization skipped:', error);
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    if (particleSystem) {
        particleSystem.rotation.x += 0.0003;
        particleSystem.rotation.y += 0.0005;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Mouse parallax interaction
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

function setupMouseInteraction() {
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function updateParticles() {
        if (particleSystem) {
            targetX = mouseX * 0.2;
            targetY = mouseY * 0.2;
            
            particleSystem.rotation.x += (targetY - particleSystem.rotation.x) * 0.05;
            particleSystem.rotation.y += (targetX - particleSystem.rotation.y) * 0.05;
        }
        requestAnimationFrame(updateParticles);
    }
    updateParticles();
}

function setupResize() {
    window.addEventListener('resize', () => {
        if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    });
}
