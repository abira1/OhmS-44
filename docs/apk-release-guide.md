# APK Release Guide for OhmS-44

## Overview

This guide walks you through building and releasing the OhmS-44 Android APK using Capacitor and GitHub releases.

## Prerequisites

- Node.js 18+ installed
- Android Studio installed with SDK
- Java Development Kit (JDK) 11 or higher
- GitHub account with repository access

## Step 1: Build the APK

### 1.1 Install Dependencies

```bash
npm install
```

### 1.2 Build the Web App

```bash
npm run build
```

### 1.3 Initialize Capacitor (if not done)

```bash
npm run cap:init
```

### 1.4 Add Android Platform (if not done)

```bash
npm run cap:add:android
```

### 1.5 Sync and Build

```bash
# Sync web assets to native project
npm run cap:sync

# Build the Android APK
npm run mobile:android
```

This will:
1. Build the web application
2. Sync assets to the Android project
3. Open Android Studio for final build

### 1.6 Generate APK in Android Studio

1. **Open the project** in Android Studio (should open automatically)
2. **Wait for Gradle sync** to complete
3. **Build APK**:
   - Go to `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Or use the terminal: `./gradlew assembleDebug` (for debug) or `./gradlew assembleRelease` (for release)

### 1.7 Locate the APK

The APK will be generated in:
```
android/app/build/outputs/apk/debug/app-debug.apk
# or for release:
android/app/build/outputs/apk/release/app-release.apk
```

## Step 2: Create GitHub Releases Repository

### 2.1 Create Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `ohms-releases`
3. Make it public (for easy downloads)
4. Add a description: "Release files for OhmS-44 mobile application"

### 2.2 Repository Structure

```
ohms-releases/
├── README.md
├── CHANGELOG.md
└── releases/
    └── v1.0.0/
        ├── OhmS-44.apk
        ├── release-notes.md
        └── checksums.txt
```

## Step 3: Create a Release

### 3.1 Prepare Release Files

1. **Rename the APK**: `app-release.apk` → `OhmS-44.apk`
2. **Create checksums** (optional but recommended):
   ```bash
   # Generate SHA256 checksum
   sha256sum OhmS-44.apk > checksums.txt
   ```

### 3.2 Create Release on GitHub

1. Go to your `ohms-releases` repository
2. Click **"Releases"** → **"Create a new release"**
3. Fill in the release information:

#### Tag Version
```
v1.0.0
```

#### Release Title
```
OhmS-44 v1.0.0 - Enhanced Mobile Experience
```

#### Release Description
```markdown
# OhmS-44 v1.0.0 - Enhanced Mobile Experience

## 🎉 What's New

### Enhanced Pull-to-Refresh
- Comprehensive pull-to-refresh functionality with real-time visual feedback
- Haptic feedback integration using Capacitor with web vibration fallback
- Smart refresh logic for different content types (routine, classmates, attendance, etc.)
- Retro-themed animations with progress feedback

### Performance Improvements
- Optimized for smooth 60fps animations with throttled updates
- Efficient gesture recognition and conflict resolution
- Reduced memory usage and improved battery life

### Device Compatibility
- Enhanced device detection and compatibility
- Automatic fallback mechanisms for non-touch devices
- Improved accessibility with keyboard shortcuts and ARIA labels

### Visual Enhancements
- Retro CRT-style visual effects and animations
- Enhanced dark/light theme support
- Improved mobile layout and responsive design

## 📱 Installation

1. Download the APK file below
2. Enable "Install from unknown sources" in Android Settings → Security
3. Open the downloaded APK file
4. Follow installation prompts
5. Grant necessary permissions for full functionality

## 📋 Requirements

- **Android Version**: 7.0 (API 24) or higher
- **Storage**: ~10 MB free space
- **RAM**: 2 GB recommended
- **Internet**: Required for data synchronization

## 🔧 Permissions

This app requires the following permissions:
- **Internet access**: For data synchronization
- **Network state**: To detect connectivity
- **Vibration**: For haptic feedback
- **Wake lock**: To prevent sleep during use
- **Install shortcuts**: For home screen shortcuts

## 🐛 Known Issues

- None reported for this version

## 📞 Support

If you encounter any issues:
1. Check the [documentation](https://github.com/abira1/OhmS-44/docs)
2. Report bugs on [GitHub Issues](https://github.com/abira1/OhmS-44/issues)
3. Contact the development team

## 🔄 Changelog

### Added
- Enhanced pull-to-refresh functionality
- Haptic feedback integration
- Smart refresh logic
- Device compatibility improvements
- Performance optimizations

### Fixed
- Various bug fixes and stability improvements

### Changed
- Updated UI/UX for better mobile experience
- Improved accessibility features

---

**File Information:**
- **APK Size**: ~3.5 MB
- **Build Date**: [Current Date]
- **Build Number**: 1
- **Target SDK**: 34 (Android 14)
- **Min SDK**: 24 (Android 7.0)
```

### 3.3 Upload Assets

1. **Drag and drop** or **choose files** to upload:
   - `OhmS-44.apk` (the main APK file)
   - `checksums.txt` (optional)

2. **Publish the release**

## Step 4: Update Download URLs

The download URLs are already configured in the code to point to:
```
https://github.com/abira1/ohms-releases/releases/download/v1.0.0/OhmS-44.apk
```

Once you upload the APK, the download will work automatically.

## Step 5: Test the Download

1. **Visit your app**: Go to the download page
2. **Test the download**: Click the download button
3. **Verify the APK**: Install and test on a device

## Automation (Optional)

### GitHub Actions for Automated Releases

Create `.github/workflows/release.yml` in your main repository:

```yaml
name: Build and Release APK

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build web app
      run: npm run build
      
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '11'
        
    - name: Setup Android SDK
      uses: android-actions/setup-android@v2
      
    - name: Build APK
      run: |
        npm run cap:sync
        cd android
        ./gradlew assembleRelease
        
    - name: Create Release
      uses: softprops/action-gh-release@v1
      with:
        files: android/app/build/outputs/apk/release/app-release.apk
        name: OhmS-44 ${{ github.ref_name }}
        body: |
          Automated release for OhmS-44 ${{ github.ref_name }}
          
          Download the APK below and install on your Android device.
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Troubleshooting

### Common Issues

1. **Build fails**: Check Android SDK and Java versions
2. **APK not installing**: Enable unknown sources in Android settings
3. **App crashes**: Check device compatibility (Android 7.0+)
4. **Download fails**: Verify GitHub release is public

### Build Environment

Make sure you have:
- Android SDK 34 (Android 14)
- Build Tools 34.0.0
- Platform Tools
- JDK 11 or higher

## Security Notes

### APK Signing

For production releases, sign your APK:

1. **Generate keystore**:
   ```bash
   keytool -genkey -v -keystore ohms-release.keystore -alias ohms -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Sign APK**:
   ```bash
   jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ohms-release.keystore app-release-unsigned.apk ohms
   ```

3. **Align APK**:
   ```bash
   zipalign -v 4 app-release-unsigned.apk OhmS-44.apk
   ```

### Checksums

Always provide checksums for security:
```bash
sha256sum OhmS-44.apk > checksums.txt
md5sum OhmS-44.apk >> checksums.txt
```

## Next Steps

1. **Build the APK** following the steps above
2. **Create the releases repository** on GitHub
3. **Upload the APK** as a release asset
4. **Test the download** from your app
5. **Share with users** and gather feedback

The enhanced pull-to-refresh feature and improved mobile experience are now ready for distribution!
