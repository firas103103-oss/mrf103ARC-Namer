import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.arc.operator',
  appName: 'ARC',
  webDir: 'dist/public',
  server: {
    url: 'https://mrf103arc-namer-production-236c.up.railway.app',
    cleartext: false
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
