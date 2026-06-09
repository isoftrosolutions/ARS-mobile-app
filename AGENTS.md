# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## Quick start

```sh
npm start          # Expo dev server
npm run android    # dev on connected Android
npm run ios        # dev on iOS simulator
npm run web        # dev in browser
npx eas build -p android --profile preview   # APK
npx eas build -p android --profile production # AAB
```

No lint/typecheck/test scripts configured in `package.json`.

## Architecture

- **Entry**: `index.js` → `App.js` → `src/navigation/AppNavigator.js`
- **UI**: React Native Paper (`MD3LightTheme` extended in `src/theme/paperTheme.js`); tab nav + native-stack screens
- **Auth**: JWT Bearer (7-day expiry), persisted via `AsyncStorage` with remember-me. `AuthContext` provides `signIn/signUp/signOut/refreshUser`. 401 interceptor in `src/api/client.js` clears token and calls `onUnauthorized` handler
- **Cart**: `CartContext` with optimistic updates; items revert on API failure. Cart loads automatically when authenticated
- **API**: Axios client at `src/api/client.js` — base URL from `app.json` `extra.apiBaseUrl` (`https://easyshoppingars.com/api/v1`); helper `extractData(res)` returns `response.data.data`
- **Theme tokens**: `src/theme/` barrel export (`colors, typography, spacing, radius, shadows, paperTheme`). Colors mirror the PHP website's `design-tokens.css`
- **Fonts**: Fraunces (display/headings 400–900) + DM Sans (body 400–700) via `@expo-google-fonts/*`, loaded at app root in `App.js`
- **Notifications**: `expo-notifications` + `expo-device`. Token registered on mount in `App.js` and POSTed to `/user/push-token` (best-effort)
- **Payments**: COD, eSewa, BankQR. eSewa requires photo proof upload via `expo-image-picker`

## Key conventions

- **Currency**: NPR `"Rs."` formatted with `en-IN` locale (see `PriceTag.js` `formatPrice`)
- **Nepal address data**: Hardcoded in `src/data/nepal-address.js` (provinces → districts array) + `src/data/nepal.json` (full with municipalities)
- **Brand**: `#ea6c00` primary, `#d97706` gold
- **Pure JS** — no TypeScript in this repo
- **`newArchEnabled: true** in `app.json` (Expo New Architecture)
- **Package**: `com.isoftro.easyshoppingars`

## External dependencies

- PHP API backend at `C:\Apache24\htdocs\ars` (`api/v1/index.php` is the route table)
- `mobile-app-prd.md` = PRD & handoff doc with session-start reading list
- `PLAYSTORE_CHECKLIST.md` = Play Store submission steps
- Expo plugins: `expo-font`, `expo-notifications`
