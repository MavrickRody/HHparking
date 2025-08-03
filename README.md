# Hamburg Parking App

A React Native mobile application designed to help users find available parking spaces in Hamburg in real-time. The app allows users to report parking availability and receive notifications about nearby parking spots.

## Features

### Core Functionality
- **Real-time Parking Detection**: Automatic detection when users park or leave a parking spot using GPS tracking
- **Interactive Map**: Live map showing available parking spots with different markers for paid and free parking
- **Push Notifications**: Real-time notifications to nearby users about parking availability
- **Manual Reporting**: Users can manually report parking spot availability
- **User Feedback**: Rating and review system for parking spots

### User Management
- **Authentication**: Email/password and social media login (Google, Facebook)
- **Profile Management**: User profiles with vehicle details
- **Multi-language Support**: German and English localization

### Technical Features
- **Cross-platform**: Works on both iOS and Android
- **Offline Support**: Core functionality works with limited connectivity
- **GDPR Compliant**: Secure data handling and privacy protection
- **Real-time Database**: Firebase Firestore for live data synchronization

## Technology Stack

- **Frontend**: React Native with TypeScript
- **Navigation**: React Navigation 6
- **Maps**: React Native Maps with Google Maps
- **Backend**: Firebase (Authentication, Firestore, Cloud Messaging)
- **Location Services**: React Native Geolocation Service
- **Internationalization**: react-i18next
- **Icons**: React Native Vector Icons

## Requirements

### Functional Requirements
- User registration and authentication
- GPS-based parking spot detection
- Real-time notifications
- Interactive map with parking availability
- Manual parking spot reporting
- User feedback and rating system

### Non-Functional Requirements
- **Performance**: App loads within 3 seconds, notifications sent within 30 seconds
- **Scalability**: Supports large number of concurrent users
- **Usability**: Intuitive UI with multi-language support
- **Security**: GDPR compliant data encryption and secure authentication
- **Reliability**: 99.5% uptime availability
- **Compatibility**: iOS 12+ and Android 8.0+

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

5. **Configure Google Maps**
   - Get Google Maps API key
   - Add to `android/app/src/main/AndroidManifest.xml` and iOS configuration

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
src/
├── components/         # Reusable UI components
├── screens/           # Screen components
├── navigation/        # Navigation configuration
├── services/          # API and service layers
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── hooks/            # Custom React hooks
└── i18n/             # Internationalization files
```

### Key Services
- **LocationService**: GPS tracking and parking detection
- **FirebaseService**: Authentication and data management
- **NotificationService**: Push notification handling

## Usage

### For Users
1. **Registration**: Create account with email or social login
2. **Permission**: Grant location and notification permissions
3. **Parking Detection**: App automatically detects when you park
4. **Manual Reporting**: Report parking spots manually if needed
5. **Notifications**: Receive alerts about nearby available parking
6. **Feedback**: Rate and review parking spots

### For Developers
The app follows React Native best practices with:
- TypeScript for type safety
- Component-based architecture
- Service layer for business logic
- State management with React hooks
- Internationalization support

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

### Phase 1 (Current)
- ✅ Basic parking detection and reporting
- ✅ Real-time map interface
- ✅ User authentication
- ✅ Push notifications

### Phase 2 (Future)
- [ ] Integration with Hamburg parking APIs
- [ ] Payment system for paid parking
- [ ] Advanced analytics and reporting
- [ ] Social features and parking groups
- [ ] AI-powered parking prediction

### Phase 3 (Long-term)
- [ ] Expansion to other German cities
- [ ] Electric vehicle charging station integration
- [ ] Integration with public transport
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
