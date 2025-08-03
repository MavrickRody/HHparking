# Firebase Setup Guide

This guide will help you set up Firebase for the Hamburg Parking App.

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Google account
- Access to Google Cloud Console

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `hamburg-parking-app`
4. Enable Google Analytics (recommended)
5. Select or create a Google Analytics account
6. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable the following providers:
   - **Email/Password**: Enable this provider
   - **Google**: Enable and configure OAuth consent screen
   - **Facebook**: Enable and add App ID/App Secret (optional)

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials
5. Add your package name and SHA-1 certificate fingerprint

## Step 3: Set up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (will be changed later)
4. Choose a location (europe-west3 for Frankfurt, closest to Hamburg)
5. Click "Done"

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

## Step 4: Enable Cloud Messaging

1. In Firebase Console, go to **Cloud Messaging**
2. No additional setup required for basic FCM

## Step 5: Add Apps to Firebase Project

### Android App
1. Click "Add app" → Android icon
2. Enter package name: `com.hamburgparking.app`
3. Enter app nickname: "Hamburg Parking Android"
4. Download `google-services.json`
5. Place file in `android/app/` directory

### iOS App
1. Click "Add app" → iOS icon
2. Enter bundle ID: `com.hamburgparking.app`
3. Enter app nickname: "Hamburg Parking iOS"
4. Download `GoogleService-Info.plist`
5. Add file to iOS project in Xcode

## Step 6: Configure React Native

### Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Initialize Firebase in Project
```bash
firebase init
```

Select:
- Firestore: Configure rules and indexes files
- Functions: Configure Cloud Functions (optional)
- Hosting: Configure hosting (for admin panel)

## Step 7: Environment Configuration

### Android Configuration

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY" />
```

### iOS Configuration

Add to `ios/HamburgParkingApp/Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to detect parking spots</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to detect parking spots</string>
```

## Step 8: Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API
   - Places API (optional)
3. Create API key
4. Restrict API key to your bundle IDs/package names

## Step 9: Test Configuration

### Test Authentication
```bash
# Make sure Firebase is properly configured
npm run start
# Test login functionality in the app
```

### Test Firestore
```bash
# Check Firestore rules in Firebase Console
# Create a test user and parking spot
```

### Test Push Notifications
```bash
# Use Firebase Console to send a test notification
# Verify FCM token generation in app logs
```

## Step 10: Security Configuration

### Update Firestore Rules
Replace the default rules with the rules from `firestore.rules`:

1. Go to Firebase Console → Firestore → Rules
2. Copy content from `firestore.rules`
3. Click "Publish"

### Set up API Key Restrictions
1. In Google Cloud Console, go to APIs & Credentials
2. Edit your API key
3. Add application restrictions:
   - Android: Add your package name and SHA-1 fingerprint
   - iOS: Add your bundle identifier

## Environment Variables

Create `.env` file (not committed to git):
```
GOOGLE_MAPS_API_KEY=your_api_key_here
FIREBASE_PROJECT_ID=hamburg-parking-app
```

## Deployment

### Deploy Firestore Rules and Indexes
```bash
firebase deploy --only firestore
```

### Deploy Cloud Functions (if using)
```bash
firebase deploy --only functions
```

## Troubleshooting

### Common Issues

1. **Google Maps not showing**
   - Check API key configuration
   - Verify API is enabled in Google Cloud Console
   - Check bundle ID/package name restrictions

2. **Firebase Auth not working**
   - Verify google-services.json/GoogleService-Info.plist are in correct locations
   - Check Firebase project configuration
   - Ensure auth providers are enabled

3. **Firestore permission denied**
   - Check Firestore rules
   - Verify user authentication
   - Check field validation in rules

4. **Push notifications not working**
   - Verify FCM configuration
   - Check notification permissions
   - Test with Firebase Console test message

### Debug Commands
```bash
# Check Firebase project
firebase projects:list

# Check Firestore rules
firebase firestore:rules:get

# Test Firestore rules locally
firebase emulators:start --only firestore
```

## Production Checklist

- [ ] Firebase project created and configured
- [ ] Authentication providers enabled and configured
- [ ] Firestore rules deployed and tested
- [ ] Google Maps API configured with restrictions
- [ ] FCM notifications tested
- [ ] Security rules reviewed
- [ ] API keys secured and restricted
- [ ] Privacy policy and terms of service added
- [ ] GDPR compliance verified

## Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)

For project-specific issues:
- Create an issue in the GitHub repository
- Contact the development team