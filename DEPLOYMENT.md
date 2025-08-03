# Deployment Guide

This guide covers deploying the Hamburg Parking App to production environments.

## Prerequisites

- Completed Firebase setup (see `FIREBASE_SETUP.md`)
- Apple Developer Account (for iOS)
- Google Play Developer Account (for Android)
- Code signing certificates configured

## Pre-deployment Checklist

### Code Quality
- [ ] All TypeScript types properly defined
- [ ] ESLint and Prettier configured and passing
- [ ] No console.log statements in production code
- [ ] Error boundaries implemented
- [ ] Loading states implemented for all async operations

### Testing
- [ ] Unit tests written for core services
- [ ] Integration tests for critical user flows
- [ ] Manual testing on physical devices
- [ ] Performance testing completed
- [ ] Accessibility testing completed

### Security
- [ ] Firebase security rules deployed and tested
- [ ] API keys properly restricted
- [ ] No sensitive data in code
- [ ] HTTPS enforced for all network requests
- [ ] Input validation implemented

### Compliance
- [ ] Privacy policy implemented and accessible
- [ ] Terms of service implemented
- [ ] GDPR compliance verified
- [ ] App store guidelines reviewed
- [ ] Location permission usage clearly explained

## Environment Configuration

### Production Environment Variables
Create production environment configurations:

```bash
# .env.production
GOOGLE_MAPS_API_KEY=your_production_api_key
FIREBASE_PROJECT_ID=hamburg-parking-app-prod
ENVIRONMENT=production
```

### Build Configuration
Update `app.json` for production:

```json
{
  "name": "HamburgParkingApp",
  "displayName": "Hamburg Parking",
  "orientation": "portrait",
  "version": "1.0.0",
  "buildNumber": "1"
}
```

## Android Deployment

### Generate Signed APK/AAB

1. **Generate Upload Key**
   ```bash
   keytool -genkeypair -v -keystore upload-key.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Gradle**
   Add to `android/app/build.gradle`:
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                   storeFile file(MYAPP_UPLOAD_STORE_FILE)
                   storePassword MYAPP_UPLOAD_STORE_PASSWORD
                   keyAlias MYAPP_UPLOAD_KEY_ALIAS
                   keyPassword MYAPP_UPLOAD_KEY_PASSWORD
               }
           }
       }
       buildTypes {
           release {
               ...
               signingConfig signingConfigs.release
           }
       }
   }
   ```

3. **Set Environment Variables**
   Add to `~/.gradle/gradle.properties`:
   ```properties
   MYAPP_UPLOAD_STORE_FILE=upload-key.keystore
   MYAPP_UPLOAD_KEY_ALIAS=upload
   MYAPP_UPLOAD_STORE_PASSWORD=*****
   MYAPP_UPLOAD_KEY_PASSWORD=*****
   ```

4. **Build Release**
   ```bash
   cd android
   ./gradlew assembleRelease
   # or for AAB (recommended)
   ./gradlew bundleRelease
   ```

### Google Play Store Deployment

1. **Create App Listing**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new application
   - Fill in app details, description, screenshots

2. **Upload App Bundle**
   - Upload AAB file from `android/app/build/outputs/bundle/release/`
   - Configure content rating
   - Set up pricing and distribution

3. **Release Management**
   - Create internal testing track first
   - Promote to closed testing (beta)
   - Final promotion to production

### Key Configuration Files

**android/app/src/main/AndroidManifest.xml**
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.hamburgparking.app">
    
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false">
        
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="@string/google_maps_api_key" />
            
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

## iOS Deployment

### Configure Xcode Project

1. **Open iOS Project**
   ```bash
   cd ios
   open HamburgParkingApp.xcworkspace
   ```

2. **Configure Signing & Capabilities**
   - Select project in navigator
   - Choose target → Signing & Capabilities
   - Select team and configure bundle identifier
   - Enable required capabilities:
     - Location services
     - Push notifications
     - Background app refresh

3. **Add Required Permissions to Info.plist**
   ```xml
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>This app needs location access to detect and report parking spots</string>
   <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
   <string>This app needs location access to detect parking spots even when not in use</string>
   <key>NSCameraUsageDescription</key>
   <string>Camera access is needed for profile photos</string>
   ```

### Build and Archive

1. **Set Release Configuration**
   - Product → Scheme → Edit Scheme
   - Set Build Configuration to "Release"

2. **Archive Build**
   - Product → Archive
   - Wait for archive to complete

3. **Upload to App Store Connect**
   - Organizer will open automatically
   - Select archive and click "Distribute App"
   - Choose "App Store Connect"
   - Follow upload wizard

### App Store Connect Configuration

1. **Create App Record**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Create new app with bundle ID

2. **App Information**
   - Fill in app name, description, keywords
   - Upload screenshots and app preview videos
   - Set app category and content rating

3. **Pricing and Availability**
   - Set pricing (free for this app)
   - Select territories for availability

4. **Submit for Review**
   - Complete all required sections
   - Submit for App Store review

## Backend Deployment (Firebase)

### Firestore Configuration

1. **Deploy Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Deploy Indexes**
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Set Up Monitoring**
   - Enable Firebase Performance Monitoring
   - Configure alerts for critical metrics

### Cloud Functions (Optional)

If using Cloud Functions for advanced features:

```bash
# Deploy functions
firebase deploy --only functions

# Set environment variables
firebase functions:config:set maps.api_key="YOUR_API_KEY"
```

## Monitoring and Analytics

### Firebase Analytics
- Events automatically tracked
- Custom events for key user actions
- Conversion funnels set up

### Crashlytics
```bash
# Enable Crashlytics in Firebase Console
# Add to build.gradle (Android) and Xcode project (iOS)
```

### Performance Monitoring
- Automatic performance tracking enabled
- Custom traces for critical operations

## CI/CD Pipeline

### GitHub Actions (Example)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Stores

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Build Android
        run: |
          cd android
          ./gradlew bundleRelease
      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.SERVICE_ACCOUNT_JSON }}
          packageName: com.hamburgparking.app
          releaseFiles: android/app/build/outputs/bundle/release/app-release.aab
          track: production

  deploy-ios:
    runs-on: macOS-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: |
          npm install
          cd ios && pod install
      - name: Build iOS
        run: |
          xcodebuild archive -workspace ios/HamburgParkingApp.xcworkspace \
                           -scheme HamburgParkingApp \
                           -configuration Release \
                           -archivePath build/HamburgParkingApp.xcarchive
      - name: Upload to App Store
        run: |
          xcodebuild -exportArchive -archivePath build/HamburgParkingApp.xcarchive \
                                  -exportPath build/ \
                                  -exportOptionsPlist ios/ExportOptions.plist
```

## Post-Deployment

### App Store Optimization (ASO)
- Monitor app store rankings
- A/B test app store listing elements
- Respond to user reviews promptly

### User Feedback
- Set up in-app feedback system
- Monitor app store reviews
- Track user analytics and behavior

### Updates and Maintenance
- Regular dependency updates
- Security patch deployment
- Feature updates based on user feedback

### Rollout Strategy
1. **Soft Launch** (Week 1-2)
   - Release in limited regions
   - Monitor for critical issues
   - Gather initial user feedback

2. **Beta Testing** (Week 3-4)
   - Expand to beta users
   - Test all critical flows
   - Performance optimization

3. **Full Release** (Week 5+)
   - Global rollout
   - Marketing campaign launch
   - Continuous monitoring and updates

## Troubleshooting Common Issues

### Build Issues
- Clear cache: `npm start -- --reset-cache`
- Clean build folders
- Verify all dependencies are compatible

### Store Rejection
- Review store guidelines carefully
- Test on multiple devices and OS versions
- Ensure all required metadata is complete

### Runtime Issues
- Use remote logging (Firebase Crashlytics)
- Implement proper error boundaries
- Test offline scenarios

## Support and Maintenance

### Monitoring Checklist
- [ ] Firebase Analytics configured
- [ ] Crashlytics monitoring active
- [ ] Performance monitoring enabled
- [ ] User feedback system in place
- [ ] App store review monitoring
- [ ] Security vulnerability monitoring

### Regular Maintenance Tasks
- Weekly: Review analytics and crash reports
- Monthly: Update dependencies and security patches
- Quarterly: Performance optimization review
- Annually: Major feature updates and platform upgrades

## Contact Information

For deployment issues or questions:
- Development Team: dev@hamburgparking.app
- DevOps Support: devops@hamburgparking.app
- Emergency: +49-xxx-xxx-xxxx