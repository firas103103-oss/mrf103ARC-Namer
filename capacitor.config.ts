import type { CapacitorConfig } from '@capacitor/cli';

// Environment-aware configuration
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Get API URL from environment or use default
const getServerUrl = (): string | undefined => {
  if (isProduction) {
    return process.env.VITE_API_URL || 'https://mrf103arc-namer-production-236c.up.railway.app';
  }
  // In development, let Capacitor use the bundled web app
  return undefined;
};

const config: CapacitorConfig = {
  appId: 'app.arc.operator',
  appName: isProduction ? 'ARC Operator' : 'ARC Operator (Dev)',
  webDir: 'dist/public',
  
  // Server configuration (production only)
  ...(isProduction && {
    server: {
      url: getServerUrl(),
      cleartext: false,  // Force HTTPS only
      androidScheme: 'https',
    },
  }),
  
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0A0E27",
      showSpinner: true,
      spinnerColor: "#00D4FF",
    },
  },
  
  android: {
    allowMixedContent: false,  // Security: only HTTPS
    captureInput: true,
    webContentsDebuggingEnabled: isDevelopment,  // Debug only in dev
  },
};

// Log configuration
console.log('📱 Capacitor Configuration:', {
  environment: process.env.NODE_ENV,
  serverUrl: getServerUrl() || 'local',
  appName: config.appName,
});

export default config;
