# Hamburg Parking App

A React Native mobile application that helps users find available street parking in Hamburg by tracking real-time occupancy data crowdsourced from app users. The app uses OpenStreetMap to display Hamburg parking polygons with intelligent recommendations based on availability, distance, and user preferences.

## Features

### Core Functionality
- **OpenStreetMap Integration**: Free, open-source maps with no API costs
- **Parking Polygon Overlays**: Visual representation of Hamburg parking areas from GeoJSON data
- **Real-time Occupancy Tracking**: Color-coded parking areas showing availability
  - 🟢 Green: <50% occupied (plenty of spots)
  - 🟡 Yellow: 50-80% occupied (limited spots)
  - 🔴 Red: >80% occupied (very few spots)
- **Automatic Parking Detection**: GPS-based detection when users park (2+ minutes stationary in parking area)
- **Manual Parking Actions**: "Parked Here" and "Leaving Now" buttons for manual reporting
- **Smart Recommendations**: AI-powered parking suggestions ranked by distance, availability, and preferences
- **Paid/Free Detection**: Automatically identifies paid vs. free parking from city data
- **Capacity Estimation**: Calculates available spots based on polygon geometry and orientation

### User Management
- **Authentication**: Email/password and social media login (Google, Facebook)
- **Profile Management**: User profiles with vehicle details
- **Multi-language Support**: German and English localization

### Technical Features
- **Cross-platform**: Works on both iOS and Android
- **Geofencing**: Detects when users enter/exit parking polygons
- **Real-time Database**: Firebase Firestore for live data synchronization
- **Automatic Data Expiration**: Parking events auto-expire after 24 hours
- **GDPR Compliant**: Secure data handling and privacy protection

## Technology Stack

- **Frontend**: React Native with TypeScript
- **Navigation**: React Navigation 7
- **Maps**: React Native Maps with **OpenStreetMap tiles** (no Google Maps API costs)
- **Backend**: Firebase (Authentication, Firestore, Cloud Messaging)
- **Location Services**: React Native Geolocation Service
- **Internationalization**: react-i18next
- **Icons**: React Native Vector Icons

## Requirements

### Functional Requirements
- User registration and authentication
- GPS-based parking polygon detection with geofencing
- Real-time occupancy tracking and visualization
- Interactive map with parking polygon overlays
- Manual and automatic parking event reporting
- Smart parking recommendations
- Paid/free parking identification

### Non-Functional Requirements
- **Performance**: App loads within 3 seconds, real-time occupancy updates
- **Scalability**: Supports large number of concurrent users
- **Usability**: Intuitive UI with color-coded parking areas
- **Security**: GDPR compliant data encryption and secure authentication
- **Reliability**: 99.5% uptime availability
- **Compatibility**: iOS 12+ and Android 8.0+
- **Cost**: No paid map API costs (uses OpenStreetMap)

## Installation

### Prerequisites
- Node.js 16 or higher
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)
- Firebase project with proper configuration

### Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/MavrickRody/HHparking.git
   cd HHparking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Configure Firebase**
   - Create a Firebase project
   - Add your `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Enable Authentication, Firestore, and Cloud Messaging
   - See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions

5. **Add Hamburg Parking Data** (Optional)
   - Sample data is included in `assets/hamburg-parking.json`
   - For production, obtain official GeoJSON data from Hamburg Open Data portal
   - Replace sample data with real parking polygon data

## Running the App

### Development
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS  
npm run ios
```

### Building for Production
```bash
# Android
npm run build:android

# iOS
# Use Xcode to build and archive
```

## Architecture

### Directory Structure
```
HHparking/
├── assets/
│   └── hamburg-parking.json    # GeoJSON parking data
├── src/
│   ├── components/
│   │   ├── Map/
│   │   │   └── ParkingPolygon.tsx    # Polygon overlay component
│   │   └── ParkingButton.tsx         # Manual parking button
│   ├── screens/
│   │   └── MapScreen.tsx             # Main map with OSM integration
│   ├── navigation/
│   │   └── AppNavigator.tsx          # Navigation configuration
│   ├── services/
│   │   ├── LocationService.ts        # GPS & geofencing
│   │   ├── OccupancyService.ts       # Occupancy tracking
│   │   └── FirebaseService.ts        # Backend integration
│   ├── utils/
│   │   ├── parkingDataParser.ts      # GeoJSON parsing
│   │   └── parkingRecommendations.ts # Smart recommendations
│   ├── types/
│   │   └── index.ts                  # TypeScript definitions
│   └── i18n/                         # Internationalization
├── IMPLEMENTATION.md                  # Technical documentation
└── README.md                         # This file
```

### Key Services

#### LocationService
- GPS tracking with geolocation
- Geofencing for parking polygon detection
- Automatic parking/departure detection
- Distance calculations

#### OccupancyService
- Real-time occupancy tracking per parking area
- Parking event management (parked/departed)
- Automatic data expiration (24 hours)
- Color-coding based on occupancy rates

#### FirebaseService
- User authentication
- Firestore database integration
- Real-time data synchronization
- Push notifications

#### ParkingDataParser
- GeoJSON feature parsing
- Capacity calculation from polygon geometry
- Point-in-polygon detection
- Paid/free parking determination

#### ParkingRecommendations
- Multi-factor scoring algorithm
- Distance-based ranking
- Availability preference handling
- Top N recommendations

## Usage

### For Users

#### Getting Started
1. **Install & Launch**: Download and open the app
2. **Grant Permissions**: Allow location access for parking detection
3. **View Map**: See Hamburg parking areas with color-coded availability

#### Manual Parking
1. Park your car in a marked parking area
2. Tap the **"Parked Here"** button
3. The app validates you're in a parking polygon
4. Occupancy is updated in real-time

#### Automatic Detection
1. Enable **"Start Auto"** tracking
2. App detects when you're stationary for 2+ minutes in a parking area
3. Confirm parking prompt
4. App automatically detects when you leave (movement >50m)

#### Finding Parking
1. Tap the **recommendations icon**
2. View top 5 recommended parking areas
3. Sorted by distance, availability, and preferences
4. Tap to navigate to recommended spot

#### Understanding Colors
- **Green areas**: <50% occupied (plenty of spots)
- **Yellow areas**: 50-80% occupied (limited availability)
- **Red areas**: >80% occupied (very few spots)
- **Orange border**: Paid parking
- **Blue border**: Free parking

### For Developers

#### Key Implementation Patterns
- **TypeScript** for type safety across all modules
- **Service singleton pattern** for shared state
- **React hooks** for component state management
- **Event-driven architecture** for parking events
- **Geospatial algorithms** for polygon operations

#### Adding New Parking Data
1. Obtain GeoJSON data from Hamburg Open Data portal
2. Ensure features follow the schema in `src/types/index.ts`
3. Replace or extend `assets/hamburg-parking.json`
4. Parser automatically calculates capacity and identifies paid parking

#### Extending Recommendations
Modify scoring in `src/utils/parkingRecommendations.ts`:
```typescript
// Adjust weights in calculateScore()
score -= distance / 100;  // Distance weight
score += availabilityScore; // Availability weight
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

```bash
# Run tests
npm test

# Run linting
npm run lint
```

## Deployment

### Android
1. Generate signed APK using `npm run build:android`
2. Upload to Google Play Store

### iOS
1. Build archive in Xcode
2. Upload to App Store Connect

## Roadmap

### Phase 1 (Completed ✅)
- ✅ OpenStreetMap integration (no API costs)
- ✅ Hamburg parking polygon overlay from GeoJSON
- ✅ Real-time occupancy tracking
- ✅ Color-coded parking availability
- ✅ Automatic parking detection with geofencing
- ✅ Manual parking actions
- ✅ Smart recommendations algorithm
- ✅ Paid/free parking identification
- ✅ Capacity estimation from polygon geometry
- ✅ User authentication

### Phase 2 (Next Steps)
- [ ] Real Hamburg parking data integration (Open Data portal)
- [ ] Background location tracking
- [ ] Push notifications for nearby available parking
- [ ] Firebase real-time listeners for live occupancy updates
- [ ] Historical occupancy trends and analytics
- [ ] Machine learning for parking prediction
- [ ] Parking timer and reminders
- [ ] User reviews and ratings for parking areas

### Phase 3 (Future)
- [ ] Payment integration for paid parking
- [ ] Parking reservation system
- [ ] Route navigation to recommended parking
- [ ] Offline mode with cached polygon data
- [ ] Expansion to other German cities
- [ ] Electric vehicle charging station integration
- [ ] Integration with public transport
- [ ] Progressive web app version
- [ ] Smart city partnerships

## Privacy & Security

- **Data Encryption**: All user data encrypted in transit and at rest
- **GDPR Compliance**: Full compliance with European data protection regulations
- **Location Privacy**: Location data used only for parking functionality
- **Secure Authentication**: Firebase Authentication with industry standards

## Support

For support, please contact the development team or create an issue in the GitHub repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Hamburg City Council for parking data access
- React Native community for excellent documentation
- Firebase team for robust backend services
- OpenStreetMap for geocoding services
