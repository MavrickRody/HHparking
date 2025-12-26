export interface User {
  id: string;
  email: string;
  name: string;
  vehicleDetails?: {
    make: string;
    model: string;
    licensePlate: string;
  };
  createdAt: Date;
}

export interface ParkingSpot {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  isPaid: boolean;
  isAvailable: boolean;
  reportedBy: string;
  reportedAt: Date;
  estimatedDuration?: number; // in minutes
  verifiedAt?: Date;
  rating?: number;
}

export interface ParkingNotification {
  id: string;
  parkingSpotId: string;
  type: 'parking_available' | 'parking_taken';
  latitude: number;
  longitude: number;
  address: string;
  isPaid: boolean;
  sentAt: Date;
  userId: string;
}

export interface UserFeedback {
  id: string;
  parkingSpotId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface LocationPermission {
  granted: boolean;
  denied: boolean;
  blocked: boolean;
}

// GeoJSON Types for Hamburg Parking Data
export interface ParkingPolygonGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

export interface ParkingPolygonProperties {
  ausrichtung_zur_strasse: string; // e.g., "längs", "quer", "schräg"
  markierung: string; // e.g., "ja", "nein"
  fahrzeugtyp: string; // e.g., "Allgemein"
  primaere_bewirtschaftung: string; // e.g., "Parkschein", "Bewohnerparken", "frei"
  geltungszeit_primaerer_bewirtschaftung?: string;
  strassenname: string;
}

export interface ParkingPolygonFeature {
  type: 'Feature';
  id: string;
  geometry: ParkingPolygonGeometry;
  properties: ParkingPolygonProperties;
  srsName: string;
}

export interface ParkingAreaData {
  id: string;
  polygon: ParkingPolygonFeature;
  isPaid: boolean;
  estimatedCapacity: number;
  streetName: string;
}

export interface ParkingOccupancy {
  polygonId: string;
  totalCapacity: number;
  occupiedSpots: number;
  availableSpots: number;
  lastUpdated: Date;
  occupancyRate: number; // 0-1
}

export interface ParkingEvent {
  id: string;
  userId: string;
  polygonId: string;
  eventType: 'parked' | 'departed';
  timestamp: Date;
  latitude: number;
  longitude: number;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  nearbyParkingSpots: ParkingSpot[];
  selectedLanguage: 'en' | 'de';
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ParkingDetails: {
    parkingSpot: ParkingSpot;
  };
  UserProfile: undefined;
  Feedback: {
    parkingSpotId: string;
  };
};

export type MainTabParamList = {
  Map: undefined;
  Notifications: undefined;
  Profile: undefined;
};