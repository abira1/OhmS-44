# GitHub Actions APK Build Setup

## Overview

This repository is configured with GitHub Actions to automatically build Android APKs whenever you push code or create releases. No local Android SDK installation required!

## How It Works

### Automatic Builds

1. **On every push to main**: Creates a debug APK for testing
2. **On tagged releases**: Creates a production APK with proper release notes

### What Gets Built

- **Debug APKs**: For testing and development (created on every push)
- **Release APKs**: For distribution (created when you tag a release)

## Creating Your First Release

### Step 1: Push Your Code

Your GitHub Actions workflow is already set up. Just push your code:

```bash
git add .
git commit -m "Ready for first release"
git push origin main
```

This will create a debug build automatically.

### Step 2: Create a Release Tag

To create a production release:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

Or create a release through GitHub web interface:
1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Tag: `v1.0.0`
4. Title: `OhmS-44 v1.0.0 - Enhanced Mobile Experience`
5. Click "Publish release"

### Step 3: Download Your APK

After the workflow completes:
1. Go to "Releases" in your GitHub repository
2. Download the `OhmS-v1.0.0.apk` file
3. Install on your Android device

## Workflow Features

### ✅ What's Included

- **Automatic Android SDK setup** in the cloud
- **Node.js and Java environment** configuration
- **Capacitor sync** and build process
- **APK signing** for release builds
- **Automatic release creation** with detailed changelog
- **Debug builds** for testing
- **Artifact storage** for easy download

### 🔧 Build Process

1. **Environment Setup**:
   - Ubuntu runner with Node.js 18
   - Java 17 (required for Android builds)
   - Android SDK with API 34

2. **Build Steps**:
   - Install npm dependencies
   - Build web application (`npm run build`)
   - Sync Capacitor (`npm run cap:sync`)
   - Build Android APK (`./gradlew assembleDebug/Release`)

3. **Release Creation**:
   - Rename APK with version number
   - Generate comprehensive changelog
   - Create GitHub release with APK attached

## File Locations

After build completion, you can find:

- **APK files**: In GitHub Releases
- **Build logs**: In Actions tab → Build workflow
- **Artifacts**: In workflow run details (for 90 days)

## Customization

### Changing Build Settings

Edit `.github/workflows/build-and-release.yml` to:

- **Change Android API level**: Modify `platforms;android-34`
- **Add build variants**: Add `assembleRelease` steps
- **Modify release notes**: Edit the changelog generation section
- **Change triggers**: Modify the `on:` section

### Adding Signing

For production apps, add signing configuration:

1. **Generate keystore**:
   ```bash
   keytool -genkey -v -keystore ohms-release.keystore -alias ohms -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Add secrets to GitHub**:
   - `KEYSTORE_FILE`: Base64 encoded keystore
   - `KEYSTORE_PASSWORD`: Keystore password
   - `KEY_ALIAS`: Key alias
   - `KEY_PASSWORD`: Key password

3. **Update workflow** to use signing

### Environment Variables

The workflow uses these environment variables:
- `ANDROID_HOME`: Set automatically by setup-android action
- `JAVA_HOME`: Set automatically by setup-java action
- `GITHUB_TOKEN`: Provided automatically for releases

## Troubleshooting

### Common Issues

1. **Build fails with "SDK not found"**:
   - Check that `setup-android` action is working
   - Verify `local.properties` creation step

2. **Gradle build fails**:
   - Check Java version (should be 17)
   - Verify Android SDK components installation

3. **Release creation fails**:
   - Check `GITHUB_TOKEN` permissions
   - Verify tag format (should start with 'v')

### Debug Steps

1. **Check workflow logs**:
   - Go to Actions tab in GitHub
   - Click on failed workflow
   - Expand failed step to see error details

2. **Test locally** (if needed):
   - Install Android Studio
   - Run `npm run build && npm run cap:sync`
   - Build in Android Studio

3. **Verify dependencies**:
   - Check `package.json` for correct scripts
   - Ensure Capacitor is properly configured

## Next Steps

### After First Successful Build

1. **Test the APK** on your Android device
2. **Create releases repository** (optional):
   - Create `abira1/ohms-releases` repository
   - Uncomment repository lines in workflow
   - Move releases to dedicated repo

3. **Set up automatic versioning**:
   - Use semantic versioning (v1.0.0, v1.1.0, etc.)
   - Consider using conventional commits

4. **Add more build variants**:
   - Staging builds
   - Different flavors (dev, prod)
   - Multiple architectures

### Monitoring

- **Check Actions tab** regularly for build status
- **Set up notifications** for failed builds
- **Monitor APK size** and build times

## Security Notes

- **Secrets**: Never commit keystores or passwords
- **Permissions**: Use minimal required permissions
- **Dependencies**: Keep actions and dependencies updated
- **Signing**: Use proper signing for production releases

## Support

If you encounter issues:
1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review [Capacitor CI/CD guide](https://capacitorjs.com/docs/guides/ci-cd)
3. Check workflow logs for specific error messages

Your APK builds are now fully automated! 🚀
