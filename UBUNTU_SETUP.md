# Ubuntu Development Setup Guide

## System Requirements for Hamburg Parking App on Ubuntu

This guide covers all dependencies and setup steps needed to develop the Hamburg Parking App on Ubuntu Linux.

### Tested on:
- Ubuntu 20.04 LTS, 22.04 LTS, and 24.04 LTS
- x86_64 architecture

---

## 1. System Dependencies

### Update System Packages
```bash
sudo apt update
sudo apt upgrade -y
```

### Install Essential Build Tools
```bash
sudo apt install -y curl git wget build-essential
```

### Install Development Libraries
```bash
# Required for React Native compilation
sudo apt install -y libpng-dev libjpeg-dev libgif-dev \
  libwebp-dev libfreetype6-dev libfontconfig1-dev \
  libx11-dev libxext-dev libxrender-dev libxrandr-dev \
  libgl1-mesa-dev libglu1-mesa-dev

# Required for watchman
sudo apt install -y autoconf automake libtool pkg-config
```

---

## 2. Node.js Installation

### Using NodeSource Repository (Recommended)
```bash
# Install Node.js 18.x LTS or higher
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
```

### Alternative: Using nvm (Node Version Manager)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc

# Install Node.js
nvm install 18
nvm use 18
nvm alias default 18
```

---

## 3. Java Development Kit (JDK)

### Install OpenJDK 17 (Required for React Native 0.80+)
```bash
sudo apt install -y openjdk-17-jdk

# Verify installation
java -version

# Set JAVA_HOME environment variable
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$PATH:$JAVA_HOME/bin' >> ~/.bashrc
source ~/.bashrc
```

---

## 4. Android Studio and SDK

### Download and Install Android Studio
```bash
# Download Android Studio (replace URL with latest version)
wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2023.3.1.18/android-studio-2023.3.1.18-linux.tar.gz

# Extract to /opt
sudo tar -xzf android-studio-*.tar.gz -C /opt/

# Create desktop entry
sudo ln -s /opt/android-studio/bin/studio.sh /usr/local/bin/android-studio

# Launch Android Studio
android-studio
```

### Configure Android SDK via Android Studio
1. Launch Android Studio
2. Follow the setup wizard to install Android SDK
3. Install the following SDK components:
   - Android SDK Platform 34 (or latest)
   - Android SDK Build-Tools 34.0.0
   - Android Emulator
   - Android SDK Platform-Tools
   - Intel x86 Emulator Accelerator (HAXM) or configure KVM

### Set Android Environment Variables
```bash
# Add to ~/.bashrc or ~/.zshrc
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools/bin' >> ~/.bashrc
source ~/.bashrc

# Verify
echo $ANDROID_HOME  # Should show /home/your-username/Android/Sdk
adb --version       # Should show Android Debug Bridge version
```

---

## 5. Watchman (Facebook's File Watching Service)

### Install from Source
```bash
# Clone watchman repository
cd /tmp
git clone https://github.com/facebook/watchman.git
cd watchman
git checkout v2023.11.20.00  # Use latest stable version

# Build and install
./autogen.sh
./configure
make
sudo make install

# Verify installation
watchman --version
```

### Alternative: Using Snap
```bash
sudo snap install watchman --classic
```

---

## 6. React Native CLI

### Install Globally
```bash
sudo npm install -g react-native-cli

# Verify installation
react-native --version
```

---

## 7. KVM for Android Emulator (Recommended for Performance)

### Check KVM Support
```bash
egrep -c '(vmx|svm)' /proc/cpuinfo
# If output is > 0, your CPU supports virtualization
```

### Install KVM
```bash
sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils

# Add your user to kvm and libvirt groups
sudo adduser $USER kvm
sudo adduser $USER libvirt

# Reboot to apply group changes
sudo reboot
```

### Configure Android Emulator for KVM
```bash
# After reboot, verify KVM is working
kvm-ok
# Should output: "KVM acceleration can be used"
```

---

## 8. Additional Tools for Hamburg Parking App

### Install Git LFS (for large files)
```bash
sudo apt install -y git-lfs
git lfs install
```

### Install TypeScript and Development Tools
```bash
# These will also be installed locally via npm install
sudo npm install -g typescript ts-node
```

---

## 9. Project Setup

### Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/MavrickRody/HHparking.git
cd HHparking

# Install project dependencies
npm install

# Note: iOS dependencies (pod install) only work on macOS
```

### Configure Firebase (Required)
1. Create a Firebase project at https://console.firebase.google.com
2. Add an Android app to your project
3. Download `google-services.json`
4. Place it in `android/app/google-services.json`

---

## 10. Running the App on Ubuntu

### Start Metro Bundler
```bash
npm start
```

### Run on Android Device/Emulator (Separate Terminal)
```bash
# Connect Android device via USB or start emulator
adb devices  # Verify device is connected

# Run the app
npm run android
```

### Build Release APK
```bash
npm run build:android

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

---

## 11. Troubleshooting Common Ubuntu Issues

### Issue: `ENOSPC` Error (File Watcher Limit)
```bash
# Increase inotify watch limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Issue: Permission Denied for `/dev/kvm`
```bash
# Check KVM group membership
groups | grep kvm

# If not in kvm group:
sudo adduser $USER kvm
# Then logout and login again
```

### Issue: Android SDK License Not Accepted
```bash
yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
```

### Issue: Gradle Daemon Issues
```bash
# Stop all Gradle daemons
cd android
./gradlew --stop

# Clean build
./gradlew clean
```

### Issue: Port 8081 Already in Use
```bash
# Kill process using port 8081
sudo lsof -ti:8081 | xargs kill -9

# Or use a different port
npm start -- --port 8088
```

---

## 12. IDE Recommendations for Ubuntu

### Visual Studio Code (Recommended)
```bash
# Install via snap
sudo snap install code --classic

# Recommended extensions:
# - React Native Tools
# - ESLint
# - Prettier
# - TypeScript
```

### Android Studio (For Android Development)
- Already installed in step 4
- Use for Android debugging and profiling

---

## 13. USB Debugging Setup

### Enable USB Debugging on Android Device
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB

### Configure USB Permissions
```bash
# Create udev rules file
sudo nano /etc/udev/rules.d/51-android.rules

# Add the following line (replace XXXX with your device vendor ID)
SUBSYSTEM=="usb", ATTR{idVendor}=="XXXX", MODE="0666", GROUP="plugdev"

# Common vendor IDs:
# Google: 18d1
# Samsung: 04e8
# Motorola: 22b8
# LG: 1004

# Reload udev rules
sudo udevadm control --reload-rules
sudo service udev restart

# Replug your device
```

---

## 14. Memory and Performance Optimization

### Increase Node.js Memory Limit
```bash
# Add to ~/.bashrc
echo 'export NODE_OPTIONS="--max-old-space-size=4096"' >> ~/.bashrc
source ~/.bashrc
```

### Configure Gradle for Better Performance
Edit `android/gradle.properties`:
```properties
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

---

## 15. Verification Checklist

After completing all steps, verify your setup:

```bash
# Node.js
node --version          # ✓ v18.x or higher
npm --version           # ✓ v9.x or higher

# Java
java -version           # ✓ OpenJDK 17 or higher
echo $JAVA_HOME         # ✓ Should show JDK path

# Android
echo $ANDROID_HOME      # ✓ Should show Android SDK path
adb --version           # ✓ Should show ADB version

# React Native
react-native --version  # ✓ Should show CLI version

# Watchman
watchman --version      # ✓ Should show version

# KVM (optional but recommended)
kvm-ok                  # ✓ "KVM acceleration can be used"

# Project
cd HHparking
npm install             # ✓ Should complete without errors
npm start               # ✓ Should start Metro bundler
```

---

## 16. Quick Reference Commands

```bash
# Start development server
npm start

# Run on Android
npm run android

# Build release APK
npm run build:android

# Check connected devices
adb devices

# View Android logs
adb logcat | grep ReactNative

# Clean Android build
cd android && ./gradlew clean && cd ..

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Additional Resources

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Android Studio Setup](https://developer.android.com/studio)
- [Watchman Installation](https://facebook.github.io/watchman/docs/install.html)
- [Firebase Setup Guide](./FIREBASE_SETUP.md)

---

## Support

For issues specific to Ubuntu setup, please create an issue with:
- Ubuntu version (`lsb_release -a`)
- Node.js version (`node --version`)
- Error messages and logs

Happy coding! 🚀
