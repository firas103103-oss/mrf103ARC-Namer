import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xbioai.arc',
  appName: 'ARC Intelligence',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    hostname: 'x-bioai.com',
    allowNavigation: ['x-bioai.com', '*.x-bioai.com', 'api.openai.com'],
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
    },
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
