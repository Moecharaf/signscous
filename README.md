# Signscous Website

Landing page for `signscous.com`, built with React + Vite + Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

## Run frontend + API locally

1. Create `.env` in project root from `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:8787
```

2. Start API (Terminal 1):

```bash
npm run api:dev
```

3. Start frontend (Terminal 2):

```bash
npm run dev
```

4. API base URL: `http://localhost:8787`

## Notes

- Use `public/signscous-logo.png` for your main production logo (SVG fallback remains supported in code).
- Homepage layout is in `src/App.jsx`.

## Yard Signs End-to-End Artifacts

- Database schema: `backend/sql/yard_signs_schema.sql`
- API contract (OpenAPI): `backend/openapi/yard_signs_api.yaml`
- React flow structure: `docs/yard-signs-react-structure.md`
- Frontend API modules: `src/features/**/api/*.js`
- Route plan: `src/app/router.jsx`

## Auth and Admin (Frontend Mock)

- Login route: `/login`
- Signup route: `/signup`
- Admin dashboard route: `/admin` (protected)
- Demo admin credentials:
	- Email: `admin@signscous.com`
	- Password: `admin123`

## Next-Step Progress (Implemented)

- API-first auth flow with JWT token support (fallback to mock local auth)
	- `src/features/auth/api/authApi.js`
	- `src/shared/auth/tokenStore.js`
	- `src/shared/auth/AuthContext.jsx`
- Admin API hooks and status management (fallback to mock order store)
	- `src/features/admin/api/adminApi.js`
	- `src/features/admin/pages/AdminDashboardPage.jsx`
- Customer account dashboard route
	- `/account/orders`
	- `src/features/account/pages/AccountOrdersPage.jsx`

## Backend API Server

- Server entry: `backend/server/src/index.js`
- Auth: JWT-based endpoints (`/v1/auth/*`)
- Account orders: `/v1/account/orders`
- Admin orders: `/v1/admin/orders`, `/v1/admin/orders/:orderNumber/status`
- Yard Signs quote/cart/checkout/order endpoints included for end-to-end flow
