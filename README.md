# Sudha Hotel — MERN Booking System

A full MongoDB + Express + React + Node implementation of the Sudha Hotel Stitch designs
(homepage/search, live room availability, booking checkout, admin dashboard, and a
super-admin CRUD console). All dynamic behavior — pricing, tax, promo codes, live
room availability, occupancy stats, booking status, CRUD for rooms/menu/venues — is
computed and enforced by the Express/MongoDB backend. The React frontend is a thin
client that renders whatever the API returns and never invents numbers on its own.

## Project layout

```
sudha-hotel-mern/
├── backend/     Express API + MongoDB models (source of truth for all data & logic)
└── frontend/    Vite + React + Tailwind client, styled to match the Stitch design system
```

## Prerequisites

- Node.js 18+ and npm
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)
- Internet access to `npm install` dependencies (this project was authored in an
  offline sandbox, so dependencies were never installed/tested there — install and
  smoke-test locally before deploying)

## 1. Backend setup

```bash
cd backend
cp .env.example .env      # edit MONGO_URI / JWT_SECRET / admin passwords as needed
npm install
npm run seed               # wipes & reseeds rooms, menu, venues, reviews, settings, admins
npm run dev                # starts the API on http://localhost:5000 with nodemon
```

Seeded accounts (override the passwords in `.env` before going to production):
- **Admin**: `admin` / value of `SEED_ADMIN_PASSWORD` in `.env`
- **Super Admin** (full CRUD console access): `superadmin` / value of `SEED_SUPERADMIN_PASSWORD`

### Key API endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/rooms?checkIn=&checkOut=&adults=` | public | Live room list with computed availability & price |
| GET | `/api/rooms/:id` | public | Single room + live availability |
| POST/PUT/DELETE | `/api/rooms` `/api/rooms/:id` | admin | Room inventory CRUD |
| POST | `/api/bookings/quote` | public | Server-computed fare breakdown (tax, promo, total) |
| POST | `/api/bookings` | public | Creates a booking after re-validating availability |
| POST | `/api/bookings/:id/confirm-payment` | public | Marks a booking paid (simulated Razorpay callback) |
| GET/PUT | `/api/bookings` `/api/bookings/:id/status` | admin | List/manage bookings, check-in/check-out/cancel/mark paid |
| GET/POST/PUT/DELETE | `/api/menu` | mixed | Restaurant menu CRUD |
| GET/POST/PUT/DELETE | `/api/venues` | mixed | Banquet/event venue CRUD |
| GET/POST/PUT/DELETE | `/api/reviews` | mixed | Guest reviews (public submit, admin moderation) |
| GET/PUT | `/api/settings` | mixed | Hotel-wide settings (address, policies, GSTIN, geo) |
| GET/POST/PUT | `/api/inquiries` | mixed | Guest inquiry inbox for the admin dashboard |
| GET | `/api/dashboard/summary` | admin | Revenue, occupancy, today's moves, active queue |
| POST | `/api/auth/login` | public | Admin/super-admin login, returns a JWT |

Business logic worth knowing about:
- **Availability** (`src/utils/availability.js`) counts overlapping active bookings per
  room and subtracts from `totalUnits` — this is what prevents overbooking.
- **Pricing** (`src/utils/pricing.js`) computes nights, applies server-side promo codes
  (`HIMACHAL10` = 10% off, `WELCOME500` = ₹500 off), then adds each room's GST
  (`taxPercent`, default 12%). The frontend only ever sends a promo *code string* —
  it can never set its own discount amount.
- Booking creation re-runs the same availability + pricing check the `/quote` endpoint
  used, so a stale quote can never be used to book a sold-out room at a stale price.

## 2. Frontend setup

```bash
cd frontend
cp .env.example .env       # point VITE_API_URL at your backend if not localhost:5000
npm install
npm run dev                 # starts Vite on http://localhost:5173
```

Visit `http://localhost:5173` for the guest-facing site, or `http://localhost:5173/admin/login`
for the admin portal.

## Notes on the Razorpay integration

The checkout flow includes a **simulated** Razorpay payment step (see the comment block
in `frontend/src/pages/Checkout.jsx` → `handleProceedToPay`). It creates a real booking
via the backend, then immediately calls `/api/bookings/:id/confirm-payment` with mock
IDs so you can exercise the full flow without live payment credentials. To go live:

1. Load the Razorpay Checkout script and create a real order server-side
   (Razorpay Orders API) inside `bookingController.createBooking` or a new endpoint.
2. Open `Razorpay.open()` on the client with that order id.
3. In the success handler, call `confirmPayment(booking._id, { razorpayOrderId, razorpayPaymentId })`
   with the real IDs Razorpay returns, and verify the payment signature server-side
   before marking the booking paid.

## Design system

`frontend/tailwind.config.js` encodes the exact color, spacing, and typography tokens
from the original Stitch `DESIGN.md` ("Himalayan Sanctuary" theme — deep pine primary,
terracotta accent, Playfair Display headlines, Plus Jakarta Sans body text) so the
rebuilt pages stay visually faithful to the design export.

## What's mock vs. real

- Room photos and the banquet venue photo use royalty-free Unsplash URLs as placeholders —
  swap `images`/`image` fields via the Master Admin Console or directly in MongoDB.
- The map embed on the homepage is a placeholder panel — wire in Google Maps/Mapbox
  using the `latitude`/`longitude` fields already stored in Settings.
- Razorpay payment is simulated as described above.
- Everything else (rooms, pricing, availability, bookings, menu, venues, reviews,
  inquiries, dashboard analytics, settings, auth) is real, backend-driven, and stored
  in MongoDB.
