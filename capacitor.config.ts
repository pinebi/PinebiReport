import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.modernerp.rapor',
  appName: 'ModernERP',
  webDir: '.next',  // Next.js build directory
  server: {
    androidScheme: 'http',
    // Development mode - local server (Port 3001!)
    url: 'http://10.0.2.2:3001',
    cleartext: true,
    // Production için static build:
    // androidScheme: 'https',
    // url yok = webDir kullan
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#3B82F6",
      showSpinner: false,
    },
  },
};

export default config;

