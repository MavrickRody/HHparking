import React, {useState, useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import './src/i18n'; // Initialize i18n
import AppNavigator from './src/navigation/AppNavigator';
import {User} from './src/types';
import {FirebaseService} from './src/services/FirebaseService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const firebaseService = FirebaseService.getInstance();

  useEffect(() => {
    checkAuthState();
    requestNotificationPermission();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check if user is already authenticated
      // In a real app, this would check Firebase auth state
      // For demo purposes, we'll assume user needs to login
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const granted = await firebaseService.requestNotificationPermission();
      if (granted) {
        const token = await firebaseService.getFCMToken();
        console.log('FCM Token:', token);
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    // In a real app, you'd show a splash screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AppNavigator 
        isAuthenticated={isAuthenticated}
        onAuthSuccess={handleAuthSuccess}
        onSignOut={handleSignOut}
        user={user}
      />
    </SafeAreaProvider>
  );
}