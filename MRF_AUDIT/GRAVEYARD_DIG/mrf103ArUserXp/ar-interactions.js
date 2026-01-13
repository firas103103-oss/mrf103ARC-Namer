// Register custom gesture component before A-Frame initializes
AFRAME.registerComponent('gesture-handler', {
    init: function() {
        const el = this.el;
        let startY = 0;
        let currentY = 0;
        let isActive = false;
        
        el.addEventListener('mousedown', (e) => {
            isActive = true;
            startY = e.clientY;
        });
        
        el.addEventListener('mousemove', (e) => {
            if (!isActive) return;
            
            currentY = e.clientY;
            const deltaY = (startY - currentY) * 0.01;
            const currentScale = el.getAttribute('scale');
            const newScale = Math.max(0.1, Math.min(2.0, currentScale.x + deltaY));
            el.setAttribute('scale', `${newScale} ${newScale} ${newScale}`);
        });
        
        el.addEventListener('mouseup', () => {
            isActive = false;
        });
        
        // Touch events for mobile
        el.addEventListener('touchstart', (e) => {
            isActive = true;
            startY = e.touches[0].clientY;
            e.preventDefault();
        });
        
        el.addEventListener('touchmove', (e) => {
            if (!isActive) return;
            
            currentY = e.touches[0].clientY;
            const deltaY = (startY - currentY) * 0.01;
            const currentScale = el.getAttribute('scale');
            const newScale = Math.max(0.1, Math.min(2.0, currentScale.x + deltaY));
            el.setAttribute('scale', `${newScale} ${newScale} ${newScale}`);
            e.preventDefault();
        });
        
        el.addEventListener('touchend', () => {
            isActive = false;
        });
    }
});

// AR Reality Engagement - Interactive Features
class ARExperience {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.objects = [];
        this.colors = ['#FF6B6B', '#4ECDC4', '#95E1D3', '#FFE66D', '#FF8B94', '#A8E6CF'];
        this.currentColorIndex = 0;
        this.objectCount = 3;
        this.isARReady = false;
        
        this.init();
    }
    
    init() {
        // Wait for A-Frame to load
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.initializeAR();
        });
    }
    
    initializeAR() {
        const scene = document.querySelector('#ar-scene');
        const loadingScreen = document.querySelector('#loading-screen');
        const arStatus = document.querySelector('#ar-status');
        
        // Wait for AR.js to initialize
        scene.addEventListener('arjs-video-loaded', () => {
            console.log('AR camera loaded successfully');
            this.onARReady();
        });
        
        scene.addEventListener('camera-error', (error) => {
            console.error('Camera error:', error);
            this.handleCameraError();
        });
        
        // Simulate loading time and hide loading screen
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            arStatus.textContent = 'AR Active';
            arStatus.className = 'active';
            this.isARReady = true;
        }, 3000);
        
        this.scene = scene;
        this.camera = document.querySelector('#ar-camera');
    }
    
    onARReady() {
        console.log('AR Experience ready');
        this.updateObjectReferences();
        this.attachObjectListeners(); // Add click listeners after objects are referenced
        this.startAmbientAnimations();
        this.showGestureHints();
    }
    
    updateObjectReferences() {
        this.objects = [
            document.querySelector('#floating-sphere'),
            document.querySelector('#floating-cube'),
            document.querySelector('#floating-cylinder')
        ];
    }
    
    attachObjectListeners() {
        // Attach click/touch interactions to objects
        this.objects.forEach((obj, index) => {
            if (obj) {
                obj.addEventListener('click', () => {
                    this.onObjectInteraction(obj, index);
                });
            }
        });
    }
    
    setupEventListeners() {
        // Control panel buttons
        document.getElementById('toggle-objects').addEventListener('click', () => {
            this.toggleObjects();
        });
        
        document.getElementById('change-colors').addEventListener('click', () => {
            this.changeColors();
        });
        
        document.getElementById('add-object').addEventListener('click', () => {
            this.addRandomObject();
        });
        
    }
    
    toggleObjects() {
        const markerlessContent = document.querySelector('#markerless-content');
        const isVisible = markerlessContent.getAttribute('visible') === 'true';
        
        markerlessContent.setAttribute('visible', !isVisible);
        
        // Update UI feedback
        const button = document.querySelector('#toggle-objects span');
        button.textContent = isVisible ? 'Show Effects' : 'Hide Effects';
        
        // Add visual feedback
        this.showFeedback(isVisible ? 'Digital enhancements hidden' : 'Digital enhancements visible');
    }
    
    changeColors() {
        this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
        const newColor = this.colors[this.currentColorIndex];
        
        this.objects.forEach((obj, index) => {
            if (obj) {
                // Animate color change
                obj.setAttribute('animation__color', `property: material.color; to: ${newColor}; dur: 1000`);
                
                // Add temporary glow effect
                setTimeout(() => {
                    obj.setAttribute('material', `color: ${newColor}; emissive: ${newColor}; emissiveIntensity: 0.2`);
                    setTimeout(() => {
                        obj.setAttribute('material', `color: ${newColor}; emissive: #000000; emissiveIntensity: 0`);
                    }, 500);
                }, 500);
            }
        });
        
        this.showFeedback(`Color theme changed`);
    }
    
    addRandomObject() {
        const shapes = ['sphere', 'box', 'cylinder', 'cone', 'torus'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        // Random position around the user
        const x = (Math.random() - 0.5) * 4;
        const y = Math.random() * 2 + 0.5;
        const z = -Math.random() * 2 - 1.5;
        
        const newObject = document.createElement(`a-${shape}`);
        newObject.setAttribute('position', `${x} ${y} ${z}`);
        newObject.setAttribute('color', color);
        newObject.setAttribute('class', 'interactive-object ar-element');
        newObject.setAttribute('gesture-handler', '');
        
        // Shape-specific attributes
        switch(shape) {
            case 'sphere':
                newObject.setAttribute('radius', '0.2');
                break;
            case 'box':
                newObject.setAttribute('width', '0.3');
                newObject.setAttribute('height', '0.3');
                newObject.setAttribute('depth', '0.3');
                break;
            case 'cylinder':
                newObject.setAttribute('radius', '0.15');
                newObject.setAttribute('height', '0.4');
                break;
            case 'cone':
                newObject.setAttribute('radius-bottom', '0.2');
                newObject.setAttribute('radius-top', '0.05');
                newObject.setAttribute('height', '0.4');
                break;
            case 'torus':
                newObject.setAttribute('radius', '0.2');
                newObject.setAttribute('radius-tubular', '0.05');
                break;
        }
        
        // Add animations
        newObject.setAttribute('animation', 'property: rotation; to: 360 360 360; loop: true; dur: 8000');
        newObject.setAttribute('animation__float', `property: position; to: ${x} ${y + 0.3} ${z}; dir: alternate; loop: true; dur: 4000`);
        
        // Add click interaction
        newObject.addEventListener('click', () => {
            this.onObjectInteraction(newObject, this.objects.length);
        });
        
        // Add to scene
        const markerlessContent = document.querySelector('#markerless-content');
        markerlessContent.appendChild(newObject);
        
        // Update object tracking
        this.objects.push(newObject);
        this.objectCount++;
        document.querySelector('#object-count').textContent = this.objectCount;
        
        this.showFeedback(`New ${shape} added to reality`);
    }
    
    onObjectInteraction(object, index) {
        // Create ripple effect
        this.createRippleEffect(object);
        
        // Scale animation on click
        const currentScale = object.getAttribute('scale') || {x: 1, y: 1, z: 1};
        object.setAttribute('animation__click', 'property: scale; to: 1.3 1.3 1.3; dur: 200');
        
        setTimeout(() => {
            object.setAttribute('animation__click', `property: scale; to: ${currentScale.x} ${currentScale.y} ${currentScale.z}; dur: 200`);
        }, 200);
        
        // Add temporary highlight
        object.classList.add('active-object');
        setTimeout(() => {
            object.classList.remove('active-object');
        }, 2000);
        
        this.showFeedback(`Digital object activated`);
    }
    
    createRippleEffect(object) {
        const position = object.getAttribute('position');
        const ripple = document.createElement('a-ring');
        
        ripple.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
        ripple.setAttribute('radius-inner', '0.1');
        ripple.setAttribute('radius-outer', '0.2');
        ripple.setAttribute('color', '#FFFFFF');
        ripple.setAttribute('opacity', '0.8');
        ripple.setAttribute('animation', 'property: scale; to: 3 3 3; dur: 1000');
        ripple.setAttribute('animation__fade', 'property: opacity; to: 0; dur: 1000');
        
        const markerlessContent = document.querySelector('#markerless-content');
        markerlessContent.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            markerlessContent.removeChild(ripple);
        }, 1000);
    }
    
    startAmbientAnimations() {
        // Add dynamic lighting changes
        const light = document.querySelector('a-light[type="directional"]');
        if (light) {
            setInterval(() => {
                const intensity = 0.4 + Math.sin(Date.now() * 0.001) * 0.2;
                light.setAttribute('intensity', intensity);
            }, 100);
        }
        
        // Add particle movement
        const particles = document.querySelectorAll('#particle-system a-sphere');
        particles.forEach((particle, index) => {
            setInterval(() => {
                const x = Math.sin(Date.now() * 0.002 + index) * 0.5;
                const y = Math.cos(Date.now() * 0.0015 + index) * 0.3;
                const position = particle.getAttribute('position');
                particle.setAttribute('position', `${x} ${position.y + y} ${position.z}`);
            }, 50);
        });
    }
    
    showGestureHints() {
        const hint = document.createElement('div');
        hint.className = 'gesture-hint';
        hint.innerHTML = 'Touch objects to interact • Drag to scale';
        
        document.querySelector('#ar-container').appendChild(hint);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hint.style.opacity = '0';
            setTimeout(() => {
                hint.remove();
            }, 500);
        }, 5000);
    }
    
    showFeedback(message) {
        // Update status display
        const status = document.querySelector('#ar-status');
        const originalText = status.textContent;
        
        status.textContent = message;
        status.style.color = '#FFE66D';
        
        setTimeout(() => {
            status.textContent = originalText;
            status.style.color = '#95E1D3';
        }, 2000);
    }
    
    handleCameraError() {
        const modal = document.createElement('div');
        modal.className = 'camera-modal';
        modal.innerHTML = `
            <div class="camera-modal-content">
                <h3>Camera Access Required</h3>
                <p>This AR experience needs camera access to overlay digital enhancements on reality. Please allow camera permissions and refresh the page.</p>
                <button onclick="window.location.reload()">Retry</button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

// Device orientation handling
function handleDeviceOrientation() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response == 'granted') {
                    console.log('Device orientation permission granted');
                }
            })
            .catch(console.error);
    }
}

// Performance monitoring
function monitorPerformance() {
    let lastTime = performance.now();
    let frameCount = 0;
    
    function checkFPS() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
            const fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
            console.log(`AR Performance: ${fps} FPS`);
            
            // Adjust quality based on performance
            if (fps < 20) {
                console.warn('Low FPS detected, consider reducing object complexity');
            }
            
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(checkFPS);
    }
    
    requestAnimationFrame(checkFPS);
}

// Initialize the AR experience
const arExperience = new ARExperience();

// Handle permissions and device features
document.addEventListener('DOMContentLoaded', () => {
    handleDeviceOrientation();
    monitorPerformance();
    
    // Add fullscreen capability
    const scene = document.querySelector('#ar-scene');
    if (scene.requestFullscreen) {
        document.addEventListener('dblclick', () => {
            if (!document.fullscreenElement) {
                scene.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
    }
});

// Export for potential external use
window.ARExperience = ARExperience;