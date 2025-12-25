/**
 * Application-wide constants for Hamburg Parking App
 */

// Hamburg geographic constants
export const HAMBURG_CENTER = {
  latitude: 53.5511,
  longitude: 9.9937,
};

// Geospatial constants for Hamburg latitude (~53.5°N)
export const GEO_CONSTANTS = {
  // Meters per degree of latitude (constant worldwide)
  METERS_PER_DEGREE_LAT: 111320,
  
  // Meters per degree of longitude at Hamburg latitude
  // Calculated as: 111320 * cos(53.5511 * PI / 180)
  METERS_PER_DEGREE_LON: 111320 * Math.cos(53.5511 * Math.PI / 180),
  
  // Earth's radius in meters
  EARTH_RADIUS_METERS: 6371e3,
  
  // Earth's radius in kilometers
  EARTH_RADIUS_KM: 6371,
};

// Parking space dimensions (in meters)
export const PARKING_DIMENSIONS = {
  // Parallel parking (längs)
  PARALLEL_LENGTH: 6,
  PARALLEL_WIDTH: 2,
  
  // Perpendicular parking (quer)
  PERPENDICULAR_LENGTH: 5,
  PERPENDICULAR_WIDTH: 2.5,
  
  // Diagonal parking (schräg)
  DIAGONAL_LENGTH: 5,
  DIAGONAL_WIDTH: 2.5,
};

// Parking detection thresholds
export const DETECTION_THRESHOLDS = {
  // Time user must be stationary to detect parking (seconds)
  STATIONARY_TIME: 120, // 2 minutes
  
  // Maximum movement distance to be considered stationary (meters)
  STATIONARY_DISTANCE: 20,
  
  // Minimum movement distance to detect departure (meters)
  DEPARTURE_DISTANCE: 50,
  
  // Location update interval (milliseconds)
  UPDATE_INTERVAL: 5000, // 5 seconds
  
  // Distance filter for location updates (meters)
  DISTANCE_FILTER: 10,
};

// Occupancy thresholds
export const OCCUPANCY_THRESHOLDS = {
  // Available parking (<50% occupied)
  AVAILABLE: 0.5,
  
  // Limited parking (50-80% occupied)
  LIMITED: 0.8,
  
  // Full parking (>80% occupied)
  FULL: 0.8,
  
  // Data expiration time (milliseconds)
  DATA_EXPIRATION: 24 * 60 * 60 * 1000, // 24 hours
  
  // Stale data threshold (milliseconds)
  STALE_DATA: 60 * 60 * 1000, // 1 hour
};

// Occupancy colors
export const OCCUPANCY_COLORS = {
  AVAILABLE: '#4CAF50',      // Green
  LIMITED: '#FFC107',        // Yellow
  FULL: '#F44336',          // Red
  NO_DATA: '#808080',       // Gray
  
  // With transparency for polygon fill
  AVAILABLE_FILL: 'rgba(76, 175, 80, 0.4)',
  LIMITED_FILL: 'rgba(255, 193, 7, 0.4)',
  FULL_FILL: 'rgba(244, 67, 54, 0.4)',
  NO_DATA_FILL: 'rgba(128, 128, 128, 0.3)',
};

// Parking type colors
export const PARKING_TYPE_COLORS = {
  PAID: '#FF5722',    // Orange
  FREE: '#2196F3',    // Blue
};

// Recommendation settings
export const RECOMMENDATION_SETTINGS = {
  // Maximum distance to consider for recommendations (meters)
  MAX_DISTANCE: 2000, // 2km
  
  // Number of top recommendations to show
  TOP_COUNT: 5,
  
  // Scoring weights
  DISTANCE_WEIGHT: 100,         // Points per 100m
  AVAILABILITY_WEIGHT: 50,      // Max points for full availability
  FREE_PARKING_BONUS: 30,       // Bonus for free parking
  PAID_PARKING_PENALTY: 10,     // Penalty for paid parking
  STALE_DATA_PENALTY: 10,       // Penalty for stale data
  NO_DATA_PENALTY: 20,          // Penalty for no data
  CAPACITY_FACTOR: 5,           // Multiplier for log(capacity)
};

// Parking capacity calculation
export const CAPACITY_SETTINGS = {
  // Efficiency factor (percentage of area usable for parking)
  EFFICIENCY: 0.7, // 70% efficiency
  
  // Minimum capacity per parking area
  MIN_CAPACITY: 1,
};

// Map settings
export const MAP_SETTINGS = {
  // Default map region
  DEFAULT_REGION: {
    latitude: HAMBURG_CENTER.latitude,
    longitude: HAMBURG_CENTER.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // OpenStreetMap tile URL
  OSM_TILE_URL: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  
  // Maximum zoom level
  MAX_ZOOM: 19,
};
