# DevOps Study Companion - Mobile App

Mobile application built with React Native and Expo, connecting to the existing DevOps Study Companion backend.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed
- Expo Go app on your phone (for testing)
- EAS CLI installed (`npm install -g eas-cli`)

### 2. Setup
```bash
cd mobile
npm install
```

### 3. API Configuration
Open `src/api.js` and update `BASE_URL` with your computer's local IP address:
```javascript
const BASE_URL = 'http://192.168.1.XX:5001/api';
```

### 4. Run the App
```bash
npx expo start
```
Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android).

## 📱 Features Implemented
- **Login:** Hardcoded `ghost69` / `2001` authentication.
- **Dashboard:** Real-time stats from the backend.
- **Navigation:** Bottom tab navigation for all modules.

## 🏗️ Generating Android APK (Production)

To generate a standalone APK using Expo Application Services (EAS):

1. **Login to Expo:**
   ```bash
   eas login
   ```

2. **Configure Project:**
   ```bash
   eas build:configure
   ```

3. **Build APK:**
   ```bash
   eas build -p android --profile preview
   ```
   *Note: Using `--profile preview` with `buildType: apk` in `eas.json` allows you to download a direct APK file instead of an AAB (Play Store bundle).*

4. **Download:**
   Once the build is finished, EAS will provide a link to download the `.apk` file.

## 📁 Project Structure
- `App.js`: Entry point & Navigation
- `src/api.js`: Backend communication
- `src/theme.js`: Styling tokens
- `src/screens/`: App screens (Dashboard, Login, etc.)
