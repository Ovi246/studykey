import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useColorScheme } from '@/hooks/useColorScheme';
import RemoteLogger from '@/utils/RemoteLogger';

import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

// Add global error handler for production debugging
if (__DEV__ === false) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError('[PRODUCTION ERROR]:', ...args);
    // Log to device storage for APK debugging
    RemoteLogger.error('Production console error', args.join(' '));
  };
  
  // Catch unhandled promise rejections
  if (typeof global !== 'undefined' && global.addEventListener) {
    global.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      RemoteLogger.error('Unhandled promise rejection', event.reason);
    });
  }
  
  // Catch JavaScript errors
  if (typeof global !== 'undefined' && global.ErrorUtils) {
    const originalHandler = global.ErrorUtils.getGlobalHandler();
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      RemoteLogger.error('Global JavaScript error', {
        message: error.message,
        stack: error.stack,
        isFatal
      });
      originalHandler(error, isFatal);
    });
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    'ComicSansMSBold': require('../assets/fonts/ComicSansMSBold.ttf'),
    'Comic Sans MS Bold': require('../assets/fonts/ComicSansMSBold.ttf'),
    'ComicSansBold': require('../assets/fonts/ComicSansMSBold.ttf'),
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    console.log('🚀 App starting up...');
    
    // Log startup info for APK debugging
    RemoteLogger.log('🚀 App Layout initialization', {
      isDev: __DEV__,
      platform: require('react-native').Platform.OS,
      version: require('react-native').Platform.Version,
      fontsLoaded: loaded,
      fontError: error
    });
    
    if (loaded) {
      console.log('✅ Fonts loaded, hiding splash screen');
      console.log('Loaded fonts:', Object.keys(require('../assets/fonts/ComicSansMSBold.ttf')));
      RemoteLogger.log('✅ Fonts loaded successfully');
      SplashScreen.hideAsync();
    }
    
    if (error) {
      console.log('❌ Font loading error:', error);
      RemoteLogger.error('Font loading error', error);
    }
  }, [loaded, error]);

  if (!loaded) {
    console.log('⏳ Waiting for fonts to load...');
    return null;
  }

  console.log('🎆 App ready to render!');

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="menu" options={{ headerShown: false }} />
            <Stack.Screen name="flashcards" options={{ headerShown: false }} />
            <Stack.Screen name="toddler-learning" options={{ headerShown: false }} />
            <Stack.Screen name="toddler-category" options={{ headerShown: false }} />
            <Stack.Screen name="daily-affirmations" options={{ headerShown: false }} />
            <Stack.Screen name="travel-adventure" options={{ headerShown: false }} />
            <Stack.Screen name="debug-logs" options={{ headerShown: false }} />
            <Stack.Screen name="font-test-verification" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}