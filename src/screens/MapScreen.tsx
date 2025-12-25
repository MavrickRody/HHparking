import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import MapView, {Marker, UrlTile} from 'react-native-maps';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

import {ParkingSpot, ParkingAreaData, ParkingOccupancy} from '../types';
import {LocationService} from '../services/LocationService';
import {FirebaseService} from '../services/FirebaseService';
import {OccupancyService} from '../services/OccupancyService';
import {ParkingDataParser} from '../utils/parkingDataParser';
import {ParkingPolygon} from '../components/Map/ParkingPolygon';
import {ParkingButton} from '../components/ParkingButton';
import parkingData from '../../assets/hamburg-parking.json';

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
  const [parkingAreas, setParkingAreas] = useState<ParkingAreaData[]>([]);
  const [occupancyData, setOccupancyData] = useState<Map<string, ParkingOccupancy>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [isParked, setIsParked] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState<ParkingAreaData | null>(null);

  const locationService = LocationService.getInstance();
  const firebaseService = FirebaseService.getInstance();
  const occupancyService = OccupancyService.getInstance();

  useEffect(() => {
    loadParkingData();
    initializeLocation();
    return () => {
      locationService.stopLocationTracking();
    };
  }, []);

  const loadParkingData = () => {
    try {
      const areas: ParkingAreaData[] = parkingData.features.map(feature =>
        ParkingDataParser.parseParkingFeature(feature as any)
      );
      setParkingAreas(areas);
      
      // Initialize occupancy for all areas
      areas.forEach(area => occupancyService.initializeOccupancy(area));
      
      // Set parking areas in location service for geofencing
      locationService.setParkingAreas(areas);
      
      // Load initial occupancy data
      updateOccupancyData();
    } catch (error) {
      console.error('Error loading parking data:', error);
    }
  };

  const updateOccupancyData = () => {
    const allOccupancy = occupancyService.getAllOccupancy();
    const occupancyMap = new Map<string, ParkingOccupancy>();
    allOccupancy.forEach(occ => occupancyMap.set(occ.polygonId, occ));
    setOccupancyData(occupancyMap);
  };

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
        const polygon = locationService.findParkingPolygon(location);
        if (polygon) {
          Alert.alert(
            'Parking Detected',
            `Did you just park at ${polygon.streetName}?`,
            [
              {text: 'No', style: 'cancel'},
              {
                text: 'Yes',
                onPress: () => handleParkingEvent(location, polygon.id, 'parked'),
              },
            ],
          );
        }
      },
      // Leaving detected callback
      async (location) => {
        Alert.alert(
          'Leaving Parking',
          'Are you leaving the parking spot?',
          [
            {text: 'No', style: 'cancel'},
            {
              text: 'Yes',
              onPress: () => handleParkingEvent(location, null, 'departed'),
            },
          ],
        );
      },
    );
  };

  const handleParkingEvent = (
    location: {latitude: number; longitude: number},
    polygonId: string | null,
    eventType: 'parked' | 'departed'
  ) => {
    const polygon = polygonId 
      ? parkingAreas.find(a => a.id === polygonId)
      : locationService.findParkingPolygon(location);
    
    if (!polygon && eventType === 'parked') {
      Alert.alert('Error', 'You are not in a marked parking area');
      return;
    }

    if (polygon) {
      occupancyService.recordParkingEvent({
        userId: 'current-user-id', // This would come from auth
        polygonId: polygon.id,
        eventType,
        timestamp: new Date(),
        latitude: location.latitude,
        longitude: location.longitude,
      });

      setIsParked(eventType === 'parked');
      updateOccupancyData();
      
      Alert.alert(
        'Success',
        `Parking ${eventType === 'parked' ? 'recorded' : 'spot marked as available'} at ${polygon.streetName}`
      );
    }
  };

  const stopLocationTracking = () => {
    setIsTracking(false);
    locationService.stopLocationTracking();
  };

  const handleManualParkingButton = () => {
    if (!currentLocation) return;

    if (isParked) {
      // User is leaving
      handleParkingEvent(currentLocation, null, 'departed');
    } else {
      // User is parking
      const polygon = locationService.findParkingPolygon(currentLocation);
      if (polygon) {
        handleParkingEvent(currentLocation, polygon.id, 'parked');
      } else {
        Alert.alert(
          'Not in Parking Area',
          'You are not currently in a marked parking area'
        );
      }
    }
  };

  const handlePolygonPress = (area: ParkingAreaData) => {
    setSelectedPolygon(area);
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

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading parking data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={HAMBURG_REGION}
        showsUserLocation={true}
        showsMyLocationButton={false}>
        
        {/* OpenStreetMap tiles */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {/* Parking polygon overlays */}
        {parkingAreas.map(area => (
          <ParkingPolygon
            key={area.id}
            parkingArea={area}
            occupancy={occupancyData.get(area.id)}
            onPress={() => handlePolygonPress(area)}
          />
        ))}

        {/* Current location marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            pinColor="blue"
          />
        )}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Occupancy</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: 'rgba(76, 175, 80, 0.4)'}]} />
          <Text style={styles.legendText}>Available (&lt;50%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: 'rgba(255, 193, 7, 0.4)'}]} />
          <Text style={styles.legendText}>Limited (50-80%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: 'rgba(244, 67, 54, 0.4)'}]} />
          <Text style={styles.legendText}>Full (&gt;80%)</Text>
        </View>
        <Text style={styles.legendTitle}>Border</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: '#FF5722'}]} />
          <Text style={styles.legendText}>Paid parking</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: '#2196F3'}]} />
          <Text style={styles.legendText}>Free parking</Text>
        </View>
      </View>

      {/* Selected polygon info */}
      {selectedPolygon && (
        <View style={styles.polygonInfo}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedPolygon(null)}
          >
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
          <Text style={styles.polygonInfoTitle}>{selectedPolygon.streetName}</Text>
          <Text style={styles.polygonInfoText}>
            Type: {selectedPolygon.isPaid ? 'Paid Parking' : 'Free Parking'}
          </Text>
          <Text style={styles.polygonInfoText}>
            Capacity: ~{selectedPolygon.estimatedCapacity} spots
          </Text>
          {occupancyData.get(selectedPolygon.id) && (
            <>
              <Text style={styles.polygonInfoText}>
                Available: {occupancyData.get(selectedPolygon.id)!.availableSpots} spots
              </Text>
              <Text style={styles.polygonInfoText}>
                Occupied: {occupancyData.get(selectedPolygon.id)!.occupiedSpots} spots
              </Text>
            </>
          )}
        </View>
      )}

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
            {isTracking ? 'Auto Detection' : 'Start Auto'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Manual parking button */}
      <View style={styles.parkingButtonContainer}>
        <ParkingButton
          isParked={isParked}
          onPress={handleManualParkingButton}
        />
      </View>
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
  legend: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 150,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  legendColor: {
    width: 20,
    height: 12,
    marginRight: 5,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  legendText: {
    fontSize: 10,
    color: '#333',
  },
  polygonInfo: {
    position: 'absolute',
    bottom: 180,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  polygonInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  polygonInfoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
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
  parkingButtonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});