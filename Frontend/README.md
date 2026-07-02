# FoodExpress — Frontend

A complete Bootstrap 5 + vanilla JavaScript frontend for a Node.js/Express/MongoDB
food delivery backend. No frameworks, no dummy data — every page talks to your
API through the Fetch API.

## Quick start

1. Open `js/api.js` and set `API_BASE_URL` to your backend, e.g.:
   ```js
   const API_BASE_URL = "http://localhost:5000/api";
   ```
2. Serve the `Frontend` folder with any static server (needed so `fetch()` isn't
   blocked by `file://` restrictions), e.g.:
   ```bash
   npx serve .
   # or
   python3 -m http.server 5500
   ```
3. Make sure your backend has CORS enabled for the frontend's origin.
4. Open `index.html` in the browser.

## How it's wired together

- **`js/api.js`** — single source of truth for all HTTP calls. Every request
  goes through `apiRequest()`, which attaches `Authorization: Bearer <token>`
  automatically when a JWT is present in `localStorage`, and redirects to
  `login.html` on a 401.
- **`js/auth.js`** — renders the shared navbar (injected into
  `#fe-navbar-placeholder` on every page) and handles login/register.
- **`js/menu.js` / `cart.js` / `wishlist.js` / `orders.js` / `profile.js` / `admin.js`**
  — one module per feature, each calling the matching backend routes.
- **`requireAuth()`** guards customer pages (cart, wishlist, orders, profile);
  **`requireAdmin()`** guards `admin.html` and redirects non-admins.

## ⚠️ Field-name assumptions to double-check against your schema

Because the exact shape of your API responses wasn't provided, a few files
make reasonable assumptions and defensively unwrap common response shapes
(`{data: [...]}`, `{items: [...]}`, plain arrays, etc.). Search for the
`NOTE ON RESPONSE SHAPE` comments in these files and adjust field names if
your backend differs:

- `js/menu.js` → `extractList()`, `extractMeta()` (foods list + pagination)
- `js/cart.js` → `extractCartItems()`, `cartItemId()` (cart item id used for
  PUT/DELETE — could be the cart-item's own `_id` or the food's `_id`)
- `js/wishlist.js` → `extractWishlistItems()`
- `js/orders.js` → `extractOrders()`
- `js/profile.js` → `PROFILE_UPDATE_ENDPOINT` (guessed as `/auth/profile`;
  change if your route is different, e.g. `/users/me`)

Everything else — auth, foods CRUD, cart, wishlist, orders, reviews, and the
four admin endpoints — is wired exactly to the routes you listed.

## Folder structure

```
Frontend/
├── index.html / login.html / register.html / menu.html
├── cart.html / wishlist.html / orders.html / profile.html / admin.html
├── css/  (style.css is global; the rest are page-specific)
├── js/   (api.js loads first on every page, then auth.js, then the page module)
├── images/
└── assets/
```
