# Google Play Store Submission Checklist - Easy Shopping ARS (Mobile)

Project folder: `D:\ars\easyshopping-mobile-new`

## Pre-Submission Preparation

### 1. App Assets
- [ ] **App Icon**: 512x512 PNG (Play Store listing icon)
- [ ] **Feature Graphic**: 1024x500 PNG
- [ ] **Screenshots**: At least 2 screenshots, 1080x1920 PNG
- [x] **Adaptive Icon configured**: `assets/adaptive-icon.png` referenced from `app.json`

### 2. App Configuration
- [x] **App name**: Easy Shopping ARS (`app.json`)
- [x] **Version**: 1.0.0 (`app.json`)
- [x] **Package name**: `com.isoftro.easyshoppingars` (`app.json`)
- [x] **API base URL**: `https://easyshoppingars.com/api/v1` (`app.json`)

### 3. Privacy Policy
- [ ] Create a public privacy policy page on the website
- [ ] Add URL to Play Console (example target): `https://easyshoppingars.com/privacy-policy`
- [ ] Ensure it covers name/phone/email/address collection and order processing

### 4. Content Rating
- [ ] Complete Play Console content rating questionnaire

### 5. Data Safety Form (Play Console)
- [ ] Declare collection: name, email, phone, address
- [ ] Declare usage: order processing / account management
- [ ] Declare sharing: none (if true)

## Build & Upload (EAS)

### 1. EAS Config
- [x] `eas.json` present (preview APK + production AAB)
- [ ] Run `npx eas login`
- [ ] Run `npx eas build -p android --profile preview` (APK)
- [ ] Run `npx eas build -p android --profile production` (AAB)

### 2. Upload to Play Console
- [ ] Create the app in Google Play Console
- [ ] Upload AAB to Production track
- [ ] Fill store listing (descriptions, graphics, screenshots, contact info, privacy policy URL)
- [ ] Complete “App content” sections (Data safety, Content rating, etc.)
- [ ] Submit for review

## Notes
- If you want, I can generate a `store-assets/` folder with placeholder templates (feature graphic layout, screenshot framing) once you provide logo/brand colors.
