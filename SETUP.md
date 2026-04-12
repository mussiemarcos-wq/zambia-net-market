# MarketHub - Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted)

## Quick Start

### 1. Install dependencies

```bash
cd marketplace
npm install
```

### 2. Configure database

Edit `.env` and set your PostgreSQL connection string:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/marketplace?schema=public"
```

### 3. Create database and run migrations

```bash
# Create the database tables
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Seed the database

```bash
npx tsx prisma/seed.ts
```

This creates:
- 8 categories with subcategories
- Admin user (phone: `+1000000000`, password: `admin123`)
- Demo seller (phone: `+1111111111`, password: `seller123`)
- 8 sample listings across categories

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

| Role | Phone | Password |
|------|-------|----------|
| Super Admin | +1000000000 | admin123 |
| Demo Seller | +1111111111 | seller123 |

## Project Structure

```
marketplace/
├── prisma/
│   ├── schema.prisma      # Database schema (13 models)
│   └── seed.ts             # Database seeder
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Login, register, logout, me
│   │   │   ├── listings/   # CRUD, search, report, whatsapp-click
│   │   │   ├── categories/ # List, seed
│   │   │   ├── favourites/ # Add/remove favourites
│   │   │   └── users/      # Public profiles
│   │   ├── admin/          # Admin moderation panel
│   │   ├── dashboard/      # Seller dashboard
│   │   ├── favourites/     # Saved listings
│   │   ├── listings/
│   │   │   ├── [id]/       # Listing detail
│   │   │   └── new/        # Create listing
│   │   ├── search/         # Search & browse
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   ├── components/         # Shared components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── AuthModal.tsx
│   │   ├── ListingCard.tsx
│   │   └── CategoryGrid.tsx
│   └── lib/                # Utilities
│       ├── db.ts           # Prisma client
│       ├── auth.ts         # JWT auth helpers
│       ├── api.ts          # API response helpers
│       ├── store.ts        # Zustand state
│       ├── constants.ts    # Categories, limits
│       └── utils.ts        # Formatting, WhatsApp links
├── .env                    # Environment variables
└── PRODUCT_BLUEPRINT.md    # Full product specification
```

## Key Features (MVP)

- **Auth:** Phone + password registration/login with JWT
- **Listings:** Create, edit, delete with categories & subcategories
- **Search:** Full-text search with filters (category, price, condition, location)
- **Favourites:** Save/unsave listings
- **WhatsApp:** Contact sellers via WhatsApp with pre-filled message
- **Dashboard:** Seller stats, listing management
- **Admin:** Moderation panel with reports, user management
- **Responsive:** Mobile-first design with Tailwind CSS

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Listings
- `GET /api/listings` - Search/list (with filters)
- `POST /api/listings` - Create listing
- `GET /api/listings/:id` - Get listing detail
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `POST /api/listings/:id/whatsapp-click` - Track WhatsApp click
- `POST /api/listings/:id/report` - Report listing

### Categories
- `GET /api/categories` - All categories with subcategories
- `POST /api/categories/seed` - Seed categories

### Favourites
- `GET /api/favourites` - User's saved listings
- `POST /api/favourites/:listingId` - Save listing
- `DELETE /api/favourites/:listingId` - Unsave listing

### Users
- `GET /api/users/:id` - Public profile

## Next Steps (Phase 2)

See `PRODUCT_BLUEPRINT.md` for the full roadmap including:
- Payment integration (boosts, subscriptions)
- Image upload to cloud storage
- Push notifications
- Business profiles
- Verified seller badges
- React Native mobile app
