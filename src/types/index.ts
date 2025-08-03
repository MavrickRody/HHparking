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