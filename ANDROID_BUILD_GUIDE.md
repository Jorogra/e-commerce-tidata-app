# Complete Guide: Transform Web App to Android APK

This guide will walk you through converting your Leap-based web app into a fully functional Android application.

---

## 📱 Part 1: PWA (Progressive Web App) - ALREADY CONFIGURED ✅

Your app now includes:
- ✅ PWA Manifest (`/frontend/public/manifest.json`)
- ✅ Service Worker for offline support (`/frontend/public/sw.js`)
- ✅ Auto-registration in App.tsx

### Test PWA on Your Phone NOW:

1. **Open the app on your phone's browser:**
   - Visit: `https://e-commerce-platform-d5jt93482vjjvfmb67n0.lp.dev`

2. **Install as PWA:**
   - **Chrome Android:** Tap menu (⋮) → "Install app" or "Add to Home Screen"
   - **Safari iOS:** Tap Share → "Add to Home Screen"

3. **Replace Icons (REQUIRED):**
   ```bash
   # You need to create these files:
   frontend/public/icon-192.png  (192x192 pixels)
   frontend/public/icon-512.png  (512x512 pixels)
   ```
   
   **Quick Solution:**
   - Go to https://www.pwabuilder.com/imageGenerator
   - Upload any logo (or screenshot the Package icon from your app)
   - Generate and download icons
   - Replace the placeholder files

---

## 🚀 Part 2: Build Native Android APK with Capacitor

Capacitor wraps your web app into a native Android container.

### Prerequisites:

1. **Install Required Software:**
   ```bash
   # Node.js (already installed if using Leap)
   node --version  # Should be 18+
   
   # Java JDK 17 (required for Android)
   java --version
   ```
   
   Download JDK: https://adoptium.net/

2. **Install Android Studio:**
   - Download: https://developer.android.com/studio
   - During setup, install:
     - Android SDK
     - Android SDK Platform (API 33+)
     - Android Virtual Device (for testing)

3. **Set Environment Variables:**
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   ```

---

## 📦 Step-by-Step: Export from Leap

### Step 1: Download Your Project

Since Leap doesn't support building APKs directly, you need to export your code:

```bash
# In Leap, use File > Download or export your entire project
# Save it to a local folder, e.g., ~/my-store-app
```

### Step 2: Setup Local Environment

```bash
cd ~/my-store-app

# Install all dependencies
npm install

# Install Capacitor CLI globally
npm install -g @capacitor/cli

# Install Capacitor core and Android platform
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### Step 3: Initialize Capacitor (ALREADY CONFIGURED)

The `capacitor.config.json` is already in your project. Verify it:

```json
{
  "appId": "com.store.app",
  "appName": "E-Commerce Store",
  "webDir": "frontend/dist",
  "server": {
    "androidScheme": "https"
  }
}
```

**IMPORTANT:** Change `appId` to something unique for your app:
```json
"appId": "com.yourcompany.storename"
```

### Step 4: Update Backend API URLs

Your Encore backend needs to be accessible from the mobile app.

**Option A: Use Leap's deployed backend (Recommended for testing)**

Create `frontend/config.ts`:
```typescript
export const API_URL = "https://e-commerce-platform-d5jt93482vjjvfmb67n0.api.lp.dev";
```

Update `frontend/client.ts` or where you initialize the backend client to use this URL.

**Option B: Deploy backend to production**

You'll need to deploy your Encore backend to a production environment. Follow Encore's deployment docs.

### Step 5: Build the Web App

```bash
# Build the frontend (creates frontend/dist)
cd frontend
npm run build
cd ..
```

### Step 6: Add Android Platform

```bash
# Initialize Capacitor (if not already done)
npx cap init

# Add Android platform
npx cap add android

# This creates an /android folder with native Android project
```

### Step 7: Sync Web Assets to Android

```bash
# Copy built web assets to Android project
npx cap sync android

# Or update existing project
npx cap update android
```

### Step 8: Configure Android App Details

Edit `android/app/src/main/res/values/strings.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">E-Commerce Store</string>
    <string name="title_activity_main">Store</string>
    <string name="package_name">com.store.app</string>
</resources>
```

### Step 9: Open in Android Studio

```bash
# Open the Android project in Android Studio
npx cap open android
```

This opens Android Studio with your Android project.

---

## 🔧 Android Studio: Build APK

### Method 1: Debug APK (Testing)

1. **In Android Studio:**
   - Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   
2. **Wait for build to complete** (may take 5-10 minutes first time)

3. **Locate APK:**
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

4. **Transfer to Phone:**
   - Email it to yourself
   - Use USB cable: `adb install app-debug.apk`
   - Upload to Google Drive and download on phone

### Method 2: Release APK (Production)

1. **Generate Signing Key:**
   ```bash
   keytool -genkey -v -keystore my-release-key.jks \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias my-key-alias
   ```

2. **Configure Gradle Signing:**
   
   Edit `android/app/build.gradle`:
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               storeFile file("../../my-release-key.jks")
               storePassword "YOUR_KEYSTORE_PASSWORD"
               keyAlias "my-key-alias"
               keyPassword "YOUR_KEY_PASSWORD"
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled false
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **Build Release APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

4. **APK Location:**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

---

## 🧪 Testing

### Test on Emulator:

1. In Android Studio, click **Device Manager**
2. Create new Virtual Device (Pixel 6, API 33)
3. Click Run ▶️ button

### Test on Real Device:

1. **Enable Developer Options on phone:**
   - Settings → About Phone → Tap "Build Number" 7 times

2. **Enable USB Debugging:**
   - Settings → Developer Options → USB Debugging

3. **Connect phone via USB**

4. **In Android Studio:** Select your device and click Run ▶️

---

## 🔄 Development Workflow

Every time you make changes:

```bash
# 1. Make changes to frontend code
# 2. Rebuild frontend
cd frontend
npm run build

# 3. Sync to Android
cd ..
npx cap sync android

# 4. Reopen in Android Studio (if needed)
npx cap open android

# 5. Rebuild APK in Android Studio
```

---

## 📲 Publishing to Google Play Store

### 1. Create Google Play Developer Account
- Cost: $25 one-time fee
- Register at: https://play.google.com/console

### 2. Prepare App Assets
- App icon (512x512 PNG)
- Feature graphic (1024x500)
- Screenshots (at least 2)
- Privacy policy URL
- App description

### 3. Build AAB (Android App Bundle)

```bash
cd android
./gradlew bundleRelease
```

Location: `android/app/build/outputs/bundle/release/app-release.aab`

### 4. Upload to Play Console
- Create new app
- Upload AAB file
- Fill in all required information
- Submit for review

**Review time:** 1-7 days

---

## 🐛 Common Issues & Solutions

### Issue: "JAVA_HOME not set"
```bash
# Find Java location
which java
# Set JAVA_HOME
export JAVA_HOME=/path/to/java
```

### Issue: "SDK location not found"
Create `android/local.properties`:
```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

### Issue: "Cleartext HTTP traffic not permitted"
Your API must use HTTPS. The backend URL in production must have SSL.

### Issue: Build fails with Gradle errors
```bash
cd android
./gradlew clean
./gradlew build
```

### Issue: App crashes on startup
Check Android Logcat in Android Studio for error messages. Usually API connection issues.

---

## 📚 Additional Resources

- **Capacitor Docs:** https://capacitorjs.com/docs
- **Android Developer Guide:** https://developer.android.com/guide
- **Encore.ts Docs:** https://encore.dev/docs
- **PWA Checklist:** https://web.dev/pwa-checklist/

---

## 🎯 Quick Summary

1. ✅ PWA is already configured - test on phone now
2. 📥 Download project from Leap
3. 🔧 Install Android Studio + JDK
4. 📦 Run `npx cap add android`
5. 🏗️ Build APK in Android Studio
6. 📱 Install on phone
7. 🚀 Submit to Play Store (optional)

---

**Need Help?** 
- Check Capacitor docs: https://capacitorjs.com
- Join Capacitor Discord: https://discord.gg/UPYYRhtyzp
- Encore community: https://encore.dev/discord
