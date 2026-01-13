// ============================================
// INITIALIZE PROTOCOL - LOADING SYSTEM
// ============================================

export function initializeProtocol() {
    return new Promise((resolve) => {
        const loadingScreen = document.getElementById('loadingScreen');
        
        if (!loadingScreen) {
            resolve();
            return;
        }

        // Simulate initialization phases
        const phases = [
            'Initializing Protocol',
            'Loading Neural Network',
            'Establishing Connection',
            'System Ready'
        ];

        let currentPhase = 0;
        const loadingText = loadingScreen.querySelector('.loading-text');

        const phaseInterval = setInterval(() => {
            if (currentPhase < phases.length - 1) {
                currentPhase++;
                if (loadingText) {
                    loadingText.textContent = phases[currentPhase];
                }
            }
        }, 500);

        // Hide loading screen with cinematic effect after 2 seconds
        setTimeout(() => {
            clearInterval(phaseInterval);
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                resolve();
            }, 800);
        }, 2000);
    });
}

// Console signature
export function displayConsoleSignature() {
    console.log('%cMr.F 103', 'color: #D4AF37; font-size: 32px; font-weight: 900; font-family: Orbitron;');
    console.log('%cSovereign Intelligence Protocol', 'color: #0ea5e9; font-size: 16px; font-family: monospace;');
    console.log('%cEngineering the Invisible © 2026', 'color: #666; font-size: 12px;');
}
