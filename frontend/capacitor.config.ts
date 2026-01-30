import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tidata.store',
  appName: 'Tidata Store',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3500, // Garante que a Splash apareça por 3.5s
      launchAutoHide: true,
      androidScaleType: "CENTER_CROP",
      useDialog:true,
    },
  },
};

export default config;