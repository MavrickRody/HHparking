import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';

import {RootStackParamList, MainTabParamList} from '../types';
import AuthScreen from '../screens/AuthScreen';
import MapScreen from '../screens/MapScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ParkingDetailsScreen from '../screens/ParkingDetailsScreen';
import FeedbackScreen from '../screens/FeedbackScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  const {t} = useTranslation();

  return (
    <MainTab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Map':
              iconName = 'map';
              break;
            case 'Notifications':
              iconName = 'notifications';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <MainTab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          tabBarLabel: t('map.title'),
        }}
      />
      <MainTab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          tabBarLabel: t('notifications.title'),
        }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile.title'),
        }}
      />
    </MainTab.Navigator>
  );
}

interface AppNavigatorProps {
  isAuthenticated: boolean;
  onAuthSuccess?: (user: any) => void;
  onSignOut?: () => void;
  user?: any;
}

export default function AppNavigator({
  isAuthenticated,
  onAuthSuccess,
  onSignOut,
  user,
}: AppNavigatorProps) {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <RootStack.Screen 
            name="Auth" 
            component={AuthScreen}
            initialParams={{onAuthSuccess}}
          />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainTabNavigator} />
            <RootStack.Screen 
              name="ParkingDetails" 
              component={ParkingDetailsScreen}
              options={{
                headerShown: true,
                title: 'Parking Details',
              }}
            />
            <RootStack.Screen 
              name="Feedback" 
              component={FeedbackScreen}
              options={{
                headerShown: true,
                title: 'Feedback',
              }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}