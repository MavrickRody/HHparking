import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

import {ParkingSpot} from '../types';
import {LocationService} from '../services/LocationService';
import {FirebaseService} from '../services/FirebaseService';

const HAMBURG_REGION = {
  latitude: 53.5511,
  longitude: 9.9937,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);

  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);

  const locationService = LocationService.getInstance();
  const firebaseService = FirebaseService.getInstance();

  useEffect(() => {
    initializeLocation();
    return () => {
      locationService.stopLocationTracking();
    };
  }, []);

  const initializeLocation = async () => {
    try {
      const permission = await locationService.requestLocationPermission();
      if (!permission.granted) {
        Alert.alert(
          t('common.error'),
          'Location permission is required for parking detection',
        );
        return;
      }

      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        await loadNearbyParkingSpots(location.latitude, location.longitude);
        
        // Center map on current location
        mapRef.current?.animateToRegion({
          ...location,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error('Location initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyParkingSpots = async (latitude: number, longitude: number) => {
    try {
      const spots = await firebaseService.getNearbyParkingSpots(latitude, longitude);
      setParkingSpots(spots);
    } catch (error) {
      console.error('Error loading parking spots:', error);
    }
  };

  const startLocationTracking = () => {
    if (!currentLocation) return;

    setIsTracking(true);
    locationService.startLocationTracking(
      // Location update callback
      (location) => {
        setCurrentLocation(location);
        loadNearbyParkingSpots(location.latitude, location.longitude);
      },
      // Parking detected callback
      async (location) => {
        Alert.alert(
          t('map.parkingAvailable'),
          'Did you just park? Would you like to report this parking spot?',
          [
            {text: t('common.cancel'), style: 'cancel'},
            {
              text: t('common.confirm'),
              onPress: () => reportParkingSpot(location, false), // false = leaving spot
            },
          ],
        );
      },
      // Leaving detected callback
      async (location) => {
        Alert.alert(
          t('map.parkingAvailable'),
          'You seem to be leaving a parking spot. Should we mark it as available?',
          [
            {text: t('common.cancel'), style: 'cancel'},
            {
              text: t('common.confirm'),
              onPress: () => reportParkingSpot(location, true), // true = spot available
            },
          ],
        );
      },
    );
  };

  const stopLocationTracking = () => {
    setIsTracking(false);
    locationService.stopLocationTracking();
  };

  const reportParkingSpot = async (
    location: {latitude: number; longitude: number},
    isAvailable: boolean,
  ) => {
    try {
      const address = await locationService.reverseGeocode(
        location.latitude,
        location.longitude,
      );

      // Simple heuristic to determine if it's paid parking
      // In a real app, this would use city parking data or APIs
      const isPaid = await determinePaidParking(location);

      const parkingSpot: Omit<ParkingSpot, 'id'> = {
        latitude: location.latitude,
        longitude: location.longitude,
        address,
        isPaid,
        isAvailable,
        reportedBy: 'current-user-id', // This would come from auth context
        reportedAt: new Date(),
        estimatedDuration: isAvailable ? 60 : undefined, // 1 hour estimate
      };

      await firebaseService.createParkingSpot(parkingSpot);

      // Send notification to nearby users
      await firebaseService.sendParkingNotification({
        parkingSpotId: 'new-spot-id',
        type: isAvailable ? 'parking_available' : 'parking_taken',
        latitude: location.latitude,
        longitude: location.longitude,
        address,
        isPaid,
        userId: 'current-user-id',
      });

      // Refresh parking spots
      await loadNearbyParkingSpots(location.latitude, location.longitude);

      Alert.alert(
        t('common.confirm'),
        `Parking spot has been reported as ${isAvailable ? 'available' : 'taken'}`,
      );
    } catch (error) {
      console.error('Error reporting parking spot:', error);
      Alert.alert(t('common.error'), 'Failed to report parking spot');
    }
  };

  const determinePaidParking = async (location: {latitude: number; longitude: number}): Promise<boolean> => {
    // This is a simplified implementation
    // In a real app, you would check against Hamburg's parking zone data
    // For now, we'll use a simple distance-from-city-center heuristic
    const cityCenter = {latitude: 53.5511, longitude: 9.9937};
    const distance = locationService.calculateDistance ? 
      locationService.calculateDistance(cityCenter, location) : 0;
    
    return distance < 3000; // Within 3km of city center = paid parking
  };

  const centerOnCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const onMarkerPress = (spot: ParkingSpot) => {
    navigation.navigate('ParkingDetails', {parkingSpot: spot});
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={HAMBURG_REGION}
        showsUserLocation={true}
        showsMyLocationButton={false}>
        
        {/* Current location marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title={t('map.currentLocation')}
            pinColor="blue"
          />
        )}

        {/* Parking spot markers */}
        {parkingSpots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            title={spot.isPaid ? t('map.paidParking') : t('map.freeParking')}
            description={spot.address}
            pinColor={spot.isPaid ? 'red' : 'green'}
            onPress={() => onMarkerPress(spot)}
          />
        ))}
      </MapView>

      {/* Control buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnCurrentLocation}>
          <Icon name="my-location" size={24} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.trackingButton,
            isTracking && styles.activeTrackingButton,
          ]}
          onPress={isTracking ? stopLocationTracking : startLocationTracking}>
          <Icon
            name={isTracking ? 'stop' : 'play-arrow'}
            size={24}
            color={isTracking ? '#fff' : '#007AFF'}
          />
          <Text
            style={[
              styles.trackingText,
              isTracking && styles.activeTrackingText,
            ]}>
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floating action button for manual reporting */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (currentLocation) {
            Alert.alert(
              t('map.reportSpot'),
              'Is there a parking spot available at your current location?',
              [
                {text: t('common.cancel'), style: 'cancel'},
                {
                  text: t('map.parkingAvailable'),
                  onPress: () => reportParkingSpot(currentLocation, true),
                },
                {
                  text: t('map.parkingTaken'),
                  onPress: () => reportParkingSpot(currentLocation, false),
                },
              ],
            );
          }
        }}>
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 50,
    right: 15,
    flexDirection: 'column',
  },
  controlButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  trackingButton: {
    width: 120,
    height: 60,
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  activeTrackingButton: {
    backgroundColor: '#007AFF',
  },
  trackingText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
  },
  activeTrackingText: {
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});