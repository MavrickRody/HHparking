import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid, Platform, Alert} from 'react-native';
import {LocationPermission} from '../types';

export class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private lastLocation: {latitude: number; longitude: number} | null = null;
  private isParked = false;
  private stationaryThreshold = 30; // seconds
  private stationaryTimer: NodeJS.Timeout | null = null;

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestLocationPermission(): Promise<LocationPermission> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Hamburg Parking Location Permission',
            message: 'This app needs access to location for parking detection',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        
        return {
          granted: granted === PermissionsAndroid.RESULTS.GRANTED,
          denied: granted === PermissionsAndroid.RESULTS.DENIED,
          blocked: granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
        };
      } catch (err) {
        console.warn(err);
        return {granted: false, denied: true, blocked: false};
      }
    }
    
    // iOS permission handling would go here
    return {granted: true, denied: false, blocked: false};
  }

  async getCurrentLocation(): Promise<{latitude: number; longitude: number} | null> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          this.lastLocation = location;
          resolve(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          Alert.alert('Location Error', 'Unable to get current location');
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  }

  startLocationTracking(
    onLocationUpdate: (location: {latitude: number; longitude: number}) => void,
    onParkingDetected: (location: {latitude: number; longitude: number}) => void,
    onLeavingDetected: (location: {latitude: number; longitude: number}) => void,
  ): void {
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        onLocationUpdate(newLocation);
        this.detectParkingState(newLocation, onParkingDetected, onLeavingDetected);
        this.lastLocation = newLocation;
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
      },
    );
  }

  stopLocationTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.stationaryTimer) {
      clearTimeout(this.stationaryTimer);
      this.stationaryTimer = null;
    }
  }

  private detectParkingState(
    newLocation: {latitude: number; longitude: number},
    onParkingDetected: (location: {latitude: number; longitude: number}) => void,
    onLeavingDetected: (location: {latitude: number; longitude: number}) => void,
  ): void {
    if (!this.lastLocation) return;

    const distance = this.calculateDistance(this.lastLocation, newLocation);
    const isStationary = distance < 20; // Less than 20 meters movement

    if (isStationary && !this.isParked) {
      // User might be parking
      if (!this.stationaryTimer) {
        this.stationaryTimer = setTimeout(() => {
          this.isParked = true;
          onParkingDetected(newLocation);
          this.stationaryTimer = null;
        }, this.stationaryThreshold * 1000);
      }
    } else if (!isStationary) {
      // User is moving
      if (this.stationaryTimer) {
        clearTimeout(this.stationaryTimer);
        this.stationaryTimer = null;
      }
      
      if (this.isParked && distance > 50) {
        // User is leaving parking spot
        this.isParked = false;
        onLeavingDetected(this.lastLocation);
      }
    }
  }

  private calculateDistance(
    pos1: {latitude: number; longitude: number},
    pos2: {latitude: number; longitude: number},
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (pos1.latitude * Math.PI) / 180;
    const φ2 = (pos2.latitude * Math.PI) / 180;
    const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<string> {
    try {
      // Using OpenStreetMap Nominatim API (free alternative to Google)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      );
      const data = await response.json();
      return data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }
}