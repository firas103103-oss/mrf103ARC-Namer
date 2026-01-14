// ============================================
// CONFIGURATION SYSTEM
// ============================================

const env = import.meta.env;

const config = {
    // Environment
    environment: env.MODE || 'development',
    isDevelopment: env.MODE === 'development',
    isProduction: env.MODE === 'production',

    // URLs
    appUrl: env.VITE_APP_URL || 'https://app.mrf103.com',
    authorUrl: env.VITE_AUTHOR_URL || 'https://author.mrf103.com',
    apiUrl: env.VITE_API_URL || 'http://localhost:3000',

    // Contact
    phone: env.VITE_CONTACT_PHONE || '+966591652030',
    email: env.VITE_CONTACT_EMAIL || 'mr.f@mrf103.com',

    // Features
    enableThreeJS: env.VITE_ENABLE_THREEJS !== 'false',
    enableAnimations: env.VITE_ENABLE_ANIMATIONS !== 'false',
};

export function getConfig() {
    return config;
}

export default config;
