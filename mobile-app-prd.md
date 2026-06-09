# ARS Easy Shopping — Mobile App PRD & Handoff

**Goal.** Achieve full feature + UI/UX parity between the PHP website at `C:\Apache24\htdocs\ars` and the Expo React Native app at `D:\ars\easyshopping-mobile-new`, using the existing JSON API at `https://easyshoppingars.com/api/v1` (server source: `C:\Apache24\htdocs\ars\api\v1`).

This document is the single source of truth for any agent (or developer) continuing the work. Read it top to bottom on session start before touching code.

---

## 1. Project context

| | |
|---|---|
| **Web repo** | `C:\Apache24\htdocs\ars` (PHP + Bootstrap, MySQL) |
| **Mobile repo** | `D:\ars\easyshopping-mobile-new` (Expo SDK 54, React Native 0.81.5, React 19) |
| **API base** | `https://easyshoppingars.com/api/v1` (router: `api/v1/index.php`) |
| **Auth** | JWT bearer, 7-day expiry |
| **Currency** | NPR ("Rs.") — Nepali-style locale |
| **Markets** | Birgunj, Parsa, all of Nepal |
| **Brand** | Easy Shopping A.R.S — primary `#ea6c00` ember + `#d97706` gold |
| **Payment methods** | COD, eSewa, BankQR |
| **Web Bootstrap version** | 5 + Bootstrap Icons |

**Hard constraints (from user, do not violate)**
- Never guess. Read the website code first, then implement.
- Never rewrite large areas blindly; prefer incremental edits.
- Reuse the existing API at `api/v1`. If a feature exists only in the website, add the minimum endpoint there.
- Never commit unless the user explicitly asks.
- Keep mobile under `src/` and follow existing patterns.

---

## 2. Source-of-truth pointers (read on session start)

| Read | Why |
|---|---|
| `C:\Apache24\htdocs\ars\api\v1\index.php` | The complete API route table |
| `C:\Apache24\htdocs\ars\api\v1\README.md` | API contract reference (mostly current) |
| `C:\Apache24\htdocs\ars\public\assets\css\design-tokens.css` | Design tokens (colors, typography, spacing, radius, shadows) |
| `C:\Apache24\htdocs\ars\index.php` | Hero / homepage design language (inline `<style>` is canonical) |
| `C:\Apache24\htdocs\ars\shop.php` / `product.php` / `cart.php` / `checkout.php` | Page-level UX and component patterns |
| `D:\ars\easyshopping-mobile-new\src\theme\` | The current mobile theme mirror |
| `D:\ars\easyshopping-mobile-new\src\navigation\AppNavigator.js` | Navigation shape (must be updated for Batch 2) |
| **This file** | Status, decisions, what's next |

---

## 3. Design system (mobile mirror of website)

All values lifted from `public/assets/css/design-tokens.css` and `index.php` inline styles. The mobile theme files mirror these tokens exactly.

### 3.1 Colors (`src/theme/colors.js`)

| Token | Hex / rgba | Use |
|---|---|---|
| `primary` | `#ea6c00` | Brand ember — CTAs, accents, eyebrows |
| `primaryHover` | `#ff7d2b` | Hover/pressed state |
| `primaryLight` | `rgba(234,108,0,0.10)` | Soft chip / pill backgrounds |
| `gold` | `#d97706` | Secondary brand, stat values |
| `goldLight` | `rgba(217,119,6,0.10)` | Soft gold tint |
| `secondary` / `ice` | `#0f172a` | Text on light, headings |
| `text` | `#111827` | Body text |
| `muted` | `#64748b` | Secondary copy |
| `border` | `#e2e8f0` | Borders |
| `borderSoft` | `rgba(15,23,42,0.08)` | Hairline borders on cards |
| `background` | `#ffffff` | Default screen bg |
| `surfaceAlt` | `#f8fafc` | Cards / sheets / muted screens |
| `surfaceTint` | `#f1f5f9` | Inputs / placeholder backgrounds |
| `success` / `successLight` | `#22c55e` / 10% | In-stock, success alerts |
| `danger` / `dangerLight` | `#ef4444` / 10% | Discount, errors, destructive |
| `warning` / `warningLight` | `#f59e0b` / 10% | Pending, warnings |
| `info` / `infoLight` | `#3b82f6` / 10% | Shipping info, neutral notice |

### 3.2 Typography (`src/theme/typography.js`)

- **Display** font (web: `Fraunces` 700/900) → currently system serif (`Georgia` on iOS, `serif` on Android). Swap point for parity: replace `displayFamily` with `@expo-google-fonts/fraunces` once added as a dep.
- **Body** font (web: `DM Sans` 300/400/500/600) → currently system sans. Swap point: `@expo-google-fonts/dm-sans`.
- Scale: 12, 14, 16, 18, 20, 24, 30, 36, 48 px.
- Weights: 400/500/600/700/800/900.
- Eyebrow style: 11 px, weight 700, letter-spacing 2, uppercase, primary color.

### 3.3 Spacing / radius / shadows

- Spacing: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px` (`src/theme/spacing.js`).
- Radii: `4, 6, 8, 12, 16, 20, 9999 (full)` (`src/theme/radius.js`).
- Shadows: `sm`, `md`, `lg`, `card`, `hover` — mirror `--shadow-*` tokens. iOS uses `shadow*` props, Android `elevation`.

### 3.4 Component patterns (where each lives in mobile)

| Web pattern | Mobile equivalent |
|---|---|
| `btn-fire` (gradient orange→gold) | `<Button variant="primary">` — currently solid primary (note: gradient deferred until `expo-linear-gradient` is added) |
| `btn-void` (outline, transparent) | `<Button variant="ghost">` |
| Black/dark CTA on shop cards | `<Button variant="dark">` |
| `prod-card` | `src/components/ProductCard.js` |
| `cat-tile` | `src/components/CategoryTile.js` |
| `disc-badge` | `<Badge tone="danger" solid>` |
| eyebrow + h2 + subtitle row | `src/components/SectionHeader.js` |
| Auth card | `LoginScreen` / `RegisterScreen` card style |
| Alert pill (success / danger / warning / info) | `src/components/Alert.js` |
| Skeleton bars | `src/components/Skeleton.js` |
| Empty state | `src/components/EmptyState.js` |
| Order timeline dots | inline in `OrderDetailScreen` |
| Sticky bottom action bar (product detail) | inline in `ProductDetailScreen` |

---

## 4. API surface (v1)

All routes registered in `C:\Apache24\htdocs\ars\api\v1\index.php`. Bearer token in `Authorization` header for protected routes. Errors return `{ success: false, message, errors? }` (422 on validation). Pagination shape: `{ success, data, pagination: { total, page, last_page, per_page } }`.

### 4.1 Public

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | `{name, phone, email, password, address?}`. **Account is `active` immediately — no OTP step.** |
| POST | `/auth/verify-otp` | `{phone, otp}` → `{token, user}`. Only used in OTP-driven flows; the mobile register screen does NOT call this. |
| POST | `/auth/login` | `{login_id, password}` (email or phone). Legacy clients can send `{phone, password}`. |
| POST | `/auth/forgot-password` | `{email}` — sends OTP to email (logged to file in dev). |
| POST | `/auth/reset-password` | `{email, otp, new_password}` |
| POST | `/auth/resend-otp` | `{phone}` |
| GET | `/products` | `?page&limit&category&search&sort=newest\|price_asc\|price_desc\|popular` |
| GET | `/products/featured` | top 10 featured |
| GET | `/products/new-arrivals` | top 10 newest |
| GET | `/products/{id}` | by id (or slug — server is currently `(int)` cast — see Known Limits). Response: `{ product, reviews }` (reviews capped at 20 approved) |
| GET | `/products/{id}/reviews` | **NEW (Batch 2).** Paginated, approved reviews + average + count |
| GET | `/categories` | |
| GET | `/banners` | |
| GET | `/settings/shipping` | `{free_shipping_threshold, shipping_cost}` |

### 4.2 Protected (Bearer JWT)

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/logout` | Stateless ack |
| POST | `/auth/change-password` | `{current_password, new_password}` |
| GET | `/user/me` | Returns `{ user: {...} }` (note the wrapper) |
| PATCH | `/user/me` | `{name?, email?, address?, province?, district?, municipality?, ward?, street?}` |
| GET | `/user/addresses` | List, default first |
| POST | `/user/addresses` | `{full_name, phone, province, district, municipality, ward, street?, tag?, is_default?}` |
| PATCH | `/user/addresses/{id}` | partial update |
| PATCH | `/user/addresses/{id}/set-default` | |
| DELETE | `/user/addresses/{id}` | |
| GET | `/cart` | items with `{id, product_id, quantity, product_name, product_image, price, discount_price, stock}` |
| POST | `/cart` | `{product_id, quantity}`. Upsert — sending the same `product_id` replaces the quantity. |
| DELETE | `/cart/{id}` | by cart row id |
| POST | `/cart/sync` | `{items: [{product_id, quantity}]}` replaces full cart |
| GET | `/wishlist` | items joined with product fields |
| POST | `/wishlist` | `{product_id}` |
| DELETE | `/wishlist/{id}` | by wishlist row id |
| GET | `/wishlist/check/{product_id}` | `{wishlisted, wishlist_id}` (`wishlist_id` added in Batch 2) |
| POST | `/orders` | `{items[], payment_method: COD\|eSewa\|BankQR, address_id?, notes?}`. Server-side price calc, stock decrement, status_history entry. Returns `{order_id, order_number, total}`. |
| GET | `/orders` | `?page&status=` paginated with `items_preview` |
| GET | `/orders/{id}` | `{order, items, status_history, address, payment}` |
| GET | `/orders/{id}/invoice` | invoice data |
| POST | `/orders/{id}/cancel` | cancellable in `Pending\|Confirmed\|Shipped` |
| POST | `/orders/{id}/return` | **NEW (Batch 2).** Only `Delivered`, 5-day window from `location_updated_at` |
| POST | `/products/{id}/reviews` | **NEW (Batch 2).** `{rating: 1-5, comment?}`. Upserts (1 review per user per product). Status starts `pending`. |
| POST | `/coupons/validate` | (not yet used by mobile) |
| POST | `/contact` | `{subject, message}` — auth required, creates `contacts` row |

### 4.3 Response conventions

```json
// Success
{ "success": true, "data": ..., "message": "..." }

// Error
{ "success": false, "message": "...", "errors": { "field": ["..."] } }

// Paginated
{ "success": true, "data": [...], "pagination": { "total": N, "page": N, "last_page": N, "per_page": N } }
```

### 4.4 Known API quirks (do not "fix" without asking)

1. **`/auth/register` does NOT send an OTP.** It sets `users.status = 'active'` and returns 201. The README still mentions OTP-on-register from earlier design — the code is authoritative.
2. **`/products/{id}` casts `id` to int.** Slug lookups currently won't work via this endpoint despite the web using slugs. Mobile passes `product.id` (numeric) to be safe. If slug support is needed later, extend `ProductController::show`.
3. **`UserController::me` wraps the user in `{ user: {...} }`** while many other endpoints return the resource directly. The mobile helper at `src/api/user.js` already normalizes this.
4. **Cart upsert semantics:** `POST /cart` with the same `product_id` replaces (not increments) `quantity`. Mobile `CartContext.updateQuantity` relies on this for the stepper.
5. **Orders parse address from a single string column.** `OrderController::show` tries to split by commas into `{province, district, municipality, ward, street}`. Mobile renders `address.full` for safety, with structured fields as a fallback.
6. **eSewa payment-proof upload:** the website checkout supports uploading a screenshot for eSewa orders. The `/api/v1/orders` endpoint does NOT accept a proof file — orders are placed with method only, and proof is handled out-of-band (manually or via the web). If we want full parity, we need either a separate `POST /orders/{id}/payment-proof` endpoint or multipart support on `/orders`. **Open question — not yet implemented.**
7. **Guest orders:** `OrderController::store` supports `{guest_name, guest_phone, guest_email, guest_address, items, payment_method}` (no token). The mobile app currently requires login for checkout — by design (matches web's `loginRequiredModal`).

---

## 5. Parity matrix

Status legend: ✅ done · 🟡 partial · ⛔ missing · 🚫 deferred (needs decision)

| # | Web | Mobile screen | Batch | Status |
|---|---|---|---|---|
| 1 | `index.php` (Home) | `screens/home/HomeScreen.js` | 1 | ✅ |
| 2 | `shop.php` | `screens/shop/ProductListScreen.js` | 1 | ✅ |
| 3 | Category drill-down | reuse `ProductList` with `{category, categoryName}` | 1 | ✅ |
| 4 | `product.php` | `screens/shop/ProductDetailScreen.js` | 1 | ✅ (review submission UI deferred — see §7) |
| 5 | `categories.php` | `screens/shop/CategoriesScreen.js` | 1 | ✅ |
| 6 | `new-arrivals.php` / `deals.php` / featured | `ProductList` variants via route params | 1 | ✅ |
| 7 | `auth/login.php` | `screens/auth/LoginScreen.js` | 1 | ✅ |
| 8 | `auth/signup.php` | `screens/auth/RegisterScreen.js` | 1 | ✅ |
| 9 | `auth/forgot-password.php` | `screens/auth/ForgotPasswordScreen.js` | 1 | ✅ |
| 10 | `auth/reset-password.php` | `screens/auth/ResetPasswordScreen.js` | 1 | ✅ |
| 11 | `profile.php` (basic) | `screens/profile/ProfileStubScreen.js` | 1 | ✅ stub (replaced in Batch 2) |
| 12 | `profile.php` (full) | `screens/profile/ProfileScreen.js` | 2 | ✅ written, **not yet wired into nav** |
| 13 | Password change (within profile) | `screens/profile/ChangePasswordScreen.js` | 2 | ✅ written, **not wired** |
| 14 | Address management (subset of profile) | `screens/profile/AddressListScreen.js` + `AddressFormScreen.js` | 2 | ✅ written, **not wired** |
| 15 | `cart.php` | `screens/cart/CartScreen.js` | 2 | ✅ written, **not wired** |
| 16 | `checkout.php` | `screens/checkout/CheckoutScreen.js` | 2 | ✅ written, **eSewa proof not supported** (see API quirk #6) |
| 17 | `order-success.php` | `screens/checkout/OrderSuccessScreen.js` | 2 | ✅ written, **not wired** |
| 18 | `orders.php` | `screens/orders/OrdersScreen.js` | 2 | ✅ written, **not wired** |
| 19 | `order.php` | `screens/orders/OrderDetailScreen.js` | 2 | ✅ written, **not wired** |
| 20 | `invoice.php` | `screens/orders/InvoiceScreen.js` | 2 | ✅ written (read-only render — no PDF export), **not wired** |
| 21 | `wishlist.php` | `screens/wishlist/WishlistScreen.js` | 2 | ✅ written, **not wired** |
| 22 | `support.php` (FAQ) | `screens/support/SupportScreen.js` | 2 | ⛔ to write |
| 23 | `contact.php` | `screens/support/ContactScreen.js` | 2 | ⛔ to write |
| 24 | `about.php` | `screens/static/AboutScreen.js` | 2 | ⛔ to write (static) |
| 25 | `privacy.php` | `screens/static/PrivacyScreen.js` | 2 | ⛔ to write (static) |
| 26 | `terms.php` | `screens/static/TermsScreen.js` | 2 | ⛔ to write (static) |
| 27 | `shipping.php` | `screens/static/ShippingScreen.js` | 2 | ⛔ to write (static) |
| 28 | `returns.php` | `screens/static/ReturnsScreen.js` | 2 | ⛔ to write (static) |
| 29 | Reviews submit on `product.php` | extend `ProductDetailScreen` with a review form | 3 | 🚫 needs UX decision |
| 30 | Header cart-count badge | tab badge on Cart tab via `CartContext.count` | 2 | ⛔ wire when nav lands |
| 31 | Web `nepal-data.js` cascading province/district selector | `AddressForm` cascading selector | 3 | 🚫 currently plain text inputs |
| 32 | `manifest.json` / PWA / `sw.js` / `offline.php` | Native equivalents (Expo splash, icon) | n/a | not applicable on native |
| 33 | Admin (`admin/*`) | n/a | n/a | out of scope |
| 34 | Web `seed-data.php`, `install.php`, etc. | n/a | n/a | out of scope |

---

## 6. Current repository state

### 6.1 Mobile (`D:\ars\easyshopping-mobile-new`)

```
App.js                              # App shell — StatusBar + gesture-handler + AppNavigator
index.js                            # Expo entry (registerRootComponent)
app.json                            # Expo config; extra.apiBaseUrl optional override
package.json                        # Deps below — NO new deps added across batches
mobile-app-prd.md                   # THIS FILE
PLAYSTORE_CHECKLIST.md              # (pre-existing, untouched)
AGENTS.md / CLAUDE.md               # (pre-existing, untouched)

src/
  api/
    client.js                       # axios instance + bearer interceptor + 401 handler + extractError
    auth.js                         # login, register, forgotPassword, resetPassword, changePassword, logout, me, resendOtp
    products.js                     # fetchCategories, fetchBanners, fetchFeaturedProducts, fetchNewArrivals, fetchProducts, fetchProductDetails
    cart.js                         # fetchCart, addToCart, removeCartItem, syncCart
    wishlist.js                     # fetchWishlist, addToWishlist, removeWishlist, checkWishlist
    orders.js                       # fetchOrders, fetchOrderDetail, fetchInvoice, placeOrder, cancelOrder, returnOrder
    addresses.js                    # fetchAddresses, createAddress, updateAddress, setDefaultAddress, deleteAddress
    user.js                         # fetchMe, updateMe
    settings.js                     # fetchShippingSettings
    contact.js                      # submitContact
    reviews.js                      # fetchReviews, submitReview

  theme/
    colors.js, typography.js, spacing.js, radius.js, shadows.js, paperTheme.js, index.js

  components/
    Screen.js                       # SafeAreaView + optional ScrollView
    Button.js                       # variants: primary | ghost | dark | danger | outlineDanger; sizes: sm|md|lg; icon, iconRight, pill, block, loading
    Badge.js                        # tones: primary|gold|success|danger|warning|info|muted; solid flag
    PriceTag.js                     # exports formatPrice('Rs. N') + <PriceTag price discountPrice size accent />
    EmptyState.js                   # icon + title + message + actionLabel/onAction
    Alert.js                        # tones: success|danger|warning|info — pill with icon
    Skeleton.js                     # plain rectangle placeholder
    SectionHeader.js                # eyebrow + title + subtitle + optional action
    ProductCard.js                  # used in grid lists; image, discount badge, eyebrow, name, price + "+" add button
    CategoryTile.js                 # tinted icon + name, used on Home & Categories
    QuantityStepper.js              # − N +, clamped to [min, max]

  context/
    AuthContext.js                  # token+user state, persisted to AsyncStorage; signIn/signUp/signOut/refreshUser; setUnauthorizedHandler hook
    CartContext.js                  # items+count+subtotal; add/remove/updateQuantity/clear/refresh; auto-refreshes on auth change

  navigation/
    AppNavigator.js                 # PaperProvider + NavigationContainer + Bottom tabs (Home | Shop | Categories | Account)
                                    # WARNING: NOT YET UPDATED FOR BATCH 2 — see §8 for required changes

  screens/
    auth/
      LoginScreen.js, RegisterScreen.js, ForgotPasswordScreen.js, ResetPasswordScreen.js
    home/
      HomeScreen.js                 # hero, features strip, categories, featured, new arrivals, CTA
    shop/
      ProductListScreen.js          # search + sort + price filter + category filter + pagination
      ProductDetailScreen.js        # gallery, qty stepper, wishlist heart, related, sticky CTA, reviews list
      CategoriesScreen.js           # 3-col grid, navigates to ProductList
    profile/
      ProfileStubScreen.js          # Batch-1 placeholder; KEPT AS FALLBACK while Batch 2 nav is unwired
      ProfileScreen.js              # Batch 2 — full edit + nav to subsections
      ChangePasswordScreen.js       # Batch 2
      AddressListScreen.js          # Batch 2 — list, set default, delete, edit
      AddressFormScreen.js          # Batch 2 — create/edit, tag pills, default toggle
    cart/
      CartScreen.js                 # Batch 2 — items, stepper, sticky summary
    checkout/
      CheckoutScreen.js             # Batch 2 — address radio + payment radio + notes + summary
      OrderSuccessScreen.js         # Batch 2 — confirmation
    orders/
      OrdersScreen.js               # Batch 2 — paginated list with status badge
      OrderDetailScreen.js          # Batch 2 — timeline, items, address, payment, cancel/return actions
      InvoiceScreen.js              # Batch 2 — printable-style view (no PDF export)
    wishlist/
      WishlistScreen.js             # Batch 2

  # NOT YET CREATED (Batch 2 remainder):
  # screens/support/SupportScreen.js
  # screens/support/ContactScreen.js
  # screens/static/AboutScreen.js, PrivacyScreen.js, TermsScreen.js, ShippingScreen.js, ReturnsScreen.js
```

**Dependencies (package.json, unchanged from initial repo state — DO NOT add without asking):**
- `@react-native-async-storage/async-storage 2.2.0`
- `@react-navigation/bottom-tabs ^7.16.1`, `native ^7.2.4`, `native-stack ^7.15.1`
- `axios ^1.16.1`
- `expo ~54.0.33`, `expo-constants ~18.0.13`, `expo-image ~3.0.11`, `expo-status-bar ~3.0.9`
- `react 19.1.0`, `react-native 0.81.5`
- `react-native-gesture-handler ~2.28.0`, `react-native-paper ^5.15.2`, `react-native-reanimated ~4.1.1`, `react-native-safe-area-context ~5.6.0`, `react-native-screens ~4.16.0`

### 6.2 API (`C:\Apache24\htdocs\ars\api\v1`)

**New / modified for Batch 2** (other files unchanged):

| Path | Change |
|---|---|
| `controllers/OrderController.php` | Added `returnOrder($params)` method. Mirrors legacy `api/return-order.php` (delivered + 5-day window), inserts `order_status_history` entry. |
| `controllers/ReviewController.php` | **NEW.** `index` (paginated approved reviews + avg) and `store` (upsert, 1-per-user-per-product, status starts `pending`). |
| `controllers/WishlistController.php` | `check()` now returns `{ wishlisted, wishlist_id }` (was just `wishlisted`) so the product detail heart can DELETE without an extra round-trip. |
| `index.php` | Registered: `POST /orders/{id}/return`, `GET /products/{id}/reviews`, `POST /products/{id}/reviews`. |

No DB migrations needed — all changes use existing tables (`product_reviews`, `wishlists`, `orders`, `order_status_history`).

---

## 7. Batch breakdown

### Batch 1 — Foundation, Auth, Browse ✅ DONE

**Scope.** Theme, shared UI kit, API client with JWT interceptor, AuthContext, four auth screens, Home / ProductList / ProductDetail / Categories, navigation shell.

**Files delivered.** 35 (see §6.1 above for the breakdown — everything outside the "Batch 2" comments).

**Decisions baked in.**
1. **OTP-on-register skipped** — matches actual API behavior. Register → success message → auto-login attempt.
2. **System fonts** instead of Google Fonts to avoid a dep install. Swap point clearly marked in `theme/typography.js`.
3. **Token storage = AsyncStorage** (already a dep).
4. **Guest cart = login required.** Mirrors web's `loginRequiredModal`. Add-to-cart and wishlist actions on guest sessions prompt sign-in.
5. **Solid primary buttons** instead of the website's gradient. The visual difference is small; adding `expo-linear-gradient` would require a dep install. Mark for Batch 3 if the user wants the gradient.

**Known cosmetic gaps from Batch 1.**
- No gradient on primary CTAs.
- No custom fonts (Fraunces / DM Sans).
- Particle/canvas backgrounds on web hero are not reproduced on mobile (intentionally — too heavy).
- Cat icon mapping is a small static lookup (`Electronics → memory`, etc.); unknown categories fall back to `category` icon.

### Batch 2 — Commerce + Account 🟡 PARTIAL

**Scope.** Add 2 API endpoints, write all remaining customer screens, wire navigation, add CartContext for tab badge.

**Done so far (15 files in mobile + 4 file changes in PHP).**

API:
- `OrderController::returnOrder` method
- `ReviewController` controller (new)
- `WishlistController::check` returns `wishlist_id`
- 3 new routes registered in `api/v1/index.php`

Mobile API helpers (6 new):
- `orders.js`, `addresses.js`, `user.js`, `settings.js`, `contact.js`, `reviews.js`

Mobile state:
- `context/CartContext.js`

Mobile screens (10 new):
- `cart/CartScreen.js`
- `checkout/CheckoutScreen.js`, `checkout/OrderSuccessScreen.js`
- `orders/OrdersScreen.js`, `orders/OrderDetailScreen.js`, `orders/InvoiceScreen.js`
- `profile/ProfileScreen.js`, `profile/ChangePasswordScreen.js`, `profile/AddressListScreen.js`, `profile/AddressFormScreen.js`
- `wishlist/WishlistScreen.js`

**Remaining work in Batch 2 (must complete to reach feature parity).**

1. **Support + Contact screens.**
   - `src/screens/support/SupportScreen.js` — FAQ list mirroring the 8 Q&A from `support.php`. Static content; no API call. Use `SectionHeader` + accordion or flat list of cards. Include the same questions as the web's `FAQPage` JSON-LD.
   - `src/screens/support/ContactScreen.js` — auth-required form with `subject` and `message` fields; calls `POST /contact` via `src/api/contact.js`. On submit, show success and clear form. Use `Alert` for error/success states.

2. **Static pages.** Five screens that render plain markdown-style content from the corresponding `.php` files. Web sources to mirror verbatim where reasonable: `about.php`, `privacy.php`, `terms.php`, `shipping.php`, `returns.php`. Each screen uses `Screen` + `ScrollView` + a `Card`-style container + section headings.
   - `src/screens/static/AboutScreen.js`
   - `src/screens/static/PrivacyScreen.js`
   - `src/screens/static/TermsScreen.js`
   - `src/screens/static/ShippingScreen.js`
   - `src/screens/static/ReturnsScreen.js`

3. **Navigation wiring (CRITICAL — none of Batch 2 is reachable without this).**
   Update `src/navigation/AppNavigator.js`:
   - Wrap the tree in `<CartProvider>` (inside `<AuthProvider>`).
   - Add a new bottom tab **Cart** between Shop and Account; show a badge using `useCart().count`.
   - Inside the `AccountStackNavigator`, when `isAuthenticated === true`, replace `ProfileStub` with the full `ProfileScreen` and add these stack routes:
     - `Orders` → `OrdersScreen`
     - `OrderDetail` → `OrderDetailScreen`
     - `Invoice` → `InvoiceScreen`
     - `Wishlist` → `WishlistScreen`
     - `Addresses` → `AddressListScreen`
     - `AddressForm` → `AddressFormScreen`
     - `ChangePassword` → `ChangePasswordScreen`
     - `Support` → `SupportScreen`
     - `Contact` → `ContactScreen`
     - `About`, `Privacy`, `Terms`, `Shipping`, `Returns` → static screens
   - Add to the Shop stack: `Checkout` → `CheckoutScreen`, `OrderSuccess` → `OrderSuccessScreen` (or put them on a fresh root-level stack so they're reachable from the Cart tab too).
   - Verify cross-tab navigations work: `navigation.navigate('Account', { screen: 'Orders' })` from `OrderSuccessScreen`, etc.

4. **Delete `ProfileStubScreen.js`** once `ProfileScreen` is wired and verified. (Keeping it around right now so the app doesn't break mid-batch.)

5. **Manual smoke test** through this flow on a real device or emulator:
   - Register → login → browse → add to cart → cart updates → checkout (add address if none) → place order (COD) → order success → order detail → cancel order → wishlist (add/remove) → change password → logout.

### Batch 3 — Polish, deferred items 🚫

Items that need a user decision before implementing:

1. **eSewa payment proof upload.** Web supports image upload on checkout. Mobile needs either:
   - a new endpoint `POST /orders/{id}/payment-proof` (multipart) and a follow-up screen after `OrderSuccess`, OR
   - rework `POST /orders` to multipart (riskier — changes existing contract).
   Recommend the new endpoint approach. Until done, mobile eSewa orders are accepted by the API but no proof is captured.

2. **Reviews submission UI.** Backend is ready (`POST /products/{id}/reviews`). Need:
   - A "Write a review" button on `ProductDetailScreen` (auth-gated; only show if user has a delivered order containing this product? — web does not enforce this, only `order_id` is optional).
   - Modal with star picker + comment field.
   - On submit, show "pending approval" notice.

3. **Fonts.** Add `@expo-google-fonts/fraunces` + `@expo-google-fonts/dm-sans`, load in `App.js` via `useFonts`, swap `displayFamily` / `bodyFamily` in `theme/typography.js`.

4. **Gradients.** Add `expo-linear-gradient`, change `Button` `variant="primary"` to render the gradient (ember → gold). Touch the price card on `ProductDetailScreen` and the hero CTA on `HomeScreen` for parity.

5. **Cascading address selector.** Replicate `public/assets/js/nepal-data.js` cascading province → district → municipality dropdowns. Ship `src/data/nepal.json` extracted from the JS file. Replace plain text inputs in `AddressFormScreen` with selects (Paper `Menu` or a custom bottom-sheet picker).

6. **Push notifications.** Order status changes (`order_status_history` already exists). Would require Expo Notifications + a server-side webhook.

7. **Order tracking refinements.** Web's `order.php` shows additional fields (`location_updated_at`, courier info). The API `OrderController::show` returns the full row; the mobile screen could surface more if useful.

8. **Web parity TODOs that need explicit user sign-off:**
   - "Today's Deal" (`todays-deal.php`) — currently no equivalent; deals are reachable via Shop > deals filter. Add a dedicated screen if the user wants the same daily-highlight UX.
   - Reviews + ratings as a sortable column on Shop. Currently the `/products` response includes `rating` and `review_count` but the mobile UI does not surface them in the grid.

### Beyond Batch 3 — explicitly out of scope unless asked

- Admin pages (`admin/*` on the web). Not customer-facing.
- PWA / Service Worker equivalents. Native handles offline differently.
- The website's `sitemap.php`, `robots.txt`, OG-image / schema injection. Server concerns only.

---

## 8. How to resume — next-action playbook

**Open this section first when continuing the work.**

1. **Read `mobile-app-prd.md` (this file) end-to-end.** Verify §6 still matches reality with:
   ```powershell
   Get-ChildItem D:\ars\easyshopping-mobile-new\src -Recurse -File | Select-Object FullName
   ```

2. **Check the task list** — current state at time of writing:
   - #11 Batch 2: API endpoints — **completed**
   - #12 Batch 2: Cart + Checkout + Orders — **completed**
   - #13 Batch 2: Profile + Addresses + Wishlist — **completed**
   - #14 Batch 2: Static + Support pages — **pending** (next)
   - #15 Batch 2: Wire navigation — **pending** (BLOCKING parity)

3. **Build remaining Batch 2 screens (Task #14).**
   - 7 files to write (see §7 Batch 2 remaining work, items 1 and 2).
   - All static — no new API calls except `ContactScreen` calling `submitContact`.

4. **Wire navigation (Task #15) — this is the unblocking step.**
   Concretely, edit `src/navigation/AppNavigator.js`:
   - Import: `CartProvider, useCart`, and all new screens.
   - Wrap inside `<AuthProvider>`: `<CartProvider>{...}</CartProvider>`.
   - Bottom tabs: `HomeTab | Shop | Cart | CategoriesTab | Account` (or drop CategoriesTab and keep 4 tabs — categories are reachable from Home + Shop filters; the user originally asked for a "Categories" page so leave it).
   - Cart tab options: `tabBarBadge: count > 0 ? count : undefined` via a wrapper component that calls `useCart`.
   - `AccountStack` when authed: replace `ProfileStub` with `ProfileScreen` + all subroutes listed in §7.
   - Add `Checkout` and `OrderSuccess` to the Shop stack (or as a separate modal stack at the root).
   - Smoke-test the deep nav from Home → Shop → ProductDetail → Add → Cart tab → Checkout → OrderSuccess → "View Order" navigates to `Account > OrderDetail`.

5. **Verify the build runs.**
   ```powershell
   cd D:\ars\easyshopping-mobile-new
   npx expo start
   # then a/i/w for android/ios/web
   ```
   First load on a clean device: should land on Home (guest). Tapping "Account" shows Login. Register flow → login → cart/orders/wishlist all reachable.

6. **Smoke checklist** (post-wiring):
   - [ ] Guest can browse Home + Shop + Categories + ProductDetail
   - [ ] Guest "Add to cart" prompts login
   - [ ] Register → activated immediately → auto-login
   - [ ] Login with email or phone
   - [ ] Forgot/reset password
   - [ ] Add product to cart from Home / Shop / Product detail
   - [ ] Cart tab shows badge with count
   - [ ] Cart stepper updates quantity; remove works
   - [ ] Checkout requires address; create one inline
   - [ ] Place COD order → OrderSuccess → "View Order" opens OrderDetail
   - [ ] Cancel a pending order from OrderDetail
   - [ ] (Manually mark an order delivered in DB) → return button appears; tap → status changes to "Return Requested"
   - [ ] Wishlist add/remove from product detail + wishlist screen
   - [ ] Profile edit name/email/address
   - [ ] Change password
   - [ ] Address: create / edit / set default / delete
   - [ ] Contact form submits successfully
   - [ ] Static pages render

7. **Once Batch 2 is fully verified, surface Batch 3 decisions to the user** (eSewa proof, reviews submit, fonts, gradients, Nepal cascading address). Do not start them without confirmation — they each have trade-offs the user should weigh.

---

## 9. Conventions & gotchas to keep consistent

- **No new dependencies without asking.** Several batch decisions rely on this (skipping gradients, fonts).
- **Token attached automatically.** Never set `Authorization` manually — the axios interceptor in `client.js` does it.
- **401 handler** clears the token + user in storage and triggers `setUnauthorizedHandler` (wired in `AuthContext`). UI will rerender into the unauthenticated view.
- **Errors:** always extract via `extractError(err, 'fallback')` from `api/client.js` — handles `errors` object and `message` field consistently.
- **Cart state is server-side.** Don't keep a local mirror — `CartContext.refresh()` is the authoritative call.
- **Prices:** never trust client. The server recalculates at `POST /orders`. Display with `formatPrice(value)` from `components/PriceTag.js` (Rs. N, en-IN locale separator).
- **Images:** `expo-image` with `contentFit="contain"`. Product images come from `product_image_url(...)` server-side; mobile receives absolute URLs.
- **Stock badge** colors: green pill if in stock, red solid if out — uses `Badge` tone `success` vs `danger` solid.
- **Web mobile sticky bars** are mirrored at the bottom of `ProductDetailScreen` (heart + qty + Add-to-Cart). Future screens with primary actions should follow the same pattern.
- **Date formatting:** keep using `new Date(iso).toLocaleDateString()` / `toLocaleString()`. The API returns standard MySQL timestamps which `Date` parses correctly on iOS and Android.
- **Navigation deep nav across tabs:** `navigation.navigate('TabName', { screen: 'RouteName', params: {...} })`.
- **`useFocusEffect`** on list screens that need to refresh after mutation in another screen (e.g., AddressList after AddressForm).
- **Do not call `react-native-paper`'s `TextInput.Icon` without an `onPress` if you want it interactive.** Eye toggles are passed `onPress={() => setShow(s => !s)}` and use `eye`/`eye-off` icon names (MaterialCommunityIcons defaults).

---

## 10. Run commands

```powershell
# Mobile
cd D:\ars\easyshopping-mobile-new
npm install                          # only needed once; no new deps were added in either batch
npx expo start                       # then press a, i, or w

# To target a local PHP server instead of production:
#   Edit app.json -> "expo": { "extra": { "apiBaseUrl": "http://10.0.2.2/ars/api/v1" } }   (Android emulator)
#   Or "http://localhost/ars/api/v1"                                                        (iOS simulator)

# API smoke
curl https://easyshoppingars.com/api/v1/products
curl -X POST https://easyshoppingars.com/api/v1/auth/login -H "Content-Type: application/json" -d '{"login_id":"<phone-or-email>","password":"<pw>"}'

# Direct test of newly added endpoints (Batch 2)
curl https://easyshoppingars.com/api/v1/products/1/reviews
curl -X POST https://easyshoppingars.com/api/v1/orders/1/return -H "Authorization: Bearer <token>"
```

---

## 11. Changelog (so far)

**Batch 1** — Foundation + Auth + Browse (35 files):
- `src/theme/*` (7) ; `src/components/*` (11) ; `src/api/{client,auth,products,cart,wishlist}.js` (5) ; `src/context/AuthContext.js` ; `src/navigation/AppNavigator.js` ; `src/screens/auth/*` (4) ; `src/screens/home/HomeScreen.js` ; `src/screens/shop/{ProductList,ProductDetail,Categories}Screen.js` (3) ; `src/screens/profile/ProfileStubScreen.js` ; `App.js`.

**Batch 2 — in progress** (4 PHP changes + 17 mobile files written; navigation wiring pending):
- PHP: `api/v1/controllers/OrderController.php` (added `returnOrder`), `api/v1/controllers/ReviewController.php` (new), `api/v1/controllers/WishlistController.php` (check returns id), `api/v1/index.php` (3 new routes).
- Mobile API: `src/api/{orders,addresses,user,settings,contact,reviews}.js`.
- Mobile state: `src/context/CartContext.js`.
- Mobile screens: `src/screens/cart/CartScreen.js`, `src/screens/checkout/{CheckoutScreen,OrderSuccessScreen}.js`, `src/screens/orders/{OrdersScreen,OrderDetailScreen,InvoiceScreen}.js`, `src/screens/profile/{ProfileScreen,ChangePasswordScreen,AddressListScreen,AddressFormScreen}.js`, `src/screens/wishlist/WishlistScreen.js`.
- **Not yet:** Support + Contact + 5 static screens; nav wiring; CartProvider in App.

**Batch 3 — not started.** See §7 Batch 3 for the decision queue.
