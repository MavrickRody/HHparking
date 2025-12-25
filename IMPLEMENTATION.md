# Hamburg Parking App - Implementation Guide

## Overview
This document describes the implementation of the Hamburg Street Parking App with real-time occupancy tracking, OpenStreetMap integration, and intelligent parking recommendations.

## Architecture

### Core Components

#### 1. Map Integration
- **OpenStreetMap**: Uses free OSM tiles instead of Google Maps to avoid API costs
- **Implementation**: `react-native-maps` with `UrlTile` component
- **Tile Server**: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`

#### 2. Parking Data Structure
- **GeoJSON Format**: Hamburg parking data stored in `assets/hamburg-parking.json`
- **Polygon Features**: Each parking area is a GeoJSON polygon with properties:
  - `ausrichtung_zur_strasse`: Parking orientation (längs/quer/schräg)
  - `primaere_bewirtschaftung`: Parking type (Parkschein/frei/Bewohnerparken)
  - `strassenname`: Street name
- **Capacity Calculation**: Automatically calculated based on polygon area and orientation

#### 3. Services

##### LocationService (`src/services/LocationService.ts`)
- GPS location tracking
- Geofencing for parking polygon detection
- Automatic parking detection (2+ minutes stationary in parking area)
- Departure detection (moving >50m from parking location)

##### OccupancyService (`src/services/OccupancyService.ts`)
- Real-time occupancy tracking
- Parking event management (parked/departed)
- Automatic data expiration (24 hours)
- Color-coding based on occupancy rates:
  - Green: <50% occupied
  - Yellow: 50-80% occupied
  - Red: >80% occupied

##### FirebaseService (`src/services/FirebaseService.ts`)
- User authentication
- Parking spot storage
- Real-time data synchronization
- Push notifications

#### 4. Utilities

##### ParkingDataParser (`src/utils/parkingDataParser.ts`)
- GeoJSON parsing
- Capacity calculation from polygon area
- Point-in-polygon detection for geofencing
- Paid/free parking determination

##### ParkingRecommendations (`src/utils/parkingRecommendations.ts`)
- Smart ranking algorithm based on:
  - Distance from user
  - Available capacity
  - Paid vs. free preference
  - Data freshness
- Top N recommendations
- Nearest available parking finder

#### 5. UI Components

##### MapScreen (`src/screens/MapScreen.tsx`)
- Main map view with OpenStreetMap tiles
- Parking polygon overlays with color-coding
- Manual parking buttons ("Parked Here" / "Leaving Now")
- Automatic tracking toggle
- Recommendations modal
- Legend showing occupancy levels

##### ParkingPolygon (`src/components/Map/ParkingPolygon.tsx`)
- Renders parking areas as map overlays
- Color-coded by occupancy
- Different border colors for paid (orange) vs. free (blue) parking

##### ParkingButton (`src/components/ParkingButton.tsx`)
- Manual parking action button
- Green when not parked, red when parked

## Features Implemented

### ✅ Core Features
- [x] OpenStreetMap integration (no API costs)
- [x] Hamburg parking polygon overlay
- [x] GeoJSON data parsing
- [x] Paid/free parking detection
- [x] Capacity estimation from polygon geometry
- [x] Real-time occupancy tracking
- [x] Color-coded parking availability
- [x] Manual parking reporting
- [x] Automatic parking detection with geofencing
- [x] Parking recommendations

### ✅ User Parking Detection

#### Manual Mode
- "Parked Here" button: Records parking event
- "Leaving Now" button: Marks departure
- Validates user is within a parking polygon

#### Automatic Mode
- Background location tracking
- Detects parking: Stationary >2 minutes in parking polygon
- Detects departure: Movement >50m from parked location
- User confirmation prompts

### ✅ Occupancy Tracking
- Per-polygon occupancy calculation
- Active parking session tracking
- Automatic event expiration (24 hours)
- Real-time updates across users (via Firebase)

### ✅ Smart Recommendations
- Ranking by distance, availability, and user preferences
- Top 5 recommendations displayed
- Navigate to recommended parking on tap
- Distance formatting (meters/kilometers)

## Data Flow

### Parking Event Flow
```
User parks → LocationService detects → Geofence check → Prompt user → 
Record event → OccupancyService updates → UI refreshes → Color updates
```

### Recommendation Flow
```
User taps recommend → Calculate scores → Sort by score → Display top 5 →
User selects → Navigate map → Show details
```

## Configuration

### Parking Detection Thresholds
- **Stationary threshold**: 120 seconds (2 minutes)
- **Movement threshold**: 50 meters
- **Location update interval**: 5 seconds
- **Distance filter**: 10 meters

### Occupancy Settings
- **Data expiration**: 24 hours
- **Available threshold**: <50%
- **Limited threshold**: 50-80%
- **Full threshold**: >80%

### Recommendation Settings
- **Max distance**: 2000 meters (2km)
- **Top recommendations**: 5
- **Score weights**:
  - Distance: -1 per 100m
  - Availability: +50 for full capacity
  - Free parking bonus: +30
  - Paid parking penalty: -10
  - Capacity bonus: +5 * log(capacity)

## Testing Considerations

### Manual Testing
1. Grant location permissions
2. Navigate to Hamburg area (53.5511, 9.9937)
3. Tap parking polygons to see details
4. Use manual "Parked Here" button
5. Check occupancy updates
6. View recommendations
7. Enable auto-detection and simulate movement

### Edge Cases Handled
- User outside parking areas (shows alert)
- No location permission (graceful degradation)
- Stale occupancy data (visual indicator)
- No recommendations available (empty state)
- GPS inaccuracy (distance thresholds)

## Performance Optimizations

### Map Performance
- Polygon rendering optimized with `react-native-maps`
- Limited to Hamburg region by default
- Efficient point-in-polygon algorithm

### Data Management
- In-memory occupancy cache
- Event cleanup (24-hour expiration)
- Lazy loading of parking data

### Battery Optimization
- Configurable location update intervals
- User can disable auto-detection
- Efficient geofencing checks

## Future Enhancements

### Planned Features
- [ ] Integration with real Hamburg parking API
- [ ] Parking reservation system
- [ ] Payment integration for paid parking
- [ ] Historical occupancy trends
- [ ] Machine learning for better predictions
- [ ] Multi-city support
- [ ] Offline mode with cached data
- [ ] Route navigation to parking
- [ ] Parking timer/reminders
- [ ] User reviews and ratings

### Technical Improvements
- [ ] Background location tracking (react-native-background-geolocation)
- [ ] Push notifications for nearby available parking
- [ ] Real-time Firebase listeners for occupancy
- [ ] Geohash-based spatial queries
- [ ] Progressive web app support
- [ ] Analytics dashboard

## Dependencies

### Required
- `react-native-maps`: Map rendering
- `react-native-geolocation-service`: Location services
- `@react-native-firebase/app`: Firebase core
- `@react-native-firebase/firestore`: Database
- `react-native-vector-icons`: Icons

### Optional for Production
- `react-native-background-geolocation`: Background tracking
- `@react-native-firebase/messaging`: Push notifications
- `@react-native-firebase/analytics`: Usage tracking

## License
MIT License - See LICENSE file for details

## Support
For issues and questions, please create an issue on GitHub.
